'use client';
// components/sections/ServicesSection.tsx
import { useState } from 'react';
import Image from 'next/image';
import type { Service } from '@/types';

interface Props { services: Service[]; whatsappNumber?: string | null; }

export function ServicesSection({ services, whatsappNumber }: Props) {
  const WHATSAPP = whatsappNumber || '201095097334';
  const [hovered, setHovered] = useState<string | null>(null);

  const buildWaLink = (service: Service) => {
    const msg = service.whatsapp_message
      ?? `مرحباً، أريد الاستفسار عن خدمة: ${service.title}`;
    return `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`;
  };

  if (!services.length) return null;

  return (
    <section id="services" className="section" style={{ background: 'var(--c-bg)' }}>
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-14">
          <p className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: 'var(--c-accent-lt)' }}>
            ما نقدمه
          </p>
          <h2 className="text-3xl sm:text-4xl font-black mb-4" style={{ color: 'var(--c-text)' }}>
            خدماتنا الأساسية
          </h2>
          <p className="max-w-xl mx-auto text-base" style={{ color: 'var(--c-text2)' }}>
            نبني كل ما يحتاجه عملك الرقمي — من أول فكرة حتى التسليم والدعم.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map(service => (
            <div
              key={service.id}
              className="rounded-2xl overflow-hidden transition-all duration-300 glass"
              style={{
                border: `1px solid ${hovered === service.id ? 'var(--c-accent)' : 'var(--c-border)'}`,
                transform: hovered === service.id ? 'translateY(-4px)' : 'none',
                boxShadow: hovered === service.id ? '0 8px 40px var(--c-glow)' : 'none',
              }}
              onMouseEnter={() => setHovered(service.id)}
              onMouseLeave={() => setHovered(null)}
            >
              {/* Image */}
              {service.image_url && (
                <div className="relative h-44 overflow-hidden">
                  <Image
                    src={service.image_url}
                    alt={service.title}
                    fill
                    className="object-cover transition-transform duration-500"
                    style={{ transform: hovered === service.id ? 'scale(1.05)' : 'scale(1)' }}
                  />
                  <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, var(--c-bg2), transparent)' }} />
                </div>
              )}

              {/* Content */}
              <div className="p-5">
                <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--c-text)' }}>
                  {service.title}
                </h3>
                {service.description && (
                  <p className="text-sm mb-4 leading-relaxed" style={{ color: 'var(--c-text2)' }}>
                    {service.description}
                  </p>
                )}

                {/* Price */}
                {service.price && (
                  <div className="mb-4">
                    <span className="text-xl font-black grad-text">{service.price}</span>
                  </div>
                )}

                {/* WhatsApp button */}
                {service.show_whatsapp_button && (
                  <a
                    href={buildWaLink(service)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-bold text-white transition-opacity hover:opacity-90"
                    style={{ background: '#16a34a' }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                      <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.117 1.526 5.847L0 24l6.345-1.498A11.938 11.938 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.793 9.793 0 01-5.007-1.374l-.358-.214-3.765.888.945-3.668-.234-.375A9.793 9.793 0 012.182 12C2.182 6.57 6.57 2.182 12 2.182S21.818 6.57 21.818 12 17.43 21.818 12 21.818z" />
                    </svg>
                    اطلب الخدمة
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
