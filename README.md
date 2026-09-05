# Viemo - استضافة ومشغل الفيديوهات فائق السرعة والمينيمل

منصة خفيفة وبسيطة جداً لاستضافة الفيديوهات ومشاركتها بأسلوب **Vimeo البسيط**، مبنية بأحدث التقنيات:
- **Next.js 14 (App Router) + TypeScript**
- **Tailwind CSS** مع تصميم أبيض ناصع، مينيمل، بدون بهرجة أو تأثيرات زجاجية
- **Plyr** مشغل فيديو فائق الأناقة معرب بالكامل ودعم الجودة والسرعة واختصارات الكيبورد
- **Supabase** (Database + Storage Bucket + Auth)
- **Embed Code System** يعمل داخل أي موقع خارجي أو WordPress بسلاسة تامة.

---

## إعداد Supabase

1. توجه إلى لوحة تحكم Supabase الخاصة بمشروعك: `https://supabase.com/dashboard/project/uhqqtyqsblpmyskrvekp`
2. افتح **SQL Editor** وألصق محتويات الملف `supabase_schema.sql` ثم اضغط **Run**.
3. سينشئ الاستعلام:
   - جدول `videos` (id, title, description, url, thumbnail, duration, quality_options, user_id, views, created_at).
   - سلة التخزين (Bucket) باسم `videos` وتعيين صلاحيات الوصول العام والرفع.
   - دالة `increment_video_views` لزيادة عداد المشاهدات تلقائياً.

---

## المتغيرات البيئية (Environment Variables)

تم إعداد ملف `.env.local`، وهذه هي المتغيرات التي ستحتاجها لإضافتها في **Vercel**:

| المتغير | القيمة |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://uhqqtyqsblpmyskrvekp.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVocXF0eXFzYmxwbXlza3J2ZWtwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgxMTYyMzIsImV4cCI6MjEwMzY5MjIzMn0.gxMnRIx9a7I9mAoZYIrcB42uNlZijI_M7xss7BNte6s` |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVocXF0eXFzYmxwbXlza3J2ZWtwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4ODExNjIzMiwiZXhwIjoyMTAzNjkyMjMyfQ.cyUJWSJ5lEiqeKA5Ph7ijpzOUH3MJ_oKtgyhlm9tQKM` |
| `NEXT_PUBLIC_SITE_URL` | `https://your-viemo-domain.vercel.app` (أو دومين موقعك) |

---

## تشغيل المشروع محلياً

```bash
npm install
npm run dev
```

افتح المتصفح على: [http://localhost:3000](http://localhost:3000)

---

## ميزات المشغل والتضمين (Embed Code)

### 1. صفحة التضمين المستقلة `/embed/[id]`
صفحة فائقة الخفة بدون رأس أو تذييل، بخلفية سوداء، تقبل المعاملات التالية:
- `?autoplay=1`: تشغيل الفيديو فور التحميل.
- `?start=60`: بدء التشغيل عند الثانية 60.
- `?end=180`: التوقف التلقائي عند الثانية 180.
- `?loop=1`: تكرار الفيديو بشكل مستمر.
- `?muted=1`: تشغيل الفيديو بوضع الصامت.
- `?controls=0`: إخفاء أزرار التحكم تماماً.

### 2. كود iframe للتضمين
```html
<iframe 
  src="https://your-site.com/embed/VIDEO_ID?autoplay=0&start=0"
  width="100%" 
  style="aspect-ratio: 16/9; border: none; border-radius: 8px;"
  frameborder="0" 
  allow="autoplay; fullscreen" 
  allowfullscreen>
</iframe>
```
