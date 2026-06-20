# Nexus Arab — موقع الشركة + لوحة التحكم

موقع Next.js 14 كامل مع لوحة تحكم، Supabase، AI Chatbot، وPWA.

---

## ما تم تحديثه في هذه النسخة (مراجعة أمان وإكمال)

- 🔒 **أمان:** حذف عمودي `groq_api_key` و `gemini_api_key` من جدول `settings` نهائياً —
  كانا معرَّضين لأي زائر بسبب RLS العام على الجدول. المفاتيح الحقيقية الآن في
  Vercel Environment Variables فقط، مش في قاعدة البيانات.
- 🔒 **أمان:** حد الـ 6 أسئلة في الشات بوت بقى يتتبّع بكوكي httpOnly من السيرفر،
  مش بقيمة جاية من المتصفح (كانت قابلة للتجاوز بسهولة من Dev Tools).
- 🔒 **أمان:** إضافة سياسات RLS ناقصة (رفع صور avatars، تعديل/حذف رسائل التواصل من الأدمن).
- 🛠 **تصحيح:** ملفات GitHub Actions لبناء APK كانت تعتمد على static export غير
  موجود فعلياً. تم تحويلها لتفتح الموقع/لوحة التحكم المنشورين فعلياً عبر Capacitor
  (الطريقة الصحيحة لمشروع فيه API routes وبيانات حيّة).
- ✅ تم توليد كل أحجام أيقونات PWA من اللوجو الفعلي.
- ✅ تم بناء صفحات الداشبورد الناقصة: الأقسام، الخدمات، آراء العملاء، الرسائل.
- ✅ رقم الواتساب واسم المساعد بقوا بياخدوا قيمتهم من الإعدادات الفعلية في كل
  مكان (كانوا مثبّتين في الكود في أكتر من ملف).

---

## الملفات المهمة

| الملف | الوصف |
|-------|-------|
| `supabase_schema.sql` | SQL كامل لإنشاء الجداول والصلاحيات |
| `.env.local` | متغيرات البيئة (لا ترفعه على GitHub أو أي مكان آخر) |
| `app/page.tsx` | الصفحة الرئيسية |
| `app/admin/` | لوحة التحكم |
| `app/api/chat/route.ts` | AI Chatbot API |

---

## خطوات الإعداد

### 0. قبل أي حاجة — المفاتيح
لو سبق وشاركت مفاتيح Groq/Gemini/Supabase في أي محادثة أو ملف غير محمي،
ألغها وأنشئ غيرها قبل النشر الفعلي. مفاتيح هذا المشروع التجريبية لا تُستخدم
حتى الآن لأن لا يوجد مشروع Supabase مُنشأ بعد.

### 1. إعداد Supabase
1. اذهب إلى [supabase.com](https://supabase.com) وأنشئ مشروعاً جديداً
2. في **SQL Editor** → شغّل ملف `supabase_schema.sql` بالكامل
3. في **Authentication → Users** → أنشئ مستخدم admin
4. في **SQL Editor** → أضف الأدمن:
```sql
INSERT INTO admin_users (id, email) 
VALUES ('USER_UUID_FROM_AUTH', 'your@email.com');
```
5. انسخ `Project URL` و `anon key` من **Settings → API**

### 2. إعداد المشروع
```bash
# Clone
git clone https://github.com/mohamedghanem-dev/nexus-arab
cd nexus-arab

# Install
npm install

# إعداد المتغيرات
cp .env.example .env.local
# عدّل .env.local بالقيم الصحيحة (مفاتيح جديدة، ليس القديمة المسرّبة)

# تشغيل
npm run dev
```

### 3. الـ Logo / Icons
تم توليد كل الأحجام المطلوبة (72, 96, 128, 144, 152, 192, 384, 512) في
`public/icons/` فعلاً من اللوجو المرفق. لو غيّرت اللوجو لاحقاً، أعد توليدها
بنفس الأحجام.

### 4. بناء APK (GitHub Actions)

الطريقة الجديدة: كل APK هو "غلاف" Capacitor يفتح رابط الموقع/لوحة التحكم
**المنشورين فعلياً** (على Vercel مثلاً) — وليس نسخة static مجمّعة. لازم يكون
الموقع منشوراً ومتاحاً على الإنترنت قبل تشغيل الـ workflow.

#### GitHub Secrets المطلوبة:
```
SITE_URL              مثال: https://nexus-arab.vercel.app
ADMIN_URL              مثال: https://nexus-arab.vercel.app/admin
KEYSTORE_BASE64
KEY_ALIAS
KEYSTORE_PASSWORD
KEY_PASSWORD
```

#### إنشاء keystore:
```bash
keytool -genkey -v -keystore nexus-arab.keystore -alias nexus-arab -keyalg RSA -keysize 2048 -validity 10000
# Convert to base64:
base64 -i nexus-arab.keystore | pbcopy
```

يفضّل استخدام keystore مختلف لتطبيق الأدمن عن تطبيق الموقع (alias/password مختلفين)
لو حابب تفصل التوزيع تماماً.

---

## هيكل المشروع

```
nexus-arab/
├── app/
│   ├── page.tsx              ← الصفحة الرئيسية
│   ├── layout.tsx
│   ├── globals.css
│   ├── api/
│   │   └── chat/route.ts    ← AI Chatbot API
│   └── admin/
│       ├── layout.tsx        ← Auth guard
│       ├── page.tsx          ← Dashboard
│       ├── login/page.tsx
│       ├── projects/page.tsx
│       ├── categories/page.tsx
│       ├── services/page.tsx
│       ├── testimonials/page.tsx
│       ├── messages/page.tsx
│       └── settings/page.tsx
├── components/
│   ├── Navbar.tsx
│   ├── Footer.tsx
│   ├── ChatWidget.tsx
│   ├── Providers.tsx
│   ├── sections/
│   │   ├── HeroSection.tsx
│   │   ├── ServicesSection.tsx
│   │   ├── ProjectsSection.tsx
│   │   ├── TestimonialsSection.tsx
│   │   └── ContactSection.tsx
│   └── admin/
│       ├── AdminSidebar.tsx
│       └── ProjectForm.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   └── server.ts
│   ├── data.ts
│   └── upload.ts
├── types/index.ts
├── public/
│   ├── manifest.json
│   └── icons/
├── .github/workflows/
│   ├── build-apk-website.yml
│   └── build-apk-admin.yml
├── supabase_schema.sql
├── .env.local
└── .env.example
```

---

## Supabase Tables

| الجدول | الوصف |
|--------|-------|
| `projects` | المشاريع والأعمال |
| `categories` | أقسام المشاريع |
| `pricing_plans` | باقات الأسعار للأنظمة |
| `services` | الخدمات المقدمة |
| `testimonials` | آراء العملاء |
| `settings` | إعدادات الشركة |
| `contact_messages` | رسائل التواصل |
| `admin_users` | المشرفون |

---

## AI Chatbot

- يستخدم **4 Groq keys** بـ random rotation (تتغير من Vercel Environment Variables فقط)
- حد أقصى **6 أسئلة** للزائر الواحد — متتبَّع بكوكي httpOnly من السيرفر (غير قابل
  للتجاوز من المتصفح)، يتصفّر تلقائياً بعد 6 ساعات
- بعد الحد: رسالة واتساب تلقائية برقم الواتساب الفعلي من الإعدادات
- رسائل جاهزة مسبقاً (Quick replies)
- المفاتيح لا تُخزَّن في قاعدة البيانات إطلاقاً — env vars فقط
- يظهر في الموقع فقط لو "تفعيل المساعد الذكي" مفعّل من لوحة التحكم
