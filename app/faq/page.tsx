export default function FAQPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-24">
      <div className="container-max px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-14">
          <p className="text-sm uppercase tracking-[0.35em] text-primary-500 mb-3">Frequently Asked Questions</p>
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-slate-900 mb-4">
            Answers to the questions customers ask most.
          </h1>
          <p className="text-base text-slate-600">
            Learn how FundiWako works, how to book services, and what to expect when hiring a fundi.
          </p>
        </div>

        <div className="space-y-6">
          {[
            {
              question: 'How do I book a fundi?',
              answer: 'Search for a fundi, review their profile, request a quote and confirm the booking. Once the fundi accepts, you can pay securely through the platform.',
            },
            {
              question: 'Can I pay with M-Pesa?',
              answer: 'Yes. FundiWako supports M-Pesa payments and escrow so the fundi only gets paid after work begins or completes, depending on your agreement.',
            },
            {
              question: 'How are fundis verified?',
              answer: 'We verify fundi profiles through email, phone and performance reviews. We also monitor feedback and only keep trusted professionals on the platform.',
            },
            {
              question: 'What if I am not satisfied with the service?',
              answer: 'If there is a problem, raise a dispute through your booking details and our support team will investigate and help resolve the issue.',
            },
          ].map((item) => (
            <div key={item.question} className="rounded-[2rem] bg-white p-8 shadow-sm border border-slate-200">
              <h2 className="text-xl font-semibold text-slate-900 mb-3">{item.question}</h2>
              <p className="text-slate-600">{item.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
