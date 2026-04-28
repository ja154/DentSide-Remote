import { FileText } from 'lucide-react';
import LegalPage from '../components/LegalPage';

const TERMS_SECTIONS = [
  {
    heading: '1. Agreement to Terms',
    body: [
      'By accessing or using DentSide Remote, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any part of these terms, you may not use the platform.',
    ],
  },
  {
    heading: '2. Professional Licensing and Verification',
    body: [
      'DentSide Remote is built for dental professionals. By registering, you represent that you hold valid and active licenses in the jurisdictions you claim and that any verification documents you provide are accurate and current.',
      'We may suspend or terminate access for accounts that fail verification, submit false credentials, or otherwise undermine platform trust and safety.',
    ],
  },
  {
    heading: '3. Platform Services and Gig Matching',
    body: [
      'We provide infrastructure for connecting dental professionals with remote opportunities including teledentistry, claims review, freelance work, and corporate roles. We do not guarantee specific opportunity volume, income, or hiring outcomes.',
      'Unless a hiring entity explicitly states otherwise, you participate on the platform as an independent contractor when accepting gigs.',
    ],
  },
  {
    heading: '4. HIPAA and Patient Privacy',
    body: [
      'When engaging in teledentistry or claims review work, you are responsible for following HIPAA requirements and other applicable privacy laws such as GDPR where relevant.',
      'You agree not to download, store, or transmit protected health information outside approved DentSide Remote workflows and secure environments.',
    ],
  },
  {
    heading: '5. Payments and Fees',
    body: [
      'DentSide Remote may process payments through third-party providers such as Stripe, PayPal, or Wise. Platform fees or commissions, when applicable, will be disclosed before you accept an opportunity.',
      'You remain responsible for taxes, reporting obligations, and compliance requirements in your jurisdiction.',
    ],
  },
  {
    heading: '6. Limitation of Liability',
    body: [
      "DentSide Remote and its suppliers will not be liable for damages arising from your use of, or inability to use, the platform, including loss of data, lost profit, or business interruption to the fullest extent permitted by law.",
    ],
  },
];

export default function Terms() {
  return (
    <LegalPage
      title="Terms of Service"
      subtitle="These terms govern access to DentSide Remote, including clinician verification, platform use, payments, and privacy responsibilities."
      updatedAt="April 12, 2026"
      icon={<FileText size={28} />}
      sections={TERMS_SECTIONS}
    />
  );
}
