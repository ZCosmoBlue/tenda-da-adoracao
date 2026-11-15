import {env} from 'cloudflare:workers';


export function supabaseConfig(){
 const url=env.SUPABASE_URL,key=env.SUPABASE_PUBLISHABLE_KEY;
 if(!url||!key||!url.startsWith('https://')||!key.startsWith('sb_publishable_'))throw new Error('Supabase configuration missing');
 return {url,key};
}
