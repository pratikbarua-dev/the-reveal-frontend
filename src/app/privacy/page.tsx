import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Privacy Policy and data practices for The Reveal.',
};

export default function PrivacyPolicy() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-12 text-muted font-sans leading-relaxed">
      <h1 className="text-3xl font-black text-contrast tracking-tight uppercase mb-2">
        Privacy Policy
      </h1>
      <p className="text-sm text-muted mb-8 uppercase tracking-widest font-semibold">
        Last Updated: July 3, 2026
      </p>

      <section className="mb-8">
        <p className="mb-4">
          At <strong className="text-contrast">The Reveal</strong> (accessible from <Link href="/" className="text-secondary hover:underline">https://reveal.probaho.site</Link>), one of our main priorities is the privacy of our visitors. This Privacy Policy document contains types of information that is collected and recorded by The Reveal and how we use it.
        </p>
        <p className="mb-4">
          If you have additional questions or require more information about our Privacy Policy, do not hesitate to contact us at <strong className="text-contrast">pratikbarua52@gmail.com</strong>.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-black text-contrast uppercase tracking-wider mb-3">
          1. Consent
        </h2>
        <p className="mb-4">
          By using our website, you hereby consent to our Privacy Policy and agree to its terms.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-black text-contrast uppercase tracking-wider mb-3">
          2. Information We Collect
        </h2>
        <p className="mb-4">
          The personal information that you are asked to provide, and the reasons why you are asked to provide it, will be made clear to you at the point we ask you to provide your personal information.
        </p>
        <ul className="list-disc pl-6 mb-4 flex flex-col gap-2">
          <li>
            <strong className="text-contrast">Account Information:</strong> When you register for an account via Google OAuth, we receive your email address, name, profile picture, and Google identifier.
          </li>
          <li>
            <strong className="text-contrast">Guest Sessions:</strong> If you use the application as a guest, we generate and store a randomized display name (e.g. Guest_A12B) and unique identifier in your browser's local storage to save game session preferences locally.
          </li>
          <li>
            <strong className="text-contrast">Game & Activity Logs:</strong> We log game history data (positions scratched, veto rates, and gameplay statistics) to persist your game room state and display analytics to platform administrators.
          </li>
          <li>
            <strong className="text-contrast">User Feedback:</strong> When you voluntarily submit feedback using the in-app feedback tool, we collect the feedback text, ratings, and optional user information you provide.
          </li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-black text-contrast uppercase tracking-wider mb-3">
          3. How We Use Your Information
        </h2>
        <p className="mb-4">
          We use the information we collect in various ways, including to:
        </p>
        <ul className="list-disc pl-6 mb-4 flex flex-col gap-2">
          <li>Provide, operate, and maintain our website.</li>
          <li>Improve, personalize, and expand our website gameplay.</li>
          <li>Understand and analyze how you use our website.</li>
          <li>Develop new products, services, features, and functionality.</li>
          <li>Facilitate real-time multiplayer game lobbies and game persistence.</li>
          <li>Prevent fraud, log errors, and monitor database health.</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-black text-contrast uppercase tracking-wider mb-3">
          4. Security of Data
        </h2>
        <p className="mb-4">
          The security of your data is important to us, but remember that no method of transmission over the Internet, or method of electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your Personal Data, we cannot guarantee its absolute security. Account sessions are secured with Next-Auth and MongoDB encryption algorithms.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-black text-contrast uppercase tracking-wider mb-3">
          5. GDPR Data Protection Rights
        </h2>
        <p className="mb-4">
          We want to make sure you are fully aware of all of your data protection rights. Every user is entitled to the following:
        </p>
        <ul className="list-disc pl-6 mb-4 flex flex-col gap-2">
          <li>
            <strong className="text-contrast">The right to access:</strong> You have the right to request copies of your personal data.
          </li>
          <li>
            <strong className="text-contrast">The right to rectification:</strong> You have the right to request that we correct any information you believe is inaccurate.
          </li>
          <li>
            <strong className="text-contrast">The right to erasure:</strong> You have the right to request that we erase your personal data under certain conditions.
          </li>
        </ul>
      </section>

      <section className="mb-8 border-t border-primary/10 pt-6">
        <h2 className="text-lg font-black text-contrast uppercase tracking-wider mb-3">
          6. Contact Us
        </h2>
        <p className="mb-4">
          If you have any questions about this Privacy Policy, you can contact us:
        </p>
        <ul className="list-disc pl-6">
          <li>By email: <strong className="text-contrast">pratikbarua52@gmail.com</strong></li>
        </ul>
      </section>
    </div>
  );
}
