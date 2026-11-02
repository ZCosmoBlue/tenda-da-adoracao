// Stop on the first failure; report each confirmed upload before continuing.
export async function uploadSequence<T,R>(files:readonly T[],send:(file:T)=>Promise<R>,confirmed:(result:R,done:number)=>void){
 for(let index=0;index<files.length;index++){
  const result=await send(files[index]);
  confirmed(result,index+1);
 }
}
