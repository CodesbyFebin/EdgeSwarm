import type { Metadata } from 'next';
import './globals.css';

const repo = 'https://github.com/CodesbyFebin/EdgeSwarm';
export const metadata: Metadata = {
  title: 'EdgeSwarm — Verifiable Edge-Agent Work Prototype',
  description: 'Open-source Next.js demonstration of signed edge-agent task results, deterministic replay verification, and simulated credit settlement. Solana Devnet payments are not deployed.',
  keywords: ['EdgeSwarm', 'verifiable edge computing', 'signed task evidence', 'deterministic replay', 'Next.js', 'Android Kotlin', 'Solana Devnet concept'],
  alternates: { canonical: repo },
  robots: { index: true, follow: true }
};
const schema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareSourceCode',
  name: 'EdgeSwarm',
  description: 'Open-source prototype for signed edge-agent work evidence, local verification, and simulated settlement.',
  codeRepository: repo,
  url: repo,
  license: 'https://spdx.org/licenses/Apache-2.0',
  programmingLanguage: ['TypeScript', 'Kotlin'],
  softwareVersion: '0.1.0',
  isAccessibleForFree: true
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, '\\u003c') }} />
    {children}
  </body></html>;
}
