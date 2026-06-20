// app/page.tsx — Main page (Server Component)
import { Navbar }              from '@/components/Navbar';
import { HeroSection }         from '@/components/sections/HeroSection';
import { ServicesSection }     from '@/components/sections/ServicesSection';
import { ProjectsSection }     from '@/components/sections/ProjectsSection';
import { TestimonialsSection } from '@/components/sections/TestimonialsSection';
import { ContactSection }      from '@/components/sections/ContactSection';
import { Footer }              from '@/components/Footer';
import { ChatWidget }          from '@/components/ChatWidget';
import {
  getSettings,
  getCategories,
  getProjects,
  getServices,
  getTestimonials,
} from '@/lib/data';

export const revalidate = 60; // ISR: refresh every 60 seconds

export default async function HomePage() {
  const [settings, categories, projects, services, testimonials] = await Promise.all([
    getSettings(),
    getCategories(),
    getProjects(),
    getServices(),
    getTestimonials(),
  ]);

  return (
    <>
      <Navbar whatsappNumber={settings?.whatsapp_number} />
      <main>
        <HeroSection whatsappNumber={settings?.whatsapp_number} />
        <ServicesSection services={services} whatsappNumber={settings?.whatsapp_number} />
        <ProjectsSection projects={projects} categories={categories} whatsappNumber={settings?.whatsapp_number} />
        <TestimonialsSection testimonials={testimonials} />
        <ContactSection settings={settings} />
      </main>
      <Footer settings={settings} />
      {settings?.ai_assistant_enabled && (
        <ChatWidget
          whatsappNumber={settings?.whatsapp_number}
          assistantName={settings?.ai_assistant_name}
        />
      )}
    </>
  );
}
