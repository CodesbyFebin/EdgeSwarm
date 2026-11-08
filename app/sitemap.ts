import type {MetadataRoute} from 'next';
export default function sitemap():MetadataRoute.Sitemap{return ['','/dashboard','/mobile','/devnet-demo'].map(path=>({url:'https://edge-swarm.vercel.app'+path,changeFrequency:'weekly',priority:path?0.6:1}))}
