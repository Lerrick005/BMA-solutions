import { useState } from 'react';
import { Shield, FileText, ExternalLink } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);

  return (
    <>
      <footer className="border-t border-gray-200 py-4 px-6 mt-8 bg-white">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Copyright */}
          <p className="text-sm text-gray-500">
            © {currentYear} BMA Solutions. All rights reserved.
          </p>

          {/* Links */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowTerms(true)}
              className="text-sm text-gray-500 hover:text-brand-green transition-colors flex items-center gap-1"
            >
              <FileText className="w-3 h-3" />
              Terms & Conditions
            </button>
            <span className="text-gray-300">|</span>
            <button
              onClick={() => setShowPrivacy(true)}
              className="text-sm text-gray-500 hover:text-brand-green transition-colors flex items-center gap-1"
            >
              <Shield className="w-3 h-3" />
              Privacy Policy
            </button>
            <span className="text-gray-300">|</span>
            <span className="text-sm text-gray-400 flex items-center gap-1">
              v2.0.0
            </span>
            <span className="text-gray-300">|</span>
            <span className="text-sm text-gray-400 flex items-center gap-1">
              Made with ❤️ by Brian Arika
            </span>
          </div>
        </div>
      </footer>

      {/* Terms & Conditions Modal */}
      {showTerms && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-soft-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white z-10 flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <FileText className="w-5 h-5 text-brand-green" />
                Terms & Conditions
              </h2>
              <button
                onClick={() => setShowTerms(false)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 space-y-4 text-gray-600 text-sm leading-relaxed">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">1. Acceptance of Terms</h3>
                <p>By using BMA Solutions CRM ("the Service"), you agree to be bound by these Terms & Conditions. If you do not agree, please do not use the Service.</p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">2. User Accounts</h3>
                <p>You are responsible for maintaining the confidentiality of your account credentials. You agree to notify us immediately of any unauthorized use of your account.</p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">3. Data Ownership</h3>
                <p>You retain ownership of all data you input into the Service. BMA Solutions does not claim ownership of your data.</p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">4. Prohibited Activities</h3>
                <p>You agree not to use the Service for any unlawful purpose or in any way that could damage the Service or impair the experience of other users.</p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">5. Termination</h3>
                <p>We reserve the right to suspend or terminate your account at any time for violation of these Terms & Conditions.</p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">6. Limitation of Liability</h3>
                <p>The Service is provided "as is" without warranties of any kind. BMA Solutions is not liable for any damages arising from your use of the Service.</p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">7. Changes to Terms</h3>
                <p>We may update these Terms & Conditions from time to time. Continued use of the Service constitutes acceptance of the updated terms.</p>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-400">Last updated: {new Date().toLocaleDateString()}</p>
              </div>
            </div>
            <div className="sticky bottom-0 bg-white p-6 border-t border-gray-100">
              <button
                onClick={() => setShowTerms(false)}
                className="w-full px-4 py-2 bg-brand-green text-white rounded-lg hover:bg-brand-green-dark transition-colors"
              >
                I Agree
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Privacy Policy Modal */}
      {showPrivacy && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-soft-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white z-10 flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <Shield className="w-5 h-5 text-brand-green" />
                Privacy Policy
              </h2>
              <button
                onClick={() => setShowPrivacy(false)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 space-y-4 text-gray-600 text-sm leading-relaxed">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">1. Information We Collect</h3>
                <p>We collect information you provide directly, including your name, email address, phone number, company details, and any data you input into the CRM system.</p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">2. How We Use Your Information</h3>
                <p>Your data is used to provide and improve the Service, personalize your experience, and communicate with you about updates and offers.</p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">3. Data Security</h3>
                <p>We implement appropriate technical and organizational measures to protect your data against unauthorized access, alteration, or destruction.</p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">4. Data Sharing</h3>
                <p>We do not sell your personal data to third parties. We may share data with trusted service providers who assist in operating our platform.</p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">5. Cookies</h3>
                <p>We use cookies to enhance your experience, analyze usage patterns, and remember your preferences. You can control cookie settings in your browser.</p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">6. Your Rights</h3>
                <p>You have the right to access, correct, or delete your personal data at any time. Contact us at <span className="text-brand-green">info@bmasolutions.com</span>.</p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">7. Third-Party Links</h3>
                <p>Our Service may contain links to third-party websites. We are not responsible for the privacy practices of those sites.</p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">8. Changes to Policy</h3>
                <p>We may update this Privacy Policy periodically. We will notify you of significant changes via email or in-app notification.</p>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-400">Last updated: {new Date().toLocaleDateString()}</p>
                <p className="text-xs text-gray-400 mt-1">Contact: <span className="text-brand-green">info@bmasolutions.com</span></p>
              </div>
            </div>
            <div className="sticky bottom-0 bg-white p-6 border-t border-gray-100">
              <button
                onClick={() => setShowPrivacy(false)}
                className="w-full px-4 py-2 bg-brand-green text-white rounded-lg hover:bg-brand-green-dark transition-colors"
              >
                I Agree
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Footer;