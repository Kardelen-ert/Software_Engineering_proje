def generate_recommendation(emotion, stress):

    rec=[]

    if emotion.anxiety > 0.5:
        rec.append("Kaygı seviyen yüksek. Yürüyüş yapmayı deneyebilirsin ya da yeşil çay içebilirsin.")

    if emotion.sad > 0.5:
        rec.append("Seni mutlu eden anını düşünmeni tavsiye ederim.")

    if emotion.stress > 6:
        rec.append("Stres seviyen çok yüksek. Senden değerli bir şey yok. Stres azaltacak aktivite yapmak ister misin?")

    if not rec:
        rec.append("genel durum dengeli duruyor. Mükemmelsin!")

    return rec