'use client';

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Terms of Service</h1>
        <p className="text-gray-600 mb-6">Last updated: {new Date().toLocaleDateString()}</p>

        <div className="space-y-8 text-gray-700">
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Agreement to Terms</h2>
            <p>
              By accessing and using FundiWako, you accept and agree to be bound by the terms and provision of this agreement. 
              If you do not agree to abide by the above, please do not use this service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Use License</h2>
            <p>
              Permission is granted to temporarily download one copy of the materials (information or software) on FundiWako 
              for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, 
              and under this license you may not:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4 mt-2">
              <li>Modify or copy the materials</li>
              <li>Use the materials for any commercial purpose or for any public display</li>
              <li>Attempt to decompile or reverse engineer any software contained on the platform</li>
              <li>Remove any copyright or other proprietary notations from the materials</li>
              <li>Transfer the materials to another person or "mirror" the materials on any other server</li>
              <li>Violate any applicable laws or regulations related to access to or use of the platform</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Disclaimer</h2>
            <p>
              The materials on FundiWako are provided on an "as is" basis. FundiWako makes no warranties, expressed or implied, 
              and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions 
              of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Limitations</h2>
            <p>
              In no event shall FundiWako or its suppliers be liable for any damages (including, without limitation, damages for loss 
              of data or profit, or due to business interruption) arising out of the use or inability to use the materials on FundiWako, 
              even if FundiWako or an authorized representative has been notified orally or in writing of the possibility of such damage.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Accuracy of Materials</h2>
            <p>
              The materials appearing on FundiWako could include technical, typographical, or photographic errors. FundiWako does not 
              warrant that any of the materials on the platform are accurate, complete, or current. FundiWako may make changes to the 
              materials contained on the platform at any time without notice.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Links</h2>
            <p>
              FundiWako has not reviewed all of the sites linked to its website and is not responsible for the contents of any such 
              linked site. The inclusion of any link does not imply endorsement by FundiWako of the site. Use of any such linked website 
              is at the user's own risk.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Modifications</h2>
            <p>
              FundiWako may revise these Terms of Service for the website at any time without notice. By using the platform, you are 
              agreeing to be bound by the then current version of these Terms of Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. User Responsibilities</h2>
            <p>You are responsible for:</p>
            <ul className="list-disc list-inside space-y-2 ml-4 mt-2">
              <li>Maintaining the confidentiality of your account credentials</li>
              <li>All activities that occur under your account</li>
              <li>Notifying FundiWako of unauthorized use of your account</li>
              <li>Providing accurate and truthful information</li>
              <li>Complying with all applicable laws and regulations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Prohibited Conduct</h2>
            <p>You agree not to:</p>
            <ul className="list-disc list-inside space-y-2 ml-4 mt-2">
              <li>Engage in any form of harassment or abuse</li>
              <li>Post misleading or fraudulent information</li>
              <li>Interfere with or disrupt the service</li>
              <li>Attempt to gain unauthorized access to the platform</li>
              <li>Use the platform for illegal purposes</li>
              <li>Post or transmit spam, viruses, or harmful code</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Governing Law</h2>
            <p>
              These Terms of Service and any separate agreements we provide to use the service are governed by and construed in 
              accordance with the laws of Kenya, and you irrevocably submit to the exclusive jurisdiction of the courts in Kenya.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Contact Us</h2>
            <p>If you have any questions about these Terms of Service, please contact us at:</p>
            <p className="mt-2">
              Email: support@fundiwako.com<br/>
              Address: FundiWako Support, Kenya
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
