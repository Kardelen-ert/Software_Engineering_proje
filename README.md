# Software_Engineering_proje
## Backend Geliştirme Notları ve Kurallar

Backend şu anda MVP (Minimum Viable Product) aşamasındadır. Bu aşamada amaç çalışan ve düzenli bir temel mimari oluşturmaktır. Bu nedenle belirlenen klasör yapısının korunması ve kodların doğru klasörlere eklenmesi önemlidir.

### Backend Klasör Yapısı

Backend tarafında modüler bir yapı kullanılmaktadır:

Backend/
- app/
  - main.py
  - routes/
  - models/
  - schemas/
  - services/
  - core/
- requirements.txt

Bu yapı backend kodlarının düzenli ve sürdürülebilir olması için oluşturulmuştur.

Kodlar aşağıdaki yapıya uygun şekilde eklenmelidir:

- **routes/** → API endpointleri burada yazılmalıdır.
- **models/** → Veritabanı modelleri burada tanımlanmalıdır.
- **schemas/** → Request ve response veri yapıları burada tanımlanmalıdır.
- **services/** → İş mantığı (business logic) burada bulunmalıdır.
- **main.py** → Uygulamanın giriş noktasıdır ve router bağlantıları burada yapılır.


### Önemli Kurallar

- Endpoint isimleri **değiştirilmemelidir**.
- Field (alan) isimleri **değiştirilmemelidir**.(alan isimleri sabittir farklı isimler kullanmak işimizi zorlaştırır.)
- Endpoint isimleri **değiştirilmemelidir**.
- Her ekip üyesi **kendi modülü üzerinde çalışmalıdır**.
- `core` klasörüne backend mimarisi nedeniyle **doğrudan müdahale edilmemelidir**.(backend lead görevi)
- Herhangi bir yapısal değişiklik gerekiyorsa **önce ekip içinde konuşulmalıdır**.
- Backend'e **yeni özellik eklenmeden önce ekip ile konuşulmalı ve mimariye uygunluğu değerlendirilmelidir**.

### Sabit Veritabanı Alan İsimleri

#### users
- id  
- username  
- email  
- password_hash  
- created_at  

#### daily_entries
- id  
- user_id  
- text  
- water_liters  
- sleep_hours  
- stress_self  
- created_at  

#### emotion_results
- id  
- entry_id  
- happy  
- sad  
- anger  
- anxiety  

#### connections
- id  
- requester_id  
- receiver_id  
- status  
- created_at  

#### support_reactions
- id  
- entry_id  
- user_id  
- emoji  

---

### Sabit Endpointler

GET  /health  

POST /auth/register  
POST /auth/login  

POST /entries  
GET  /entries  

POST /entries/{id}/analyze  

GET  /connections  
POST /connections/request  
POST /connections/accept  

POST /reactions

## Geliştirme Süreci

Projede çalışırken aşağıdaki git akışı kullanılmalıdır.

Çalışmaya başlamadan önce repository güncellenmelidir:

git pull

Kod yazıldıktan sonra değişiklikler commit edilip gönderilmelidir:

git add .
git commit -m "değişiklik açıklaması"
git push

## Backend'i Çalıştırma

Backend'i çalıştırmak için Backend klasörüne gidin:

cd Backend

Gerekli paketleri yükleyin:

pip install -r requirements.txt

Uygulamayı başlatın:

uvicorn app.main:app --reload

API dokümantasyonuna erişmek için:

http://127.0.0.1:8000/docs