import type {Metadata} from 'next';
import DocsViewer from '../../components/docs/DocsViewer';
export const metadata:Metadata={title:'EdgeSwarm Docs — Implementation Guides and Blueprint Archive',description:'Repository-backed EdgeSwarm setup, API, Devnet payment and security guides, with a separately labeled unvalidated design archive.',alternates:{canonical:'/docs'}};
export default function Documentation(){return <DocsViewer/>}
