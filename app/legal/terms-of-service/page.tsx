'use client';

const sections = [
  {
    title: '1. About FundiWako',
    paragraphs: [
      'FundiWako is a digital platform designed to help people discover and connect with fundis and other skilled service providers. The platform may support profiles, service listings, portfolios, enquiries, bookings, ratings and related features and it is supported by the state department for TVET through a memorandum of understanding (MOU).',
      'FundiWako provides a connection and facilitation service. Unless expressly stated otherwise in a separate written agreement, FundiWako does not itself perform the repair, construction, installation, maintenance or other services offered by fundis. The contract for the actual work is generally between the client and the fundi.',
      'These Terms apply to your access to and use of the FundiWako website, applications, features and related services (together, the “Platform”).',
    ],
  },
  {
    title: '2. Definitions',
    paragraphs: [
      '“Client” means a person or organisation using the Platform to find, contact or engage a fundi. “Fundi” means a skilled worker or service provider who creates or maintains a profile or offers services through the Platform. “User” means any Client, Fundi or other person accessing the Platform.',
      '“Services” means the work offered by a fundi to a client. “Content” includes text, photographs, videos, reviews, ratings, profile details and other material submitted to or displayed on the Platform.',
    ],
  },
  {
    title: '3. Eligibility and registration',
    paragraphs: [
      'You must provide accurate, current and complete information when creating an account and keep that information updated. You must be legally capable of entering into a binding agreement under applicable Kenyan law. If you use the Platform for an organisation, you confirm that you are authorised to act for it.',
      'You are responsible for maintaining the confidentiality of your login credentials and for activity carried out through your account. Notify FundiWako promptly if you suspect unauthorised access or misuse of your account.',
      'FundiWako may request information reasonably necessary to create, secure or verify an account. We may decline, restrict or suspend registration where information is incomplete, misleading, unlawful or creates a safety or platform-integrity concern.',
    ],
  },
  {
    title: '4. Client responsibilities',
    paragraphs: [
      'Clients must provide clear and honest descriptions of the work required, including relevant location, timing, access conditions and any known safety risks. Clients should agree the scope, price, materials, timelines and payment arrangements directly with the fundi before work begins.',
      'Clients must treat fundis respectfully, provide a reasonably safe work environment, comply with applicable laws and avoid discrimination, harassment, threats, exploitation or abusive conduct.',
      'Clients should inspect completed work promptly and raise concerns with the fundi in a timely and constructive manner. A client must not use the Platform to request unlawful, unsafe or prohibited services.',
    ],
  },
  {
    title: '5. Fundi responsibilities',
    paragraphs: [
      'Fundis must provide truthful profile information, qualifications, experience, service descriptions, portfolio material and availability. A fundi must not claim to hold a licence, certification, registration or qualification that they do not hold.',
      'Fundis are responsible for determining whether they have the skills, tools, permits, insurance and legal authorisations required for a particular job. They must perform agreed work with reasonable care and skill, communicate material changes promptly and comply with applicable Kenyan laws and professional or safety standards.',
      'Fundis must provide clients with clear information about charges, materials, deposits, cancellation terms and any additional costs before the client commits. Fundis must not request or accept payment for work they do not intend or are not reasonably able to perform.',
    ],
  },
  {
    title: '6. TVET graduates and free registration',
    paragraphs: [
      'FundiWako may provide free registration or other onboarding support to eligible TVET graduates where such an offer is expressly advertised. Any eligibility criteria, duration, limits or conditions stated in the relevant offer will apply.',
      'Free registration does not guarantee jobs, income, bookings, employment, certification, endorsement or acceptance by clients. Graduates remain responsible for the accuracy of their profiles and for meeting the requirements applicable to the services they offer.',
    ],
  },
  {
    title: '7. Bookings and service arrangements',
    paragraphs: [
      'An enquiry, message or booking request submitted through the Platform is not necessarily an accepted booking. A booking is confirmed only when the client and fundi have clearly agreed to proceed, including the scope of work, price or pricing method, timing and any other material conditions.',
      'Clients and fundis are responsible for confirming all job details before work begins. Any change to the agreed scope, price, materials or schedule should be recorded in writing, including through available Platform communications where practical.',
      'Unless the Platform expressly states otherwise, FundiWako is not a party to the service agreement between a client and a fundi and does not guarantee that a fundi will accept a request or that a client will proceed with a booking.',
    ],
  },
  {
    title: '8. Cancellations and rescheduling',
    paragraphs: [
      'Clients and fundis should give reasonable notice if they need to cancel or reschedule and should communicate directly with one another as soon as possible.',
      'If a booking or payment feature operated by FundiWako has its own cancellation or refund rules, those rules will be displayed before the transaction and will apply to that feature. Nothing in these Terms removes rights that cannot lawfully be excluded.',
    ],
  },
  {
    title: '9. Payments and service fees',
    paragraphs: [
      'Unless a payment is expressly processed through a FundiWako payment feature, clients pay fundis directly using the method agreed between them. FundiWako is not responsible for cash or transfers made outside a payment feature it operates through an escrow account provided.',
      'Any platform fee, commission, subscription, listing charge or other amount payable to FundiWako will be communicated to the relevant user before the user becomes liable to pay it. FundiWako will not treat an undisclosed fee as accepted.',
      'Fundis must disclose their service prices or pricing method, deposits, materials costs, taxes where applicable and any additional charges before the client commits. Clients should request and retain receipts or other payment records.',
      'Where FundiWako processes a payment, the applicable payment provider terms, processing timelines and displayed refund rules may also apply. FundiWako does not store or control payment credentials handled directly by an independent payment provider.',
    ],
  },
  {
    title: '10. Reviews and ratings',
    paragraphs: [
      'Users may be able to submit reviews or ratings based on genuine experiences. Reviews must be honest, relevant, respectful and based on the user\'s own interaction with the other party.',
      'The service consumer is encouraged to rate the fundi through the star system provided in the rating icon.',
      'Users must not submit fake, misleading, retaliatory, discriminatory, defamatory or incentivised reviews that are not clearly disclosed. Users must not manipulate ratings or pressure another person to change a review.',
      'FundiWako may moderate, hide or remove content that breaches these Terms or applicable law. We may provide a process for reporting or responding to a review, but we do not guarantee that every disagreement can be independently verified.',
    ],
  },
  {
    title: '11. Verification and user safety',
    paragraphs: [
      'FundiWako may introduce identity, qualification, reference or other verification checks. A verification indicator means only that a particular check has been completed to the stated extent; it is not a guarantee of a user\'s character, competence, reliability, legal compliance or future conduct.',
      'Users should exercise reasonable care before sharing sensitive information, making payments, allowing access to premises or engaging a service provider. Where appropriate, verify identity and credentials, agree the work in writing and keep records.',
      'Report suspected fraud, impersonation, unsafe conduct or other serious concerns to FundiWako using the contact details below. In an emergency or where a crime may have occurred, contact the relevant Kenyan authorities.',
    ],
  },
  {
    title: '12. Prohibited activities',
    paragraphs: [
      'You must not use the Platform to: break the law; facilitate fraud or theft; impersonate another person; provide false qualifications or information; harass, threaten, exploit or discriminate against others; publish another person\'s private information without a lawful basis; upload malicious code; interfere with Platform security; manipulate reviews or bookings; or infringe intellectual property rights.',
      'You must not use the Platform to advertise or arrange services that are unlawful, dangerous or prohibited by applicable law. You must not attempt to bypass reasonable security, access controls or account restrictions.',
    ],
  },
  {
    title: '13. Privacy and data protection',
    paragraphs: [
      'FundiWako handles personal data in accordance with its Privacy Policy and applicable Kenyan data protection law, including the Data Protection Act, 2019 and applicable regulations. The Privacy Policy explains what personal data is collected, why it is used, how it may be shared, how long it is retained and how data subjects may exercise their rights.',
      'By using the Platform, you acknowledge that personal data may be processed for account administration, matching clients and fundis, facilitating communications and bookings, safety, fraud prevention, support, legal compliance and other purposes explained in the Privacy Policy.',
      'Users must only provide personal data they are authorised to share and must not misuse personal data obtained through the Platform. If you have a privacy concern or wish to exercise a data protection right, contact FundiWako using the details below. This section does not replace the Privacy Policy or limit rights provided by law.',
    ],
  },
  {
    title: '14. Intellectual property',
    paragraphs: [
      'The Platform, including its software, design, branding, logos, text and other materials owned by or licensed to FundiWako, is protected by intellectual property laws. You may use the Platform for its intended purpose but may not copy, modify, distribute, reverse engineer or commercially exploit protected material except as permitted by law or with written permission.',
      'You retain ownership of content you submit, subject to any rights you grant to FundiWako to host, display, reproduce and use that content as reasonably necessary to operate, promote, secure and improve the Platform. You confirm that you have the rights and permissions needed to submit the content.',
      'You may not use FundiWako\'s name, logo or branding in a way that suggests sponsorship, partnership or endorsement without prior written permission.',
    ],
  },
  {
    title: '15. Account suspension and termination',
    paragraphs: [
      'FundiWako may investigate suspected misuse and may remove content, restrict features, suspend or terminate an account where reasonably necessary to protect users, maintain Platform integrity, comply with law or enforce these Terms.',
      'Where reasonably practicable, FundiWako will provide notice and an opportunity to address the issue. Immediate action may be taken where there is a serious safety risk, suspected fraud, unlawful activity, security threat or legal requirement.',
      'You may stop using the Platform and request account closure through the available account process or by contacting FundiWako. Account closure does not automatically cancel obligations or resolve payments arising from services already agreed between users. Certain information may be retained where required or permitted by law, as explained in the Privacy Policy.',
    ],
  },
  {
    title: '16. Limitation of liability',
    paragraphs: [
      'To the extent permitted by Kenyan law, FundiWako provides the Platform on an “as available” basis and does not warrant uninterrupted, error-free or continuously available access. We may update, suspend or discontinue features for maintenance, security, operational or business reasons.',
      'FundiWako does not guarantee the quality, safety, legality, availability or suitability of services offered by fundis, nor the conduct or performance of clients or fundis. Users are responsible for assessing and agreeing service arrangements with one another.',
      'To the extent permitted by law, FundiWako will not be liable for indirect or consequential loss, loss of profit, loss of opportunity, loss of data or damage arising from dealings between users or from a user\'s inability to access the Platform. Nothing in these Terms excludes or limits liability that cannot lawfully be excluded or limited, including liability for fraud or any mandatory consumer or data protection rights.',
    ],
  },
  {
    title: '17. Indemnification',
    paragraphs: [
      'To the extent permitted by law, you agree to be responsible for claims, losses, liabilities and reasonable costs arising from your breach of these Terms, unlawful conduct, infringement of another person\'s rights or misuse of the Platform.',
    ],
  },
  {
    title: '18. Complaints and dispute resolution',
    paragraphs: [
      'If you have a complaint about the Platform, contact FundiWako with a clear description of the issue and any relevant booking reference, dates or supporting information. We will review the complaint and, where appropriate, seek to facilitate communication between the parties.',
      'Disputes about the actual work, workmanship, payment or performance of a service are primarily between the client and fundi who made the service agreement. FundiWako may assist with communication but does not guarantee a particular outcome.',
      'Nothing in this section prevents a user from approaching a competent court, regulator, consumer protection body or other authority, or from exercising any right available under Kenyan law.',
    ],
  },
  {
    title: '19. Changes to these Terms',
    paragraphs: [
      'FundiWako may update these Terms to reflect changes to the Platform, business operations, security requirements or applicable law. The updated version will be published on the Platform with a revised “Last updated” date.',
      'Where a change materially affects users\' rights or obligations, FundiWako will take reasonable steps to provide notice. Continued use after the effective date of an update constitutes acceptance where such acceptance is recognised by applicable law. If you do not agree, you should stop using the Platform.',
    ],
  },
  {
    title: '20. Third-party services',
    paragraphs: [
      'The Platform may contain links to or integrate with third-party websites, payment providers, mapping services, communications tools or other services. Those services are controlled by their respective providers and may be subject to separate terms and privacy notices.',
      'FundiWako is not responsible for third-party services that it does not control. A link or integration does not, by itself, mean that FundiWako endorses the third party.',
    ],
  },
  {
    title: '21. Governing law',
    paragraphs: [
      'These Terms are governed by the laws of Kenya. Subject to any mandatory dispute resolution process or jurisdiction provided by law, disputes relating to these Terms may be brought before the competent courts of Kenya.',
    ],
  },
  {
    title: '22. General provisions',
    paragraphs: [
      'If any provision of these Terms is found to be invalid or unenforceable, the remaining provisions will continue to apply to the extent possible. A failure or delay by FundiWako to enforce a provision is not a waiver of its rights.',
      'These Terms, together with the Privacy Policy and any additional terms clearly presented for a particular feature, form the agreement governing your use of the Platform. If there is a conflict, the specific additional terms for that feature will apply to that feature to the extent of the conflict.',
      'You may not transfer your account or rights under these Terms without FundiWako\'s prior written consent. FundiWako may transfer its rights and obligations as part of a lawful business reorganisation or transfer, provided users\' mandatory legal rights are respected.',
    ],
  },
  {
    title: '23. Contact information',
    paragraphs: [
      'Questions, complaints or notices concerning these Terms may be sent to FundiWako using the following contact details:',
      'Website: https://www.fundiwako.ke',
      'Email: info@fundiwako.ke',
      'Telephone: 0181835984',
    ],
  },
  {
    title: 'Acceptance of these Terms',
    paragraphs: [
      'By creating an account, accessing or using the FundiWako Platform, you confirm that you have read and agree to these Terms and Conditions and the applicable Privacy Policy. If you do not agree, do not create an account or use the Platform.',
    ],
  },
];

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-slate-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8 lg:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-orange-600">FundiWako</p>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Terms and Conditions of Service
          </h1>
          <p className="mt-2 text-sm text-slate-500">Public Website Copy</p>

          <div className="mt-6 flex flex-wrap items-center gap-2 text-sm text-slate-500">
            <span>Effective date: 1 October 2026</span>
            <span className="text-slate-300">•</span>
            <span>Last updated: 1 October 2026</span>
          </div>

          <div className="legal-content mt-8 space-y-8 text-slate-700">
            <p>
              These Terms govern access to and use of the FundiWako platform by clients, fundis and other visitors.
            </p>

            {sections.map((section, index) => (
              <section key={section.title}>
                <h2 className="mb-3 text-xl font-semibold text-slate-900 sm:text-2xl">{section.title}</h2>
                {section.paragraphs.map((paragraph, paragraphIndex) => (
                  <p key={`${section.title}-${paragraphIndex}`} className="mb-4 leading-7">
                    {paragraph}
                  </p>
                ))}
              </section>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
