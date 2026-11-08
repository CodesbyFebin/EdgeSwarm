import type {MetadataRoute} from 'next';
export default function robots():MetadataRoute.Robots{return {rules:{userAgent:'*',allow:'/',disallow:['/api/','/jobs/']},sitemap:'https://edge-swarm.vercel.app/sitemap.xml'}}
