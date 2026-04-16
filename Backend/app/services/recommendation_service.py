import random

def generate_recommendation(emotion, stress):
    rec = []

    anxiety_recommendations = [
        "Kaygı seviyen yüksek görünüyor. Kısa bir yürüyüş yapmayı deneyebilirsin.",
        "Biraz derin nefes egzersizi yapman kaygını azaltmana yardımcı olabilir.",
        "Ilık bir yeşil çay içip birkaç dakika sakinleşmeye ne dersin?"
    ]

    sad_recommendations = [
        "Seni mutlu eden bir anını düşünmeni tavsiye ederim.",
        "Sevdiğin bir müziği açıp biraz kendine zaman ayırabilirsin.",
        "Yakın hissettiğin biriyle kısa bir sohbet yapmak iyi gelebilir."
    ]

    stress_recommendations = [
        "Stres seviyen çok yüksek. Kısa bir mola vermeyi deneyebilirsin.",
        "Biraz esneme hareketi ya da hafif egzersiz sana iyi gelebilir.",
        "Kendine nazik davran ve birkaç dakika sadece dinlenmeye odaklan."
    ]

    if emotion.anxiety > 0.5:
        rec.append(random.choice(anxiety_recommendations))

    if emotion.sad > 0.5:
        rec.append(random.choice(sad_recommendations))

    if emotion.stress > 6:
        rec.append(random.choice(stress_recommendations))

    if not rec:
        rec.append("Genel durum dengeli görünüyor. Böyle devam et.")

    return rec
