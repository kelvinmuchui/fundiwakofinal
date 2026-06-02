import Link from "next/link";
import CorporateRecruitmentForm from "../components/CorporateRecruitmentForm";
import CorporateInternshipManager from "../components/CorporateInternshipManager";

export default function HireFundisPage() {
  return (
    <div className="min-h-screen bg-neutral-50">
      <section className="bg-[url('/hire-fundis-hero.jpg')] bg-cover bg-center bg-no-repeat py-24 sm:py-32">
        <div className="container-max px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl rounded-4xl bg-white/90 backdrop-blur-xl border border-white/80 p-10 shadow-2xl">
            <p className="text-sm uppercase tracking-[0.3em] text-primary-500 font-semibold mb-4">
              Talent Hub
            </p>
            <h1 className="text-4xl sm:text-5xl font-heading font-extrabold text-secondary-700 mb-6">
              Internship and Corporate Recruitment for Fundis
            </h1>
            <p className="text-lg text-neutral-600 max-w-2xl leading-relaxed mb-8">
              Give skilled fundis a chance to grow with internship opportunities while corporates hire, recruit,
              and retain the right artisans for long-term projects.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/internship" className="btn-primary w-full text-center py-4">
                Apply for Internship
              </Link>
              <Link href="/search" className="btn-secondary w-full text-center py-4">
                Hire a Fundi Today
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-max">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-secondary-600">
              A bridge between emerging artisans and growing businesses
            </h2>
            <p className="text-neutral-500 max-w-2xl mx-auto mt-4">
              Whether you are a fundi seeking hands-on internship experience or a corporate partner
              looking to hire reliable talent, FundiWako helps you connect with confidence.
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            <div className="rounded-4xl bg-white p-8 shadow-lg border border-neutral-200">
              <span className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary-100 text-primary-700 font-bold mb-5">
                1
              </span>
              <h3 className="text-2xl font-semibold text-secondary-700 mb-3">Fundi Internship Path</h3>
              <p className="text-neutral-500 leading-relaxed">
                Upskill with real-world projects, get mentorship from experienced fundis, and build a stronger portfolio.
              </p>
            </div>

            <div className="rounded-4xl bg-white p-8 shadow-lg border border-neutral-200">
              <span className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-accent-100 text-accent-700 font-bold mb-5">
                2
              </span>
              <h3 className="text-2xl font-semibold text-secondary-700 mb-3">Corporate Hiring</h3>
              <p className="text-neutral-500 leading-relaxed">
                Post openings, discover ready-to-work artisans, and hire local talent for maintenance, construction, and facilities work.
              </p>
            </div>

            <div className="rounded-4xl bg-white p-8 shadow-lg border border-neutral-200">
              <span className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-secondary-100 text-secondary-700 font-bold mb-5">
                3
              </span>
              <h3 className="text-2xl font-semibold text-secondary-700 mb-3">Recruit & Retain</h3>
              <p className="text-neutral-500 leading-relaxed">
                Build long-term relationships with reliable fundis, keep your teams staffed, and access new workers as your business grows.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white section-padding">
        <div className="container-max">
          <div className="grid gap-10 lg:grid-cols-2 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-heading font-bold text-secondary-600 mb-6">
                Internship guidance for fundis
              </h2>
              <ul className="space-y-4 text-neutral-500">
                <li>• Find short-term on-the-job training opportunities with vetted host partners.</li>
                <li>• Build skills in electrical, plumbing, carpentry, painting, cleaning and more.</li>
                <li>• Grow your portfolio, get rated, and move from intern to professional fundi.</li>
              </ul>
            </div>
            <div className="rounded-4xl bg-primary-500/5 border border-primary-200 p-8">
              <h3 className="text-2xl font-semibold text-secondary-700 mb-4">Ready to start your internship?</h3>
              <p className="text-neutral-500 mb-6">
                Complete a simple application, update your skills, and get connected to businesses looking for hands-on talent.
              </p>
              <Link href="/become-a-fundi" className="btn-primary inline-flex items-center justify-center px-6 py-4">
                Apply now
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-neutral-50 section-padding">
        <div className="container-max">
          <div className="grid gap-10 lg:grid-cols-2 items-center">
            <div className="rounded-4xl bg-white p-8 shadow-lg border border-neutral-200">
              <h3 className="text-2xl font-semibold text-secondary-700 mb-4">Hire fundis for corporate work</h3>
              <p className="text-neutral-500 mb-6">
                Search from verified artisans and request staffing for facilities, renovations, maintenance, and event support.
              </p>
              <div className="space-y-4">
                <p className="text-neutral-500">• Browse verified fundi profiles</p>
                <p className="text-neutral-500">• Compare reviews, skills, and availability</p>
                <p className="text-neutral-500">• Contact artisans directly through the platform</p>
              </div>
            </div>
            <div className="rounded-4xl bg-primary-500/5 border border-primary-200 p-8">
              <h3 className="text-2xl font-semibold text-secondary-700 mb-4">Let us help you recruit</h3>
              <p className="text-neutral-500 mb-6">
                Need multiple workers? Use FundiWako to build a trusted talent pipeline and keep your job sites staffed.
              </p>
              <Link href="/search" className="btn-secondary inline-flex items-center justify-center px-6 py-4">
                Start hiring
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white section-padding">
        <div className="container-max">
          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] items-start">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-primary-500 font-semibold mb-4">Recruitment form</p>
              <h2 className="text-3xl md:text-4xl font-heading font-bold text-secondary-600 mb-4">
                Submit your internship or hiring request
              </h2>
              <p className="text-neutral-500 max-w-2xl">
                Complete the corporate request form and our team will prepare the best match for your fundi staffing or internship need.
              </p>
            </div>
            <CorporateRecruitmentForm />
          </div>
        </div>
      </section>

      <section className="bg-gray-50 section-padding">
        <div className="container-max">
          <CorporateInternshipManager />
        </div>
      </section>
    </div>
  );
}
