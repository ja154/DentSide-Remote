import { Shield } from 'lucide-react';
import LegalPage from '../components/LegalPage';

const PRIVACY_SECTIONS = [
  {
    heading: '1. Introduction',
    body: [
      'DentSide Remote respects your privacy and is committed to protecting your personal data. This policy explains what we collect, how we use it, and the rights available to you when you use the website and related services.',
    ],
  },
  {
    heading: '2. The Data We Collect About You',
    body: [
      'We may collect several categories of personal data to operate the platform securely and effectively.',
    ],
    bullets: [
      'Identity data including your name, title, username, and professional license information.',
      'Contact data including email address and telephone numbers.',
      'Financial data including bank account or payment card details used for platform payouts.',
      'Technical data including IP address, login details, browser type, and device usage information.',
    ],
  },
  {
    heading: '3. How We Use Your Personal Data',
    body: [
      'We use personal data only when there is a lawful basis for doing so. This commonly includes operating your account, facilitating gig matching, enabling payments, and meeting compliance or security obligations.',
    ],
    bullets: [
      'To perform the contract we enter into with you, such as matching you with remote opportunities.',
      'To support our legitimate interests, provided those interests do not override your rights and freedoms.',
      'To comply with legal, regulatory, and trust-and-safety requirements.',
    ],
  },
  {
    heading: '4. Data Security',
    body: [
      'We maintain safeguards designed to prevent accidental loss, unauthorized access, misuse, alteration, or disclosure of personal data. Access is limited to personnel, contractors, and partners who have a legitimate business need to know.',
    ],
  },
  {
    heading: '5. Contact Us',
    body: [
      'Questions about this privacy policy or our data practices can be sent to privacy@dentsideremote.com.',
    ],
  },
];

export default function Privacy() {
  return (
    <LegalPage
      title="Privacy Policy"
      subtitle="This policy explains how DentSide Remote collects, uses, stores, and protects personal data across the platform."
      updatedAt="April 12, 2026"
      icon={<Shield size={28} />}
      sections={PRIVACY_SECTIONS}
    />
  );
}
