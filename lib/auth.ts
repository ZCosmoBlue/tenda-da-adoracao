import {supabaseServer,supabaseAccount} from './supabase-server';
export type Account={userId:string;email:string;name:string;role:'owner'|'editor'};
export async function currentAccount():Promise<Account|null>{
 return supabaseAccount((await supabaseServer()).client);
}
