import {scrypt,randomBytes,timingSafeEqual,createHash} from 'node:crypto';

// OWASP scrypt profile: N=2^14, r=8, p=5 (bounded memory for Workers).
const options={N:16384,r:8,p:5,maxmem:32*1024*1024};
function derive(password:string,salt:string):Promise<Buffer>{
 return new Promise((resolve,reject)=>scrypt(password,salt,32,options,(error,key)=>error?reject(error):resolve(key)));
}
export function randomToken(){return randomBytes(32).toString('hex');}
export function digest(value:string){return createHash('sha256').update(value).digest('hex');}
export function equalSecret(a:string,b:string){return timingSafeEqual(Buffer.from(digest(a),'hex'),Buffer.from(digest(b),'hex'));}
export async function hashPassword(password:string){const salt=randomBytes(16).toString('hex');return `scrypt-v1$${salt}$${(await derive(password,salt)).toString('hex')}`;}
export async function verifyPassword(password:string,stored:string){
 const [version,salt,key]=stored.split('$');
 if(version!=='scrypt-v1'||!salt||!key||!/^[a-f0-9]{64}$/.test(key)){
  await derive(password,'00000000000000000000000000000000');return false;
 }
 return timingSafeEqual(await derive(password,salt),Buffer.from(key,'hex'));
}
