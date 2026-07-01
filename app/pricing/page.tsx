import Link from "next/link";

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-24">
      <div className="container-max px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-14">
          <p className="text-sm uppercase tracking-[0.35em] text-primary-500 mb-3">Simple Pricing</p>
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-slate-900 mb-4">
            Transparent plans for every project.
          </h1>
          <p className="text-base text-slate-600">
            Pay only for the services you need. No hidden fees, no surprises — just trusted fundis and secure payments.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {[
            {
              title: 'Starter',
              price: 'Free',
              description: 'Perfect for first-time customers and small tasks.',
              items: ['Search fundis', 'View profiles', 'Book service', 'Secure checkout'],
            },
            {
              title: 'Pro',
              price: 'KES 299 / job',
              description: 'Recommended for regular home services and repairs.',
              items: ['Escrow payment', 'Job tracking', 'Ratings & reviews', 'Customer support'],
            },
            {
              title: 'Business',
              price: 'Custom',
              description: 'For corporates, projects, and recurring hiring.',
              items: ['Corporate job posting', 'Dedicated support', 'Invoices', 'Priority fundi matching'],
            },
          ].map((plan) => (
            <div key={plan.title} className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
              <h2 className="text-xl font-semibold text-slate-900 mb-3">{plan.title}</h2>
              <p className="text-4xl font-heading font-bold text-secondary-500 mb-4">{plan.price}</p>
              <p className="text-sm text-slate-500 mb-6">{plan.description}</p>
              <ul className="space-y-3 mb-8 text-sm text-slate-600">
                {plan.items.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="mt-1 h-2.5 w-2.5 rounded-full bg-primary-500" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/contact" className="inline-flex items-center justify-center w-full rounded-2xl bg-primary-600 px-5 py-3 text-sm font-semibold text-white hover:bg-primary-700 transition">
                Get Started
              </Link>
            </div>
          ))}
        </div>

        <div className="mt-14 max-w-2xl mx-auto text-center text-slate-600">
          <p>
            FundiWako charges a small service fee on each payment. All fees are clearly displayed before checkout.
          </p>
        </div>
      </div>
    </div>
  );
}
