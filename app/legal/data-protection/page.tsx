'use client';

export default function DataProtection() {
  return (
    <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Data Protection Policy</h1>
        <p className="text-gray-600 mb-6">Last updated: {new Date().toLocaleDateString()}</p>

        <div className="space-y-8 text-gray-700">
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Data Protection Principles</h2>
            <p>
              FundiWako is committed to protecting personal data and respecting privacy rights. We process personal data in 
              accordance with the following principles:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4 mt-2">
              <li><strong>Lawfulness:</strong> We only process data with a legal basis</li>
              <li><strong>Fairness:</strong> Processing is transparent and fair</li>
              <li><strong>Accountability:</strong> We maintain records of all processing activities</li>
              <li><strong>Confidentiality:</strong> Data is kept secure and confidential</li>
              <li><strong>Integrity:</strong> Data is accurate and up-to-date</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Categories of Personal Data</h2>
            
            <h3 className="text-xl font-semibold text-gray-900 mb-2 mt-4">Identity Data</h3>
            <p>Name, email address, phone number, ID number, date of birth</p>

            <h3 className="text-xl font-semibold text-gray-900 mb-2 mt-4">Contact Data</h3>
            <p>Email address, phone number, physical address, location information</p>

            <h3 className="text-xl font-semibold text-gray-900 mb-2 mt-4">Financial Data</h3>
            <p>Bank account details, M-Pesa information, payment history (encrypted)</p>

            <h3 className="text-xl font-semibold text-gray-900 mb-2 mt-4">Professional Data</h3>
            <p>Skills, certifications, work experience, qualifications, ratings</p>

            <h3 className="text-xl font-semibold text-gray-900 mb-2 mt-4">Technical Data</h3>
            <p>IP address, device information, browser type, access logs</p>

            <h3 className="text-xl font-semibold text-gray-900 mb-2 mt-4">Behavioral Data</h3>
            <p>Platform usage, interaction history, preferences, transaction records</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Data Encryption & Security</h2>
            <p className="mb-4"><strong>Sensitive Data Encryption:</strong></p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Financial data encrypted using AES-256 encryption</li>
              <li>ID numbers and phone numbers encrypted at rest</li>
              <li>Encryption keys managed securely with limited access</li>
            </ul>

            <p className="mt-4"><strong>Data in Transit:</strong></p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>All data transmitted via HTTPS/TLS 1.2+</li>
              <li>Certificate-pinning for mobile applications</li>
              <li>No data transmitted over unencrypted connections</li>
            </ul>

            <p className="mt-4"><strong>Password Security:</strong></p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Passwords hashed using bcrypt with salt</li>
              <li>Minimum 8 characters with complexity requirements</li>
              <li>Password reset tokens valid for 1 hour only</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Audit Logging & Compliance</h2>
            <p className="mb-4">
              FundiWako maintains comprehensive audit logs for all system activities to ensure transparency and 
              accountability for government and regulatory compliance.
            </p>
            
            <h3 className="text-xl font-semibold text-gray-900 mb-2 mt-4">Logged Activities Include:</h3>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>User registration and email verification</li>
              <li>Login and logout events</li>
              <li>Password resets and changes</li>
              <li>Administrative actions (approvals, rejections)</li>
              <li>Booking and transaction creation</li>
              <li>Profile updates and sensitive data access</li>
              <li>Failed authentication attempts</li>
              <li>Policy acceptance and compliance actions</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mb-2 mt-4">Audit Log Details:</h3>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Timestamp (UTC)</li>
              <li>User ID and IP address</li>
              <li>Action performed</li>
              <li>Status (success/failure)</li>
              <li>Resources affected</li>
              <li>Before/after values for data changes</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Data Retention</h2>
            <table className="w-full border-collapse border border-gray-300 mt-4">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border border-gray-300 p-2 text-left">Data Type</th>
                  <th className="border border-gray-300 p-2 text-left">Retention Period</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-300 p-2">Active User Accounts</td>
                  <td className="border border-gray-300 p-2">For duration of account + 2 years after deletion</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 p-2">Transactions & Bookings</td>
                  <td className="border border-gray-300 p-2">Minimum 5 years (for tax/compliance)</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 p-2">Audit Logs</td>
                  <td className="border border-gray-300 p-2">Minimum 3 years</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 p-2">Login/Access Logs</td>
                  <td className="border border-gray-300 p-2">90 days</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 p-2">Failed Auth Attempts</td>
                  <td className="border border-gray-300 p-2">30 days</td>
                </tr>
              </tbody>
            </table>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Individual Rights & Access</h2>
            <p className="mb-4">You have the right to:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong>Access:</strong> Request a copy of your personal data</li>
              <li><strong>Correction:</strong> Request corrections to inaccurate data</li>
              <li><strong>Deletion:</strong> Request deletion (where not required for legal purposes)</li>
              <li><strong>Restriction:</strong> Restrict how we process your data</li>
              <li><strong>Portability:</strong> Receive your data in machine-readable format</li>
              <li><strong>Withdrawal:</strong> Withdraw consent for processing at any time</li>
              <li><strong>Complaint:</strong> Lodge a complaint with relevant authorities</li>
            </ul>

            <p className="mt-4"><strong>To exercise these rights, contact:</strong></p>
            <p className="mt-2">privacy@fundiwako.com with "DATA REQUEST" in subject line</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Third-Party Data Sharing</h2>
            <p>We do NOT share personal data with third parties except:</p>
            <ul className="list-disc list-inside space-y-2 ml-4 mt-2">
              <li>Payment processors (for transaction processing)</li>
              <li>Government agencies (when legally required)</li>
              <li>Law enforcement (with valid legal orders)</li>
              <li>Service providers (under confidentiality agreements)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Data Breach Response</h2>
            <p>In the event of a data breach:</p>
            <ul className="list-disc list-inside space-y-2 ml-4 mt-2">
              <li>Affected users will be notified within 72 hours</li>
              <li>Details of breach will be documented</li>
              <li>Relevant authorities will be informed</li>
              <li>Corrective measures will be implemented</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Compliance & Certifications</h2>
            <p className="mb-4">FundiWako maintains compliance with:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Kenya's Data Protection Act 2019</li>
              <li>Kenya Revenue Authority (KRA) requirements</li>
              <li>Central Bank of Kenya (CBK) regulations</li>
              <li>Best practices in data protection and security</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Contact & Inquiries</h2>
            <p>For data protection inquiries:</p>
            <p className="mt-4">
              <strong>Data Protection Officer:</strong><br/>
              Email: dpo@fundiwako.com<br/>
              Address: FundiWako, Kenya<br/>
              Response time: 5 business days
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
