'use client';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
        <p className="text-gray-600 mb-6">Last updated: {new Date().toLocaleDateString()}</p>

        <div className="space-y-8 text-gray-700">
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Introduction</h2>
            <p>
              FundiWako ("we", "us", "our") operates the FundiWako platform. This page informs you of our policies regarding 
              the collection, use, and disclosure of personal data when you use our service and the choices you have associated with that data.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Information Collection and Use</h2>
            <p className="mb-4">We collect several different types of information for various purposes to provide and improve our Service.</p>

            <h3 className="text-xl font-semibold text-gray-900 mb-2">Types of Data Collected:</h3>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong>Personal Data:</strong> Name, email address, phone number, profile information</li>
              <li><strong>Location Data:</strong> GPS coordinates for service search (with permission)</li>
              <li><strong>Usage Data:</strong> Pages visited, time spent, interactions with the platform</li>
              <li><strong>Financial Data:</strong> Banking information (encrypted), M-Pesa details</li>
              <li><strong>Device Data:</strong> Device type, operating system, browser information</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Use of Data</h2>
            <p>FundiWako uses the collected data for various purposes:</p>
            <ul className="list-disc list-inside space-y-2 ml-4 mt-2">
              <li>To provide and maintain our Service</li>
              <li>To notify you about changes to our Service</li>
              <li>To allow you to participate in interactive features</li>
              <li>To provide customer support</li>
              <li>To gather analysis or valuable information to improve our Service</li>
              <li>To monitor the usage of our Service</li>
              <li>To detect, prevent and address technical issues and fraud</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Security of Data</h2>
            <p>
              The security of your data is important to us but remember that no method of transmission over the Internet 
              or method of electronic storage is 100% secure. While we strive to use commercially acceptable means to protect 
              your Personal Data, we cannot guarantee its absolute security.
            </p>
            <p className="mt-4">
              <strong>Data Protection Measures:</strong>
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4 mt-2">
              <li>AES-256 encryption for sensitive financial data</li>
              <li>HTTPS/SSL encryption for all data in transit</li>
              <li>Password hashing using bcrypt</li>
              <li>Rate limiting on authentication endpoints</li>
              <li>Regular security audits and monitoring</li>
              <li>Comprehensive audit logging of all administrative actions</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Retention of Data</h2>
            <p>
              FundiWako will retain your Personal Data only for as long as necessary for the purposes set out in this Privacy Policy. 
              We will retain and use your Personal Data to the extent necessary to comply with our legal obligations.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Your Rights</h2>
            <p>You have the right to:</p>
            <ul className="list-disc list-inside space-y-2 ml-4 mt-2">
              <li>Access your personal data</li>
              <li>Correct inaccurate or incomplete data</li>
              <li>Request deletion of your data</li>
              <li>Object to processing of your data</li>
              <li>Request restriction of processing</li>
              <li>Data portability</li>
              <li>Withdraw consent at any time</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Cookies</h2>
            <p>
              We use cookies to store session information and enhance your user experience. You can configure your browser 
              to refuse cookies, but this may limit functionality on our platform.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Changes to This Privacy Policy</h2>
            <p>
              We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new 
              Privacy Policy on this page.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Contact Us</h2>
            <p>If you have any questions about this Privacy Policy, please contact us at:</p>
            <p className="mt-2">
              Email: privacy@fundiwako.com<br/>
              Address: FundiWako Support, Kenya
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
