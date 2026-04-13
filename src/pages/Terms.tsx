import { ArrowLeft, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Terms() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-slate-200">
        <Link to="/" className="inline-flex items-center text-teal-600 hover:text-teal-700 font-medium mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
        </Link>
        
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-teal-100 p-3 rounded-xl">
            <FileText className="w-8 h-8 text-teal-600" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900">Terms of Service</h1>
        </div>

        <div className="prose prose-slate max-w-none">
          <p className="text-slate-500 mb-8">Last updated: April 12, 2026</p>

          <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-4">1. Agreement to Terms</h2>
          <p className="text-slate-600 mb-6 leading-relaxed">
            By accessing or using DentSide Remote, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this site.
          </p>

          <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-4">2. Professional Licensing and Verification</h2>
          <p className="text-slate-600 mb-6 leading-relaxed">
            DentSide Remote is a platform for dental professionals. By registering, you warrant that you hold valid, active dental licenses in the jurisdictions you claim. You agree to provide accurate documentation for verification. DentSide Remote reserves the right to suspend or terminate accounts that fail verification or provide false information.
          </p>

          <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-4">3. Platform Services and Gig Matching</h2>
          <p className="text-slate-600 mb-6 leading-relaxed">
            We provide a platform connecting dental professionals with remote opportunities (Teledentistry, Claims Review, Freelance, Corporate). We do not guarantee the availability of gigs, specific income levels, or the actions of third-party clients. You are acting as an independent contractor when accepting gigs through the platform unless explicitly stated otherwise by the hiring entity.
          </p>

          <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-4">4. HIPAA and Patient Privacy</h2>
          <p className="text-slate-600 mb-6 leading-relaxed">
            When engaging in Teledentistry or Claims Review, you must strictly adhere to HIPAA (or your local equivalent, e.g., GDPR) regulations regarding Protected Health Information (PHI). You agree not to download, store, or transmit PHI outside of the secure DentSide Remote environment.
          </p>

          <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-4">5. Payments and Fees</h2>
          <p className="text-slate-600 mb-6 leading-relaxed">
            DentSide Remote processes payments via third-party providers (e.g., Stripe, PayPal, Wise). We may charge a platform fee or commission on certain gigs, which will be clearly disclosed before you accept an opportunity. You are responsible for all applicable taxes in your jurisdiction.
          </p>

          <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-4">6. Limitation of Liability</h2>
          <p className="text-slate-600 mb-6 leading-relaxed">
            In no event shall DentSide Remote or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on DentSide Remote's website.
          </p>
        </div>
      </div>
    </div>
  );
}
