import { ArrowLeft, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Privacy() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-slate-200">
        <Link to="/" className="inline-flex items-center text-teal-600 hover:text-teal-700 font-medium mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
        </Link>
        
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-teal-100 p-3 rounded-xl">
            <Shield className="w-8 h-8 text-teal-600" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900">Privacy Policy</h1>
        </div>

        <div className="prose prose-slate max-w-none">
          <p className="text-slate-500 mb-8">Last updated: April 12, 2026</p>

          <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-4">1. Introduction</h2>
          <p className="text-slate-600 mb-6 leading-relaxed">
            Welcome to DentSide Remote. We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you as to how we look after your personal data when you visit our website and tell you about your privacy rights and how the law protects you.
          </p>

          <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-4">2. The Data We Collect About You</h2>
          <p className="text-slate-600 mb-6 leading-relaxed">
            We may collect, use, store and transfer different kinds of personal data about you which we have grouped together as follows:
          </p>
          <ul className="list-disc pl-6 text-slate-600 mb-6 space-y-2">
            <li><strong>Identity Data</strong> includes first name, last name, username or similar identifier, title, and professional licenses.</li>
            <li><strong>Contact Data</strong> includes email address and telephone numbers.</li>
            <li><strong>Financial Data</strong> includes bank account and payment card details for gig payouts.</li>
            <li><strong>Technical Data</strong> includes internet protocol (IP) address, your login data, browser type and version.</li>
          </ul>

          <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-4">3. How We Use Your Personal Data</h2>
          <p className="text-slate-600 mb-6 leading-relaxed">
            We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:
          </p>
          <ul className="list-disc pl-6 text-slate-600 mb-6 space-y-2">
            <li>Where we need to perform the contract we are about to enter into or have entered into with you (e.g., matching you with remote gigs).</li>
            <li>Where it is necessary for our legitimate interests (or those of a third party) and your interests and fundamental rights do not override those interests.</li>
            <li>Where we need to comply with a legal obligation.</li>
          </ul>

          <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-4">4. Data Security</h2>
          <p className="text-slate-600 mb-6 leading-relaxed">
            We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used or accessed in an unauthorized way, altered or disclosed. In addition, we limit access to your personal data to those employees, agents, contractors and other third parties who have a business need to know.
          </p>

          <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-4">5. Contact Us</h2>
          <p className="text-slate-600 mb-6 leading-relaxed">
            If you have any questions about this privacy policy or our privacy practices, please contact us at privacy@dentsideremote.com.
          </p>
        </div>
      </div>
    </div>
  );
}
