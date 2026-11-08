export async function readJson(request){
 if(!request.headers.get('content-type')?.toLowerCase().startsWith('application/json'))throw Error('Expected application/json');
 const reader=request.body?.getReader();if(!reader)throw Error('Missing JSON body');
 let size=0;const chunks=[];
 try {while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>65536){await reader.cancel();throw Error('Request body exceeds 64 KiB')}chunks.push(Buffer.from(value))}}finally{reader.releaseLock()}
 const data=JSON.parse(Buffer.concat(chunks).toString('utf8'));
 if(!data||typeof data!=='object'||Array.isArray(data))throw Error('Expected JSON object');return data;
}
