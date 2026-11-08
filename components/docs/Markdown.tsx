'use client';
import React,{useState} from 'react';
import {Check,Copy} from 'lucide-react';
function slug(s:string){return s.toLowerCase().replace(/[^a-z0-9\s-]/g,'').trim().replace(/\s+/g,'-').slice(0,80)}
function safeHref(s:string){return /^(https?:|mailto:)/i.test(s)||s.startsWith('#')?s:'#'}
function Inline({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g).filter(Boolean);
  return <>{parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) return <strong key={i}>{part.slice(2,-2)}</strong>;
    if (part.startsWith("`") && part.endsWith("`")) return <code key={i} className="md-inline-code">{part.slice(1,-1)}</code>;
    const m = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (m) return <a key={i} href={safeHref(m[2])} target="_blank" rel="noopener" className="underline decoration-[var(--accent)] underline-offset-2 font-medium" style={{color:"var(--accent)"}}>{m[1]}</a>;
    return <span key={i}>{part}</span>;
  })}</>;
}
function CodeBlock({ code, lang }: { code: string; lang: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => { const ta = document.createElement("textarea"); ta.value = code; ta.style.position="fixed"; ta.style.opacity="0"; document.body.appendChild(ta); ta.select(); try { document.execCommand("copy"); setCopied(true); setTimeout(()=>setCopied(false),1600); } catch {} document.body.removeChild(ta); };
  return <div className="my-4 overflow-hidden rounded-xl border border-black/20" style={{background:"var(--code-bg)"}}>
    <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/10"><span className="text-[11px] uppercase tracking-[0.16em] text-zinc-400 font-semibold">{lang || "code"}</span><button onClick={copy} className="flex items-center gap-1.5 rounded-md bg-white/10 hover:bg-white/20 px-2.5 py-1 text-xs text-white transition">{copied ? <Check size={13}/> : <Copy size={13}/>} {copied ? "Copied" : "Copy"}</button></div>
    <pre className="overflow-x-auto p-4 text-[13px] leading-relaxed" style={{color:"var(--code-text)"}}><code>{code}</code></pre>
  </div>;
}
function Markdown({ content }: { content: string }) {
  const nodes: React.ReactNode[] = [];
  const lines = content.split("\n");
  let i = 0, key = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (line.trim().startsWith("```")) { const lang = line.trim().slice(3).trim(); const buf: string[] = []; i++; while (i < lines.length && !lines[i].trim().startsWith("```")) { buf.push(lines[i]); i++; } i++; nodes.push(<CodeBlock key={key++} code={buf.join("\n")} lang={lang} />); continue; }
    if (line.startsWith("# ")) { nodes.push(<h1 key={key++} id={slug(line.slice(2))} className="md-h1">{line.slice(2).trim()}</h1>); i++; continue; }
    if (line.startsWith("## ")) { const t=line.slice(3).trim(); nodes.push(<h2 key={key++} id={slug(t)} className="md-h2"><Inline text={t} /></h2>); i++; continue; }
    if (line.startsWith("### ")) { const t=line.slice(4).trim(); nodes.push(<h3 key={key++} id={slug(t)} className="md-h3"><Inline text={t} /></h3>); i++; continue; }
    if (line.startsWith("> ")) { nodes.push(<div key={key++} className="md-quote"><Inline text={line.slice(2)} /></div>); i++; continue; }
    if (line.trim() === "---" || line.trim() === "***") { nodes.push(<hr key={key++} className="my-7" style={{borderColor:"var(--border)"}} />); i++; continue; }
    if (/^\s*-\s\[[ xX]\]/.test(line)) { const items: string[] = []; while (i < lines.length && /^\s*-\s\[[ xX]\]/.test(lines[i])) { items.push(lines[i]); i++; } nodes.push(<div key={key++} className="mb-4">{items.map((it,j)=>{ const checked=/\[x\]|\[X\]/.test(it); const txt=it.replace(/^\s*-\s\[[ xX]\]\s*/,""); return <label key={j} className="md-check"><input type="checkbox" checked={checked} readOnly /><span className={checked?"line-through opacity-60":""}><Inline text={txt} /></span></label>; })}</div>); continue; }
    if (/^\s*[-*]\s+/.test(line)) { const items: string[]=[]; while (i<lines.length && /^\s*[-*]\s+/.test(lines[i])) { items.push(lines[i].replace(/^\s*[-*]\s+/,"")); i++; } nodes.push(<ul key={key++} className="md-ul">{items.map((it,j)=><li key={j}><Inline text={it} /></li>)}</ul>); continue; }
    if (/^\s*\d+[.)]\s+/.test(line)) { const items: string[]=[]; while (i<lines.length && /^\s*\d+[.)]\s+/.test(lines[i])) { items.push(lines[i].replace(/^\s*\d+[.)]\s+/,"")); i++; } nodes.push(<ol key={key++} className="md-ol">{items.map((it,j)=><li key={j}><Inline text={it} /></li>)}</ol>); continue; }
    if (line.trim() === "") { i++; continue; }
    const buf: string[] = [line];
    i++;
    while (i < lines.length && lines[i].trim() !== "" && !lines[i].startsWith("#") && !lines[i].trim().startsWith("```") && !/^\s*[-*]\s+/.test(lines[i]) && !/^\s*\d+[.)]\s+/.test(lines[i]) && !lines[i].startsWith("> ")) { buf.push(lines[i]); i++; }
    nodes.push(<p key={key++} className="md-p"><Inline text={buf.join(" ")} /></p>);
  }
  return <div>{nodes}</div>;
}


export default Markdown;
