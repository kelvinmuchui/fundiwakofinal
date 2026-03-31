import Link from "next/link";
import ServiceCard from "./components/ServiceCard";
import TestimonialCard from "./components/TestimonialCard";
import SearchBar from "./components/SearchBar";
import HeroSlider from "./components/HeroSlider";
import { getServices, getTestimonials } from "../lib/services";

type HomeProps = {
  services: Awaited<ReturnType<typeof getServices>>;
  testimonials: Awaited<ReturnType<typeof getTestimonials>>;
};

export const revalidate = 3600; // revalidate every hour

export default async function Home() {
  const services = await getServices();
  const testimonials = await getTestimonials();

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center gradient-hero">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-hero-pattern opacity-10" />

        {/* Background Decorative Elements */}
        <div className="absolute top-0 right-0 -mr-40 -mt-40 w-[32rem] h-[32rem] rounded-full bg-primary-500/10 blur-[100px] animate-float" />
        <div className="absolute bottom-0 left-0 -ml-40 -mb-40 w-[28rem] h-[28rem] rounded-full bg-accent-500/10 blur-[80px] animate-float animate-delay-500" />
        <div className="absolute top-1/3 left-1/4 w-64 h-64 rounded-full bg-secondary-500/10 blur-[120px] animate-float transition-all duration-1000" />

        <div className="container-max relative z-10 text-center text-white h-full grid grid-rows-[auto_1fr_auto]">
          <div>
            <span className="inline-block animate-fade-in opacity-0 py-1 px-3 rounded-full bg-white/10 border border-white/20 text-sm font-medium mb-6">
              ✨ Kenya&apos;s #1 Artisan Marketplace
            </span>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-heading font-extrabold mb-6 tracking-tight animate-reveal opacity-0 [animation-delay:200ms]">
              Find Trusted <span className="gradient-text drop-shadow-[0_0_15px_rgba(249,115,22,0.3)]">Fundis</span> <br className="hidden md:block" /> Near You
            </h1>
            <p className="max-w-2xl mx-auto text-lg md:text-xl text-white/80 mb-10 animate-reveal opacity-0 [animation-delay:400ms]">
              Connect with verified plumbers, electricians, carpenters, and more.
              Quality work, fair prices, and peace of mind.
            </p>
          </div>

          {/* Search Bar with Glass Interaction */}
          <div className="animate-reveal opacity-0 [animation-delay:600ms] flex items-center justify-center w-full max-w-3xl mx-auto relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary-500/0 via-primary-500/30 to-primary-500/0 rounded-[1.5rem] blur opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative w-full">
              <SearchBar />
            </div>
          </div>

          {/* High-Impact Stats Section */}
          <div className="animate-reveal opacity-0 [animation-delay:800ms] mt-12">
            <div className="glass-light/10 border-white/10 p-8 rounded-3xl backdrop-blur-md flex flex-wrap items-center justify-center gap-6 md:gap-16 border">
              <div className="text-center group cursor-default">
                <p className="text-4xl font-heading font-bold text-white group-hover:translate-x-1 transition-transform">5,000+</p>
                <p className="text-xs font-semibold uppercase tracking-widest text-primary-400">Verified Fundis</p>
              </div>
              <div className="hidden sm:block w-px h-12 bg-white/10 shrink-0"></div>
              <div className="text-center group cursor-default">
                <p className="text-4xl font-heading font-bold text-white group-hover:translate-x-1 transition-transform">12,000+</p>
                <p className="text-xs font-semibold uppercase tracking-widest text-accent-400">Happy Customers</p>
              </div>
              <div className="hidden sm:block w-px h-12 bg-white/10 shrink-0"></div>
              <div className="text-center group cursor-default">
                <p className="text-4xl font-heading font-bold text-white group-hover:translate-x-1 transition-transform">4.8/5</p>
                <p className="text-xs font-semibold uppercase tracking-widest text-secondary-300">Average Rating</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="bg-neutral-50 section-padding">
        <div className="container-max">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-secondary-500 mb-4">
              Explore Our Services
            </h2>
            <p className="text-neutral-500 max-w-2xl mx-auto">
              From quick fixes to major renovations, find the right professional for any job.
              All our fundis are vetted for quality and reliability.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {services.map((service, index) => (
              <ServiceCard key={index} {...service} />
            ))}
          </div>

          <div className="text-center mt-12">
            <button className="btn-secondary">
              View All Services
            </button>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="bg-white section-padding">
        <div className="container-max">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="lg:w-1/2">
              <h2 className="text-3xl md:text-4xl font-heading font-bold text-secondary-500 mb-6">
                How FundiWako Works
              </h2>
              <p className="text-neutral-500 mb-10 text-lg">
                Getting your home repairs and projects done has never been easier.
                Our platform streamlines the entire process from search to payment.
              </p>

              <div className="space-y-6">
                <div className="group flex gap-5 p-4 rounded-2xl hover:bg-primary-50/50 transition-all duration-300 border border-transparent hover:border-primary-100">
                  <div className="shrink-0 w-14 h-14 rounded-2xl bg-white shadow-md flex items-center justify-center text-primary-500 font-bold text-2xl group-hover:bg-primary-500 group-hover:text-white transition-all transform group-hover:rotate-6">
                    1
                  </div>
                  <div>
                    <h4 className="text-xl font-heading font-bold text-secondary-500 mb-2">Search & Compare</h4>
                    <p className="text-neutral-500">Tell us what you need. View profiles, reviews, and past work of qualified fundis near you.</p>
                  </div>
                </div>

                <div className="group flex gap-5 p-4 rounded-2xl hover:bg-primary-50/50 transition-all duration-300 border border-transparent hover:border-primary-100">
                  <div className="shrink-0 w-14 h-14 rounded-2xl bg-white shadow-md flex items-center justify-center text-primary-500 font-bold text-2xl group-hover:bg-primary-500 group-hover:text-white transition-all transform group-hover:-rotate-6">
                    2
                  </div>
                  <div>
                    <h4 className="text-xl font-heading font-bold text-secondary-500 mb-2">Book & Connect</h4>
                    <p className="text-neutral-500">Request a quote or book directly. Chat with your chosen artisan to discuss project details.</p>
                  </div>
                </div>

                <div className="group flex gap-5 p-4 rounded-2xl hover:bg-primary-50/50 transition-all duration-300 border border-transparent hover:border-primary-100">
                  <div className="shrink-0 w-14 h-14 rounded-2xl bg-white shadow-md flex items-center justify-center text-primary-500 font-bold text-2xl group-hover:bg-primary-500 group-hover:text-white transition-all transform group-hover:rotate-6">
                    3
                  </div>
                  <div>
                    <h4 className="text-xl font-heading font-bold text-secondary-500 mb-2">Get it Done</h4>
                    <p className="text-neutral-500">The fundi completes the job. Pay securely through our platform and leave a review.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:w-1/2 relative w-full aspect-square md:aspect-4/3 lg:aspect-auto mt-10 lg:mt-0">
              {/* Decorative background shape */}
              <div className="absolute inset-0 bg-primary-100 rounded-[3rem] transform rotate-3" />
              <div className="absolute inset-0 gradient-secondary rounded-[3rem] transform -rotate-2 overflow-hidden flex items-center justify-center shadow-2xl">
                <div className="w-full h-full bg-[url('https://images.unsplash.com/photo-1542013936693-884638332954x?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80')] bg-cover bg-center opacity-40 mix-blend-overlay"></div>
                <div className="absolute text-center px-10">
                  <h3 className="text-3xl font-heading font-bold text-white mb-2">Quality guaranteed</h3>
                  <p className="text-white/80">Every fundi undergoes a strict vetting process.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="bg-neutral-50 section-padding">
        <div className="container-max">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-secondary-500 mb-4">
              Don&apos;t Just Take Our Word For It
            </h2>
            <p className="text-neutral-500 max-w-2xl mx-auto">
              Read what thousands of happy Kenyans have to say about the fundis they found on our platform.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {testimonials.map((testimonial, index) => (
              <TestimonialCard key={index} {...testimonial} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="cta" className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 gradient-primary" />
        <div className="absolute inset-0 bg-hero-pattern opacity-10 mix-blend-overlay" />

        <div className="container-max relative z-10 text-center px-4">
          <h2 className="text-3xl md:text-5xl font-heading font-bold text-white mb-6">
            Are You a Skilled Artisan?
          </h2>
          <p className="text-white/90 text-lg md:text-xl max-w-2xl mx-auto mb-10">
            Join thousands of fundis making a great living on FundiWako.
            Get access to more customers, manage your bookings, and grow your business.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/become-a-fundi" className="btn-white">
              Apply to be a Fundi
            </Link>
            <button className="inline-flex items-center justify-center px-6 py-3 rounded-xl font-heading font-semibold text-white border-2 border-white hover:bg-white hover:text-primary-500 transition-all duration-300">
              Learn More
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
