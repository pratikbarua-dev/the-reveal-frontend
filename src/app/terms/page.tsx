import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Terms of Service for using The Reveal.',
};

export default function TermsOfService() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-12 text-muted font-sans leading-relaxed">
      <h1 className="text-3xl font-black text-contrast tracking-tight uppercase mb-2">
        Terms of Service
      </h1>
      <p className="text-sm text-muted mb-8 uppercase tracking-widest font-semibold">
        Last Updated: July 3, 2026
      </p>

      <section className="mb-8">
        <p className="mb-4">
          Welcome to <strong className="text-contrast">The Reveal</strong>!
        </p>
        <p className="mb-4">
          These terms and conditions outline the rules and regulations for the use of The Reveal's Website, located at <Link href="/" className="text-secondary hover:underline">https://the-reveal-frontend.vercel.app</Link>.
        </p>
        <p className="mb-4">
          By accessing this website, we assume you accept these terms and conditions. Do not continue to use The Reveal if you do not agree to take all of the terms and conditions stated on this page.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-black text-contrast uppercase tracking-wider mb-3">
          1. Eligibility & Age Restriction
        </h2>
        <p className="mb-4">
          The Reveal is an interactive game designed for adults to explore intimate positions, connection, and relationship ideas. By using this website, you warrant and represent that you are at least <strong className="text-contrast">18 years of age</strong> (or the age of majority in your jurisdiction, whichever is older). If you are under 18, you are strictly prohibited from using or accessing this application.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-black text-contrast uppercase tracking-wider mb-3">
          2. Intellectual Property Rights
        </h2>
        <p className="mb-4">
          Unless otherwise stated, The Reveal and/or its licensors own the intellectual property rights for all material on The Reveal. All intellectual property rights are reserved. You may access this from The Reveal for your own personal use subjected to restrictions set in these terms and conditions.
        </p>
        <p className="mb-4">
          You must not:
        </p>
        <ul className="list-disc pl-6 mb-4 flex flex-col gap-2">
          <li>Republish material from The Reveal.</li>
          <li>Sell, rent, or sub-license material from The Reveal.</li>
          <li>Reproduce, duplicate, or copy material from The Reveal.</li>
          <li>Redistribute content from The Reveal.</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-black text-contrast uppercase tracking-wider mb-3">
          3. User Accounts & Lobbies
        </h2>
        <ul className="list-disc pl-6 mb-4 flex flex-col gap-2">
          <li>
            <strong className="text-contrast">Registered Accounts:</strong> Accounts created via Google OAuth require providing accurate email and profile information. You are responsible for maintaining the confidentiality of your session tokens.
          </li>
          <li>
            <strong className="text-contrast">Guest Mode:</strong> Guests may use locally stored profiles to access lobby and scratching features. Guest session states are stored in browser local storage and are not guaranteed to persist across different browsers or clearing browser caches.
          </li>
          <li>
            <strong className="text-contrast">Lobby Safety:</strong> We provide real-time chat, reactions, and game rooms. You agree to use these features respectfully and refrain from sharing explicit, non-consensual, abusive, or illegal media or content.
          </li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-black text-contrast uppercase tracking-wider mb-3">
          4. Disclaimer of Warranties & Limitation of Liability
        </h2>
        <p className="mb-4">
          This website and its content are provided on an "as is" and "as available" basis without any warranties of any kind. The Reveal does not guarantee the continuous availability, safety, or accuracy of the gameplay or content.
        </p>
        <p className="mb-4">
          In no event shall The Reveal, its creators, or its affiliates be liable for any damages (including, without limitation, direct, indirect, incidental, special, or consequential damages) arising out of the use, safety, physical play, or inability to use the materials on our platform.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-black text-contrast uppercase tracking-wider mb-3">
          5. Governing Law
        </h2>
        <p className="mb-4">
          Any claim related to The Reveal's website shall be governed by the laws of our operating country without regard to its conflict of law provisions.
        </p>
      </section>

      <section className="mb-8 border-t border-primary/10 pt-6">
        <h2 className="text-lg font-black text-contrast uppercase tracking-wider mb-3">
          6. Contact Us
        </h2>
        <p className="mb-4">
          If you have any questions or complaints regarding these Terms, please contact us at:
        </p>
        <ul className="list-disc pl-6">
          <li>By email: <strong className="text-contrast">pratikbarua52@gmail.com</strong></li>
        </ul>
      </section>
    </div>
  );
}
