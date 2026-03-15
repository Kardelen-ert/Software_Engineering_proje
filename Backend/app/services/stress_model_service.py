import numpy as np
from sklearn.linear_model import LinearRegression

X=np.array([
    [8, 2],
    [7, 2],
    [5, 1],
    [4, 1],
    [6, 2]
])

y=np.array([2, 3, 7, 8, 5])

model = LinearRegression()
model.fit(X,y)

def predict_stress(entry):
    data = np.array([[entry.sleep_hours, entry.water_liters]])
    stress = model.predict(data)

    return float(stress[0])

def predict_stress_batch(entries):
    data= [[e.sleep_hours, e.water_liter] for e in entries]
    data = np.array(data)
    stresses = model.predict(data)


    return stresses.tolist()
