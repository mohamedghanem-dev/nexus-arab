'use client';
// components/sections/TestimonialsSection.tsx
import Image from 'next/image';
import { Star } from 'lucide-react';
import type { Testimonial } from '@/types';

interface Props { testimonials: Testimonial[]; }

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map(i => (
        <Star
          key={i}
          size={14}
          fill={i <= rating ? '#fbbf24' : 'none'}
          style={{ color: i <= rating ? '#fbbf24' : 'var(--c-text3)' }}
        />
      ))}
    </div>
  );
}

export function TestimonialsSection({ testimonials }: Props) {
  if (!testimonials.length) return null;

  return (
    <section id="testimonials" className="section overflow-hidden" style={{ background: 'var(--c-bg)' }}>
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-10">
          <p className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: 'var(--c-accent-lt)' }}>
            شهادات العملاء
          </p>
          <h2 className="text-3xl sm:text-4xl font-black" style={{ color: 'var(--c-text)' }}>
            ماذا يقول عملاؤنا؟
          </h2>
        </div>

        {/* Horizontal scroll */}
        <div className="scroll-x">
          {testimonials.map(t => (
            <div
              key={t.id}
              className="glass rounded-2xl p-6 flex flex-col gap-4"
              style={{
                width: 'clamp(280px, 80vw, 360px)',
                border: '1px solid var(--c-border)',
              }}
            >
              {/* Stars */}
              <Stars rating={t.rating} />

              {/* Content */}
              <p className="text-sm leading-relaxed flex-1" style={{ color: 'var(--c-text2)' }}>
                "{t.content}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-3 pt-2" style={{ borderTop: '1px solid var(--c-border)' }}>
                {t.avatar_url ? (
                  <Image
                    src={t.avatar_url}
                    alt={t.name}
                    width={40}
                    height={40}
                    className="rounded-full object-cover"
                  />
                ) : (
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, var(--c-accent), var(--c-cyan))' }}
                  >
                    {t.name.charAt(0)}
                  </div>
                )}
                <div>
                  <p className="text-sm font-bold" style={{ color: 'var(--c-text)' }}>{t.name}</p>
                  {(t.role || t.company) && (
                    <p className="text-xs" style={{ color: 'var(--c-text3)' }}>
                      {[t.role, t.company].filter(Boolean).join(' — ')}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
