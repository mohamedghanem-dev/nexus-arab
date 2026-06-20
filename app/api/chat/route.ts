// app/api/chat/route.ts
// AI Chat API — Groq key rotation + server-side 6-question limit + WhatsApp fallback
//
// ملاحظة أمان: حد الأسئلة (MAX_USER_QUESTIONS) يتم تتبعه هنا بكوكي على السيرفر،
// وليس بقيمة جاية من المتصفح — لأن أي قيمة يبعتها الكلاينت يقدر المستخدم يغيّرها
// بسهولة من Dev Tools ويتجاوز الحد. الكوكي ده httpOnly فمفيش جافاسكريبت في
// المتصفح يقدر يعدّله.

import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

const GROQ_KEYS = [
  process.env.GROQ_KEY_1,
  process.env.GROQ_KEY_2,
  process.env.GROQ_KEY_3,
  process.env.GROQ_KEY_4,
].filter(Boolean) as string[];

const DEFAULT_WHATSAPP = '201095097334';
const MAX_USER_QUESTIONS = 6;
const COUNT_COOKIE = 'nxa_qc';
const COOKIE_MAX_AGE = 60 * 60 * 6; // 6 ساعات — بعدها يتصفّر العداد تلقائياً
// قائمة موديلات Groq وأسماؤها تتغيّر بمرور الوقت (موديلات تتقاعد، موديلات جديدة تظهر).
// اتأكد من الاسم الصحيح والمتاح حالياً على https://console.groq.com/docs/models
// قبل النشر، أو غيّره من متغير البيئة GROQ_MODEL بدون تعديل الكود.
const MODEL = process.env.GROQ_MODEL || 'llama-3.1-8b-instant';

const SYSTEM_PROMPT = `أنت مساعد ذكي لشركة Nexus Arab، وكالة تقنية متخصصة في بناء المواقع والأنظمة والتطبيقات والأدوات الرقمية.

خدماتنا:
- مواقع ويب احترافية (مواقع تعريفية، متاجر إلكترونية، منصات تعليمية)
- أنظمة إدارية (محلية وسحابية، CRM، ERP)
- تطبيقات موبايل Flutter (Android و iOS)
- لوحات تحكم مخصصة وأنظمة إدارة محتوى
- بوتات تليجرام ذكية
- أدوات ذكاء اصطناعي مخصصة
- تطبيقات PWA وتحويل APK

قواعد الرد:
1. اجعل ردودك موجزة ومفيدة (3-4 جمل كحد أقصى).
2. إذا سأل عن الأسعار، اذكر أن أسعارنا تنافسية وتبدأ من 999 جنيه للمواقع البسيطة وتختلف حسب التفاصيل، والتفاصيل الكاملة مع الفريق.
3. دائماً أنهِ ردك بـ: "للمزيد من التفاصيل، تواصل مع فريقنا مباشرة عبر واتساب."
4. لا تعطِ معلومات تقنية دقيقة جداً — حوّل العميل للتواصل.
5. تحدث بالعربية بشكل احترافي ومريح.`;

function pickKey(): string {
  const idx = Math.floor(Math.random() * GROQ_KEYS.length);
  return GROQ_KEYS[idx];
}

async function callGroq(messages: object[], retries = 0): Promise<string> {
  if (GROQ_KEYS.length === 0) throw new Error('No API keys configured');

  const key = pickKey();

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      max_tokens: 300,
      temperature: 0.7,
    }),
  });

  // Rate limit — try another key
  if (res.status === 429 && retries < GROQ_KEYS.length) {
    await new Promise(r => setTimeout(r, 400));
    return callGroq(messages, retries + 1);
  }

  if (!res.ok) throw new Error(`Groq error: ${res.status}`);

  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? '';
}

function waLink(number: string, text: string) {
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
}

export async function POST(req: NextRequest) {
  try {
    const { messages, whatsappNumber } = await req.json();
    const waNumber = (typeof whatsappNumber === 'string' && /^\d{8,15}$/.test(whatsappNumber))
      ? whatsappNumber
      : DEFAULT_WHATSAPP;

    // العداد الحقيقي — من الكوكي على السيرفر فقط، لا نثق بأي عدّاد من الكلاينت
    const currentCount = parseInt(req.cookies.get(COUNT_COOKIE)?.value ?? '0', 10) || 0;

    if (currentCount >= MAX_USER_QUESTIONS) {
      return NextResponse.json({
        reply: 'لقد وصلت إلى الحد الأقصى لهذه المحادثة. للمزيد من التفاصيل، تواصل مع فريق Nexus Arab مباشرة عبر واتساب.',
        limitReached: true,
        whatsapp: waLink(waNumber, 'مرحباً، أريد الاستفسار عن خدمات Nexus Arab'),
      });
    }

    const fullMessages = [{ role: 'system', content: SYSTEM_PROMPT }, ...messages];
    const reply = await callGroq(fullMessages);
    const newCount = currentCount + 1;

    const response = NextResponse.json({
      reply,
      limitReached: newCount >= MAX_USER_QUESTIONS,
      whatsapp: newCount >= MAX_USER_QUESTIONS
        ? waLink(waNumber, 'مرحباً، أريد التحدث مع فريق Nexus Arab')
        : undefined,
    });

    response.cookies.set(COUNT_COOKIE, String(newCount), {
      maxAge: COOKIE_MAX_AGE,
      httpOnly: true,
      sameSite: 'lax',
      secure: true,
    });

    return response;
  } catch (err) {
    console.error('[chat/route]', err);
    return NextResponse.json(
      {
        reply: 'عذراً، حدث خطأ مؤقت. تواصل مع فريقنا مباشرة عبر واتساب للمساعدة الفورية.',
        limitReached: false,
        whatsapp: waLink(DEFAULT_WHATSAPP, 'مرحباً، أريد المساعدة'),
      },
      { status: 200 } // 200 to avoid client errors
    );
  }
}
