import {DEVNET_RPC,DEVNET_GENESIS,SIGNATURE} from './solana-payments.mjs';
export async function devnetRpc(method,params=[]){
 const response=await fetch(DEVNET_RPC,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({jsonrpc:'2.0',id:1,method,params}),cache:'no-store',signal:AbortSignal.timeout(10000)});
 if(!response.ok)throw Error('Solana Devnet RPC unavailable; retry later');
 const body=await response.json();if(body.error)throw Error('Solana Devnet RPC rejected the request; retry later');return body.result;
}
export async function devnetBlockhash(){
 const [genesis,result]=await Promise.all([devnetRpc('getGenesisHash'),devnetRpc('getLatestBlockhash',[{commitment:'confirmed'}])]);
 if(genesis!==DEVNET_GENESIS)throw Error('Wrong Solana cluster');return result.value;
}
export async function devnetTransaction(signature){
 if(!SIGNATURE.test(signature??''))throw Error('Invalid transaction signature');
 const [genesisHash,statuses,transaction]=await Promise.all([devnetRpc('getGenesisHash'),devnetRpc('getSignatureStatuses',[[signature],{searchTransactionHistory:true}]),devnetRpc('getTransaction',[signature,{encoding:'jsonParsed',commitment:'confirmed',maxSupportedTransactionVersion:0}])]);
 return {genesisHash,status:statuses?.value?.[0],transaction};
}
