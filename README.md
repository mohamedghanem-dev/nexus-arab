

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
