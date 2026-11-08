import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata={title:'EdgeSwarm | Execute · Verify · Settle',description:'Local demonstration of verified edge work and simulated settlement.'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}
