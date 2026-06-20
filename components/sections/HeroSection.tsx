'use client';
// components/sections/HeroSection.tsx
import { useEffect, useRef } from 'react';
import { ArrowLeft, Play } from 'lucide-react';

const TECH_TICKER = [
  'Next.js', 'React', 'Flutter', 'Node.js', 'Supabase', 'Firebase',
  'TypeScript', 'Python', 'Tailwind CSS', 'PostgreSQL', 'REST APIs', 'PWA',
  'Next.js', 'React', 'Flutter', 'Node.js', 'Supabase', 'Firebase',
  'TypeScript', 'Python', 'Tailwind CSS', 'PostgreSQL', 'REST APIs', 'PWA',
];

const DEFAULT_WHATSAPP = '201095097334';

interface Props { whatsappNumber?: string | null; }

export function HeroSection({ whatsappNumber }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const whatsapp = whatsappNumber || DEFAULT_WHATSAPP;

  // Particle background
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const particles: { x: number; y: number; vx: number; vy: number; r: number; a: number }[] = [];

    const resize = () => {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    for (let i = 0; i < 60; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        r: Math.random() * 1.5 + 0.5,
        a: Math.random(),
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(96,165,250,${p.a * 0.6})`;
        ctx.fill();
      });

      // Connect nearby particles
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(37,99,235,${0.3 * (1 - dist / 120)})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize); };
  }, []);

  return (
    <section id="hero" className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-16">
      {/* Canvas bg */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" style={{ opacity: 0.7 }} />

      {/* Radial glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 70% 50% at 50% 40%, rgba(37,99,235,0.18) 0%, transparent 70%)',
        }}
      />

      <div className="relative z-10 max-w-5xl mx-auto px-4 text-center">
        {/* Badge */}
        <div
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-8 glass"
          style={{ color: 'var(--c-accent-lt)', border: '1px solid rgba(96,165,250,0.25)' }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          متاح للمشاريع الجديدة
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black leading-tight mb-6 tracking-tight">
          <span style={{ color: 'var(--c-text)' }}>Nexus Arab</span>
          <br />
          <span className="grad-text">نُشيد الأعمال الرقمية</span>
          <br />
          <span style={{ color: 'var(--c-text)' }}>للمستقبل</span>
        </h1>

        {/* Subheadline */}
        <p
          className="text-base sm:text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed font-medium"
          style={{ color: 'var(--c-text2)' }}
        >
          وكالة تقنية متكاملة لبناء المواقع الفاخرة، تطبيقات الموبايل، والأنظمة الإدارية العملاقة.
          ندمج التصميم البريميوم بأحدث التقنيات لتمنح بيزنسك القوة والتحكم الكامل.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <a
            href={`https://wa.me/${whatsapp}?text=${encodeURIComponent('مرحباً، أريد بدء مشروع جديد مع Nexus Arab')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-8 py-3.5 rounded-2xl font-bold text-white text-base transition-all duration-200 hover:opacity-90 active:scale-95 shadow-lg"
            style={{
              background: 'linear-gradient(135deg, var(--c-accent), var(--c-cyan))',
              boxShadow: '0 0 30px var(--c-glow)',
            }}
          >
            ابدأ مشروعك الآن
            <ArrowLeft size={18} />
          </a>

          <a
            href="#projects"
            className="flex items-center gap-2 px-8 py-3.5 rounded-2xl font-bold text-base transition-all duration-200 hover:border-opacity-60 glass"
            style={{ color: 'var(--c-text2)', border: '1px solid var(--c-border)' }}
          >
            <Play size={16} />
            شاهد أعمالنا
          </a>
        </div>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-3 gap-6 max-w-md mx-auto">
          {[
            { n: '+50', label: 'مشروع مسلّم' },
            { n: '+30', label: 'عميل سعيد' },
            { n: '3+',  label: 'سنوات خبرة' },
          ].map(stat => (
            <div key={stat.label} className="text-center">
              <div className="text-3xl font-black grad-text">{stat.n}</div>
              <div className="text-xs mt-1 font-medium" style={{ color: 'var(--c-text3)' }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tech ticker */}
      <div className="absolute bottom-0 inset-x-0 py-3 glass" style={{ borderTop: '1px solid var(--c-border)' }}>
        <div className="ticker-wrap">
          <div className="ticker-inner">
            {TECH_TICKER.map((t, i) => (
              <span
                key={i}
                className="mx-6 text-xs font-semibold tracking-widest uppercase"
                style={{ color: 'var(--c-text3)' }}
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
