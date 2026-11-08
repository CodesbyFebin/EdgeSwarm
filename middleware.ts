import {NextRequest,NextResponse} from 'next/server';
export function middleware(request:NextRequest){
 const existing=request.cookies.get('edgeswarm-session')?.value;
 const id=existing&&/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(existing)?existing:crypto.randomUUID();
 if(request.method!=='GET'&&request.method!=='HEAD'){
  const origin=request.headers.get('origin');
  if(!origin||!/^https?:\/\//.test(origin)||new URL(origin).host!==request.headers.get('host'))return NextResponse.json({error:'Same-origin browser request required'},{status:403});
 }
 request.cookies.set('edgeswarm-session',id);
 const headers=new Headers(request.headers);headers.set('cookie',request.cookies.toString());
 const response=NextResponse.next({request:{headers}});
 if(id!==existing)response.cookies.set('edgeswarm-session',id,{httpOnly:true,secure:request.nextUrl.protocol==='https:',sameSite:'strict',path:'/',maxAge:1800});
 response.headers.set('Cache-Control','no-store');
 return response;
}
export const config={matcher:['/api/:path*']};
