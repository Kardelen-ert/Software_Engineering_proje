import random

def generate_recommendation(emotion, stress):
    rec = []

    anxiety_recommendations = [
        "Kaygı seviyen şu an biraz yüksek görünüyor. Öncelikle bulunduğun ortamda kısa bir mola verip 5 dakika boyunca yavaş ve derin nefes almayı deneyebilirsin. Ardından açık havada kısa bir yürüyüş yapmak ya da şekersiz ılık bir içecek içmek zihnini toparlamana yardımcı olabilir.",
        
        "Şu an zihninde çok fazla düşünce dönüyor olabilir. Kendini rahatlatmak için telefon ve ekranlardan birkaç dakika uzaklaşıp sadece nefesine odaklanmayı deneyebilirsin. İstersen küçük bir not kağıdına seni kaygılandıran şeyi yazıp, kontrol edebileceğin ve edemeyeceğin noktaları ayırman da iyi gelebilir.",
        
        "Kaygılı hissettiğinde beden de buna eşlik eder. Omuzlarını gevşetmek, çeneni sıkmadığını fark etmek ve birkaç dakika sessiz bir ortamda kalmak seni rahatlatabilir. Eğer istersen sevdiğin sakin bir müzik açıp yanında su içerek kendine kısa bir dinlenme alanı oluşturabilirsin."
    ]

    sad_recommendations = [
        "Biraz üzgün hissediyor olabilirsin ve bu tamamen anlaşılır bir durum. Kendine yüklenmeden, seni geçmişte mutlu etmiş bir anıyı düşünmeyi deneyebilirsin. İstersen sevdiğin bir şarkıyı açabilir, rahat bir yere oturup biraz duygularını anlamaya zaman tanıyabilirsin.",
        
        "Üzgün olduğunda duygularını bastırmak yerine onları nazikçe kabul etmek iyi gelebilir. Bugün kendine küçük ama güzel bir iyilik yapmayı deneyebilirsin; örneğin sevdiğin bir içeceği hazırlamak, kısa bir yürüyüşe çıkmak ya da güvende hissettiğin biriyle konuşmak ruh halini biraz hafifletebilir.",
        
        "Şu an iç enerjin düşük olabilir. Böyle zamanlarda kendinden büyük beklentiler istemek yerine küçük adımlara odaklanmak daha iyi olur. Yüzünü yıkamak, pencereyi açıp temiz hava almak, sevdiğin bir fotoğrafa bakmak ya da seni iyi hissettiren bir hatırayı düşünmek duygusal olarak toparlanmana yardımcı olabilir."
    ]

    stress_recommendations = [
        "Stres seviyen oldukça yüksek görünüyor. Öncelikle durup kendine kısa bir mola vermen çok önemli olabilir. Yapman gereken her şeyi bir anda düşünmek yerine, şu an sadece bir sonraki küçük adıma odaklanmayı deneyebilirsin. Bir bardak su içmek, derin nefes almak ve omuzlarını gevşetmek bile etkili bir başlangıç olur.",
        
        "Yoğun stres altında bedenin ve zihnin aynı anda yorulmuş olabilir. Kendini toparlamak için 10 dakikalık kısa bir ara verip ekranlardan uzaklaşabilir, hafif esneme hareketleri yapabilir ya da bulunduğun ortamı değiştirerek biraz temiz hava alabilirsin. Kendine 'hepsini şimdi çözmek zorunda değilim' demeyi dene.",
        
        "Şu an yaşadığın stres seni baskı altında hissettiriyor olabilir ama unutma, senden daha değerli hiçbir şey yok. Eğer mümkünse işlerini önem sırasına koyup en acil olmayanları biraz erteleyebilirsin. Kısa bir yürüyüş, nefes egzersizi veya sevdiğin sakin bir müzikle birkaç dakika dinlenmek stres yükünü azaltmana yardımcı olabilir."
    ]

    anger_recommendations = [
    "Şu an kendini biraz gergin ve öfkeli hissediyor olabilirsin. Bu durumda hemen tepki vermek yerine birkaç dakika durup nefesine odaklanmak sana iyi gelebilir. Bulunduğun ortamdan kısa süreliğine uzaklaşmak da duygularını dengelemeni kolaylaştırır.",
    
    "Öfke yoğun bir duygudur ama kontrol edilebilir. Ellerini gevşetmek, derin nefes almak ve bulunduğun ortamda kısa bir mola vermek seni rahatlatabilir. İstersen hislerini yazıya dökerek de zihnini boşaltabilirsin.",
    
    "Şu an içindeki gerginliği azaltmak için fiziksel bir hareket iyi gelebilir. Kısa bir yürüyüş yapmak, biraz esneme hareketi yapmak veya su içmek bedenini sakinleştirerek öfke seviyeni düşürmeye yardımcı olabilir."
    ]


    if emotion.anxiety > 0.5:
        rec.append(random.choice(anxiety_recommendations))

    if emotion.sad > 0.5:
        rec.append(random.choice(sad_recommendations))

    if emotion.stress > 6:
        rec.append(random.choice(stress_recommendations))

    if emotion.anger > 0.5:
       rec.append(random.choice(anger_recommendations))

    if not rec:
        rec.append(
            "Genel durumun şu an dengeli görünüyor. Bu çok güzel. Yine de bu dengeyi korumak için gün içinde kısa molalar vermen, yeterli su içmen ve kendine küçük dinlenme alanları oluşturman faydalı olabilir."
        )

    return rec
