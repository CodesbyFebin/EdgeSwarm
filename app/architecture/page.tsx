'use client';
import { useRef, useState, type CSSProperties, type ReactNode, type MouseEvent } from 'react';
import './architecture.css';

const modules = [
  {name:'Job Admission',detail:'Input + resource bounds',state:'implemented'},
  {name:'Policy Gate',detail:'Allowlist + safety limits',state:'prototype'},
  {name:'EdgeAgent',detail:'Android Kotlin worker',state:'implemented'},
  {name:'P-256 Signer',detail:'Android Keystore evidence',state:'implemented'},
  {name:'Evidence Envelope',detail:'Task + result hashes',state:'implemented'},
  {name:'Node Verifier',detail:'P-256 signature checks',state:'implemented'},
  {name:'Deterministic Replay',detail:'Repeatable task validation',state:'prototype'},
  {name:'Job Coordinator',detail:'Local jobs lifecycle',state:'prototype'},
  {name:'Wallet Approval',detail:'Solana Devnet transfer',state:'implemented'},
  {name:'On-chain Escrow',detail:'Verified-work payout',state:'planned'},
  {name:'Durable Storage',detail:'Multi-instance persistence',state:'planned'},
  {name:'Operator Access',detail:'Fail-closed API guard',state:'implemented'}
] as const;

