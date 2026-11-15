import {createHash} from 'node:crypto';
// Used only to hash rate-limit keys. Passwords are managed exclusively by Supabase Auth.
export function digest(value:string){return createHash('sha256').update(value).digest('hex');}
