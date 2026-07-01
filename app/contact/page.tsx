import Link from "next/link";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-24">
      <div className="container-max px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <p className="text-sm uppercase tracking-[0.35em] text-primary-500 mb-3">Contact Support</p>
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-slate-900 mb-4">
            We are here to help.
          </h1>
          <p className="text-base text-slate-600">
            Have a question about a booking, payment, or your account? Reach out to our support team and we&apos;ll respond quickly.
          </p>
        </div>

        <div className="grid gap-10 lg:grid-cols-2">
          <div className="rounded-[2rem] bg-white p-10 shadow-sm border border-slate-200">
            <h2 className="text-2xl font-semibold text-slate-900 mb-6">Contact Information</h2>
            <div className="space-y-6 text-sm text-slate-600">
              <div>
                <p className="font-semibold text-slate-900 mb-2">Email</p>
                <p>support@fundiwako.com</p>
              </div>
              <div>
                <p className="font-semibold text-slate-900 mb-2">Phone</p>
                <p>+254 700 000 000</p>
              </div>
              <div>
                <p className="font-semibold text-slate-900 mb-2">Head Office</p>
                <p>1 Kimathi Street, Nairobi, Kenya</p>
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] bg-white p-10 shadow-sm border border-slate-200">
            <h2 className="text-2xl font-semibold text-slate-900 mb-6">Send a Message</h2>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Your Name</label>
                <input className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100" placeholder="Jane Doe" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Email Address</label>
                <input className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100" placeholder="you@example.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Message</label>
                <textarea rows={6} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100" placeholder="Tell us what you need..." />
              </div>
              <button className="inline-flex items-center justify-center rounded-2xl bg-primary-600 px-5 py-3 text-sm font-semibold text-white hover:bg-primary-700 transition">
                Send Message
              </button>
            </div>
          </div>
        </div>

        <div className="mt-16 text-center text-sm text-slate-500">
          <p>
            Prefer to speak directly?{' '}
            <Link href="tel:+254700000000" className="text-primary-600 hover:underline">
              Call us at +254 700 000 000
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