function Tilt({children,kind='',className=''}:{children:ReactNode;kind?:string;className?:string}) {
  const ref=useRef<HTMLDivElement>(null);
  const [rotation,setRotation]=useState({x:0,y:0});
  function move(e:MouseEvent<HTMLDivElement>){
    if(!ref.current || window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
    const r=ref.current.getBoundingClientRect();
    setRotation({x:((r.top+r.height/2-e.clientY)/r.height)*7,y:((e.clientX-r.left-r.width/2)/r.width)*7});
  }
  return <div ref={ref} onMouseMove={move} onMouseLeave={()=>setRotation({x:0,y:0})} className={`ea-card ea-tilt ${kind} ${className}`} style={{'--rx':rotation.x+'deg','--ry':rotation.y+'deg'} as CSSProperties}>{children}</div>;
}
function Dot({status}:{status:'implemented'|'prototype'|'planned'}){return <span className={`ea-dot ea-${status}`} aria-label={status}/>;}
function Arrow(){return <div className="ea-arrow" aria-hidden="true"><span>↓</span></div>;}
export default function Architecture(){
 const [selected,setSelected]=useState('EdgeAgent');
 const [copied,setCopied]=useState(false);
 const chosen=modules.find(m=>m.name===selected) ?? modules[2];
 const mermaid=`flowchart TD
  UI[EdgeSwarm Web UI] --> COORD[Job Coordinator + Policy]
  COORD --> ANDROID[Android EdgeAgent]
  ANDROID --> SIGN[P-256 Android Keystore Signature]
  SIGN --> EVIDENCE[Task + Result Hash Evidence]
  EVIDENCE --> VERIFY[Node Signature Verifier]
  VERIFY --> REPLAY[Deterministic Replay]
  UI --> WALLET[Wallet-approved Solana Devnet Transfer]
  VERIFY -. future gated payout .-> ESCROW[Planned On-chain Escrow]
  ESCROW -. future .-> PAYOUT[Verified-work Settlement]`;
 async function copy(){try{await navigator.clipboard.writeText(mermaid);setCopied(true);window.setTimeout(()=>setCopied(false),2000);}catch{setCopied(false);}}
 return <div className="ea-root">
  <div className="ea-aurora" aria-hidden="true"/><div className="ea-gridbg" aria-hidden="true"/>
  <header className="ea-nav"><a className="ea-logo" href="/"><span className="ea-mark">⬡</span><span>EDGESWARM <small>/ SYSTEM ARCHITECTURE</small></span></a><div className="ea-navlinks"><a href="/">App</a><a href="/devnet-demo">Devnet</a><a href="https://github.com/CodesbyFebin/EdgeSwarm" target="_blank" rel="noreferrer">GitHub ↗</a></div></header>
  <main className="ea-main">
   <section className="ea-intro">
    <div className="ea-eyebrow"><span className="ea-live-dot"/> EDGE COMPUTE / VERIFIABLE EVIDENCE / SOLANA DEVNET</div>
    <h1>COMPUTE AT THE EDGE.<br/><span>TRUST IN THE PROOF.</span></h1>
    <p>Explore EdgeSwarm’s verifiable agent architecture: Android execution, P-256 signed evidence, independent verification, and a separate wallet-approved Devnet transfer path.</p>
    <div className="ea-intro-actions"><a className="ea-primary" href="/">Open EdgeSwarm ↗</a><a className="ea-secondary" href="/devnet-demo">Explore Devnet transfer ↗</a></div>
    <div className="ea-status"><span><Dot status="implemented"/> Implemented component</span><span><Dot status="prototype"/> Local prototype</span><span><Dot status="planned"/> Planned integration</span></div>
   </section>
   <section className="ea-stage" aria-label="Interactive EdgeSwarm architecture">
    <div className="ea-stage-label"><span>01 / CONTROL PLANE</span><span>EXECUTION → EVIDENCE → VERIFICATION</span></div>
    <div className="ea-toprow">
     <Tilt kind="ea-cyan"><div className="ea-card-top"><span className="ea-symbol">◈</span><span className="ea-state">WEB UI</span></div><h2>Job Creator</h2><p>Submit bounded local tasks and inspect job state.</p><div className="ea-micro">Next.js / React</div></Tilt>
     <Tilt kind="ea-purple"><div className="ea-card-top"><span className="ea-symbol">⌘</span><span className="ea-state">CONTROL</span></div><h2>Coordinator</h2><p>Admission, policy boundaries, job lifecycle.</p><div className="ea-micro">Node.js / operator guard</div></Tilt>
     <Tilt kind="ea-pink"><div className="ea-card-top"><span className="ea-symbol">▣</span><span className="ea-state">ANDROID</span></div><h2>EdgeAgent</h2><p>Android Kotlin task execution and Keystore-backed signing.</p><div className="ea-micro">Android / P-256</div></Tilt>
    </div>
    <Arrow/>
    <div className="ea-stage-label"><span>02 / CRYPTOGRAPHIC TRUST BOUNDARY</span><span>SIGNATURES ARE NOT SETTLEMENT</span></div>
    <div className="ea-center">
     <Tilt kind="ea-feature ea-purple"><div className="ea-icon-ring">◇</div><div><div className="ea-kicker">EVIDENCE LAYER</div><h2>Signed work receipts</h2><p>Bind job ID, task hash, and result hash to a P-256 ECDSA signature generated by Android Keystore.</p><div className="ea-chips"><span>SHA-256</span><span>P-256 ECDSA</span><span>SPKI public key</span></div></div></Tilt>
     <div className="ea-flow"><span className="ea-flowline"/><span>VERIFY</span><span className="ea-flowline"/></div>
     <Tilt kind="ea-feature ea-cyan"><div className="ea-icon-ring">✓</div><div><div className="ea-kicker">PROOF LAYER</div><h2>Independent verifier</h2><p>Node verification checks evidence signatures and authorized keys. Deterministic replay supports bounded local tasks.</p><div className="ea-chips"><span>Signature checks</span><span>Allowlist</span><span>Replay</span></div></div></Tilt>
    </div>
    <Arrow/>
    <div className="ea-stage-label"><span>03 / SOLANA INTEGRATION</span><span>DEVNET TEST SOL ONLY</span></div>
    <div className="ea-bottomrow">
      <Tilt kind="ea-green"><div className="ea-kicker">AVAILABLE ROUTE</div><h2>Wallet-approved Devnet transfer</h2><p>Connect a compatible wallet, approve a test-SOL transfer, and inspect the signature on Solana Explorer.</p><a className="ea-textlink" href="/devnet-demo">Open Devnet page ↗</a></Tilt>
      <div className="ea-separator"><span>≠</span><small>NOT YET LINKED</small></div>
      <Tilt kind="ea-pending"><div className="ea-kicker">PLANNED MILESTONE</div><h2>Verified-work escrow</h2><p>On-chain funding, evidence-gated payout authorization, refunds, and reconciliation are not deployed.</p><span className="ea-mutedlink">Architecture target / not live</span></Tilt>
    </div>
   </section>
   <section className="ea-modules"><div className="ea-section-head"><div><div className="ea-kicker">04 / COMPONENT EXPLORER</div><h2>Every layer. One trust model.</h2><p>Select a component to inspect its role and current implementation status.</p></div><button className="ea-copy" onClick={copy}>{copied?'Copied ✓':'Copy Mermaid diagram ↗'}</button></div>
    <div className="ea-modulegrid">{modules.map((m,i)=><button type="button" key={m.name} className={`ea-module ${selected===m.name?'ea-selected':''}`} onClick={()=>setSelected(m.name)} aria-pressed={selected===m.name}><div className="ea-modulemeta"><span>{String(i+1).padStart(2,'0')}</span><Dot status={m.state}/></div><strong>{m.name}</strong><small>{m.detail}</small></button>)}</div>
    <div className="ea-inspector" aria-live="polite"><div><span className="ea-kicker">SELECTED COMPONENT</span><h3>{chosen.name}</h3><p>{chosen.detail}</p></div><span className={`ea-status-pill ea-pill-${chosen.state}`}>{chosen.state==='implemented'?'IMPLEMENTED':chosen.state==='prototype'?'LOCAL PROTOTYPE':'PLANNED'}</span></div>
   </section>
   <section className="ea-outro"><div className="ea-kicker">BUILT FOR VERIFIABLE EDGE COMPUTE</div><h2>FROM DEVICE TO EVIDENCE.</h2><p>Explore the running application, review source code, or test a wallet-approved transaction on Solana Devnet.</p><div className="ea-intro-actions"><a className="ea-primary" href="/">Launch application ↗</a><a className="ea-secondary" href="https://github.com/CodesbyFebin/EdgeSwarm" target="_blank" rel="noreferrer">View source ↗</a></div></section>
  </main><footer className="ea-footer"><span>© EdgeSwarm · CodesbyFebin</span><span>Architecture visualization · no mainnet or escrow claims</span></footer>
 </div>;
}
