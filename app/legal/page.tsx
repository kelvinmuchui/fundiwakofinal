'use client';

import Link from 'next/link';

export default function Legal() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Legal & Compliance</h1>
        <p className="text-lg text-gray-600 mb-12">
          FundiWako is committed to transparency, user privacy, and compliance with applicable laws and regulations.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Privacy Policy Card */}
          <Link href="/legal/privacy-policy" className="block">
            <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 border-l-4 border-orange-500">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-md bg-orange-100 text-orange-600">
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900">Privacy Policy</h3>
                  <p className="mt-2 text-gray-600">
                    Learn how we collect, use, and protect your personal information.
                  </p>
                </div>
              </div>
            </div>
          </Link>

          {/* Terms of Service Card */}
          <Link href="/legal/terms-of-service" className="block">
            <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 border-l-4 border-blue-500">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-100 text-blue-600">
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900">Terms of Service</h3>
                  <p className="mt-2 text-gray-600">
                    Review the terms and conditions for using FundiWako platform.
                  </p>
                </div>
              </div>
            </div>
          </Link>

          {/* Data Protection Card */}
          <Link href="/legal/data-protection" className="block">
            <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 border-l-4 border-green-500">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-md bg-green-100 text-green-600">
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m7.356-1.993l-1.33 7.178A2 2 0 0118.449 21H5.551a2 2 0 01-1.977-2.015L1.314 5" />
                    </svg>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900">Data Protection</h3>
                  <p className="mt-2 text-gray-600">
                    Understand our data security measures and compliance framework.
                  </p>
                </div>
              </div>
            </div>
          </Link>

          {/* Contact Support Card */}
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-purple-100 text-purple-600">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900">Contact Support</h3>
                <p className="mt-2 text-gray-600">
                  Questions? Reach out to our support team for assistance.
                </p>
                <p className="mt-3">
                  <a href="mailto:privacy@fundiwako.com" className="text-orange-600 font-semibold hover:text-orange-700">
                    privacy@fundiwako.com
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Compliance Section */}
        <div className="mt-16 bg-blue-50 rounded-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Our Compliance Commitment</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Security & Encryption</h3>
              <ul className="space-y-2 text-gray-700 text-sm">
                <li className="flex items-center">
                  <span className="mr-2">✓</span> AES-256 encryption for sensitive data
                </li>
                <li className="flex items-center">
                  <span className="mr-2">✓</span> HTTPS/TLS for all connections
                </li>
                <li className="flex items-center">
                  <span className="mr-2">✓</span> Bcrypt password hashing
                </li>
                <li className="flex items-center">
                  <span className="mr-2">✓</span> Regular security audits
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Compliance & Audit</h3>
              <ul className="space-y-2 text-gray-700 text-sm">
                <li className="flex items-center">
                  <span className="mr-2">✓</span> Comprehensive audit logging
                </li>
                <li className="flex items-center">
                  <span className="mr-2">✓</span> Kenya Data Protection Act 2019
                </li>
                <li className="flex items-center">
                  <span className="mr-2">✓</span> Government compliance ready
                </li>
                <li className="flex items-center">
                  <span className="mr-2">✓</span> Rate limiting & fraud prevention
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-blue-200">
            <p className="text-sm text-gray-700">
              <strong>Last Updated:</strong> {new Date().toLocaleDateString()}<br/>
              All policies are reviewed and updated regularly to ensure compliance with changing regulations and best practices.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
