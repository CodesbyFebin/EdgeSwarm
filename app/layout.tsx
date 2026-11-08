import type { Metadata } from 'next';
import './globals.css';

const repo = 'https://github.com/CodesbyFebin/EdgeSwarm';
export const metadata: Metadata = {
  metadataBase: new URL('https://edge-swarm.vercel.app'),
  title: 'EdgeSwarm — Signed Work, Verified Results, Solana Devnet',
  description: 'A live full-stack verifiable-work prototype with signed task evidence, deterministic replay, PostgreSQL-backed sessions, and wallet-approved Solana Devnet payment intents.',
  keywords: ['EdgeSwarm', 'verifiable edge computing', 'signed task evidence', 'deterministic replay', 'Next.js', 'Android Kotlin', 'Solana Devnet concept'],
  alternates: { canonical: '/' },
  openGraph: {title:'EdgeSwarm — Signed Work. Verified Results.', description:'Inspect signed evidence, reject tampered work, and prepare a job-linked Solana Devnet payment.', url:'https://edge-swarm.vercel.app', type:'website'},
  twitter: {card:'summary',title:'EdgeSwarm — Verifiable Edge-Agent Work',description:'Signed evidence, replay checks and job-linked Solana Devnet payment intents.'},
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
