from __future__ import annotations

import argparse
from dataclasses import dataclass
from pathlib import Path

import numpy as np
import pandas as pd
import torch
from sklearn.metrics import f1_score, precision_score, recall_score
from sklearn.model_selection import train_test_split
from torch.utils.data import Dataset
from transformers import (
    AutoModelForSequenceClassification,
    AutoTokenizer,
    Trainer,
    TrainingArguments,
)


LABEL_COLUMNS = ["happy", "sad", "anger", "anxiety"]
DEFAULT_MODEL_NAME = "dbmdz/bert-base-turkish-cased"


@dataclass
class EmotionDataSplit:
    train: pd.DataFrame
    validation: pd.DataFrame
    test: pd.DataFrame


class EmotionDataset(Dataset):
    def __init__(self, dataframe: pd.DataFrame, tokenizer, max_length: int) -> None:
        self.texts = dataframe["text"].astype(str).tolist()
        self.labels = dataframe[LABEL_COLUMNS].astype(np.float32).values
        self.tokenizer = tokenizer
        self.max_length = max_length

    def __len__(self) -> int:
        return len(self.texts)

    def __getitem__(self, index: int) -> dict[str, torch.Tensor]:
        encoding = self.tokenizer(
            self.texts[index],
            truncation=True,
            padding="max_length",
            max_length=self.max_length,
            return_tensors="pt",
        )
        item = {key: value.squeeze(0) for key, value in encoding.items()}
        item["labels"] = torch.tensor(self.labels[index], dtype=torch.float32)
        return item


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Train a Turkish multi-label emotion model.")
    parser.add_argument("--data-path", type=Path, default=Path("data/emotion_dataset_tr.csv"))
    parser.add_argument("--model-name", type=str, default=DEFAULT_MODEL_NAME)
    parser.add_argument("--output-dir", type=Path, default=Path("models/emotion_model"))
    parser.add_argument("--max-length", type=int, default=128)
    parser.add_argument("--epochs", type=int, default=4)
    parser.add_argument("--batch-size", type=int, default=8)
    parser.add_argument("--learning-rate", type=float, default=2e-5)
    parser.add_argument("--threshold", type=float, default=0.5)
    parser.add_argument("--seed", type=int, default=42)
    return parser.parse_args()


def load_dataset(data_path: Path) -> pd.DataFrame:
    if not data_path.exists():
        raise FileNotFoundError(f"Dataset not found: {data_path}")

    dataframe = pd.read_csv(data_path)
    required_columns = {"text", *LABEL_COLUMNS}
    missing = required_columns.difference(dataframe.columns)
    if missing:
        raise ValueError(f"Dataset is missing columns: {sorted(missing)}")

    dataframe = dataframe.dropna(subset=["text"]).copy()
    dataframe["text"] = dataframe["text"].astype(str).str.strip()
    dataframe = dataframe[dataframe["text"] != ""].reset_index(drop=True)
    return dataframe


def split_dataset(dataframe: pd.DataFrame, seed: int) -> EmotionDataSplit:
    train_df, temp_df = train_test_split(
        dataframe,
        test_size=0.30,
        random_state=seed,
        shuffle=True,
    )
    validation_df, test_df = train_test_split(
        temp_df,
        test_size=0.50,
        random_state=seed,
        shuffle=True,
    )
    return EmotionDataSplit(
        train=train_df.reset_index(drop=True),
        validation=validation_df.reset_index(drop=True),
        test=test_df.reset_index(drop=True),
    )


def build_metrics_fn(threshold: float):
    def compute_metrics(eval_pred):
        logits, labels = eval_pred
        probabilities = 1 / (1 + np.exp(-logits))
        predictions = (probabilities >= threshold).astype(int)
        labels = labels.astype(int)

        return {
            "micro_f1": f1_score(labels, predictions, average="micro", zero_division=0),
            "macro_f1": f1_score(labels, predictions, average="macro", zero_division=0),
            "micro_precision": precision_score(labels, predictions, average="micro", zero_division=0),
            "micro_recall": recall_score(labels, predictions, average="micro", zero_division=0),
        }

    return compute_metrics


def print_split_summary(splits: EmotionDataSplit) -> None:
    print("Dataset summary")
    print(f"  Train: {len(splits.train)}")
    print(f"  Validation: {len(splits.validation)}")
    print(f"  Test: {len(splits.test)}")

    for split_name, split_df in (
        ("Train", splits.train),
        ("Validation", splits.validation),
        ("Test", splits.test),
    ):
        print(f"  {split_name} label totals: {split_df[LABEL_COLUMNS].sum().to_dict()}")


def main() -> None:
    args = parse_args()

    torch.manual_seed(args.seed)
    np.random.seed(args.seed)

    dataframe = load_dataset(args.data_path)
    splits = split_dataset(dataframe, args.seed)
    print_split_summary(splits)

    tokenizer = AutoTokenizer.from_pretrained(args.model_name)
    train_dataset = EmotionDataset(splits.train, tokenizer, args.max_length)
    validation_dataset = EmotionDataset(splits.validation, tokenizer, args.max_length)
    test_dataset = EmotionDataset(splits.test, tokenizer, args.max_length)

    model = AutoModelForSequenceClassification.from_pretrained(
        args.model_name,
        num_labels=len(LABEL_COLUMNS),
        problem_type="multi_label_classification",
    )

    args.output_dir.mkdir(parents=True, exist_ok=True)

    training_args = TrainingArguments(
        output_dir=str(args.output_dir),
        learning_rate=args.learning_rate,
        per_device_train_batch_size=args.batch_size,
        per_device_eval_batch_size=args.batch_size,
        num_train_epochs=args.epochs,
        eval_strategy="epoch",
        save_strategy="epoch",
        logging_strategy="epoch",
        load_best_model_at_end=True,
        metric_for_best_model="micro_f1",
        greater_is_better=True,
        save_total_limit=2,
        report_to="none",
        seed=args.seed,
    )

    trainer = Trainer(
        model=model,
        args=training_args,
        train_dataset=train_dataset,
        eval_dataset=validation_dataset,
        processing_class=tokenizer,
        compute_metrics=build_metrics_fn(args.threshold),
    )

    trainer.train()

    validation_metrics = trainer.evaluate(validation_dataset)
    test_metrics = trainer.evaluate(test_dataset, metric_key_prefix="test")

    trainer.save_model(str(args.output_dir))
    tokenizer.save_pretrained(str(args.output_dir))

    print("\nValidation metrics")
    for key, value in validation_metrics.items():
        print(f"  {key}: {value}")

    print("\nTest metrics")
    for key, value in test_metrics.items():
        print(f"  {key}: {value}")

    print(f"\nModel saved to: {args.output_dir}")


if __name__ == "__main__":
    main()
