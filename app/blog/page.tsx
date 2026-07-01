import Link from "next/link";

const posts = [
  {
    title: 'How to choose the right fundi for your home project',
    description: 'A simple guide to compare artisans, reviews, and hourly rates before you hire.',
    href: '/blog',
  },
  {
    title: 'What to ask before hiring a plumber',
    description: 'Five questions to ask that help you avoid delays and hidden costs.',
    href: '/blog',
  },
  {
    title: 'Safe payments with M-Pesa escrow',
    description: 'Why escrow protects both customers and fundis during service delivery.',
    href: '/blog',
  },
];

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-24">
      <div className="container-max px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-14">
          <p className="text-sm uppercase tracking-[0.35em] text-primary-500 mb-3">Insights & Stories</p>
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-slate-900 mb-4">
            Learn how to get the best work done in Kenya.
          </h1>
          <p className="text-base text-slate-600">
            Read practical advice on hiring artisans, managing household repairs, and using FundiWako with confidence.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {posts.map((post) => (
            <div key={post.title} className="rounded-[2rem] bg-white p-8 shadow-sm border border-slate-200">
              <h2 className="text-xl font-semibold text-slate-900 mb-3">{post.title}</h2>
              <p className="text-slate-600 mb-6">{post.description}</p>
              <Link href={post.href} className="text-primary-600 hover:text-primary-700 font-semibold">
                Read more →
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
