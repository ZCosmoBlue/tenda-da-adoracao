import fs from 'node:fs';
import {randomBytes} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import assert from 'node:assert/strict';
const base='http://localhost:5173';
const vars=Object.fromEntries(fs.readFileSync('.dev.vars','utf8').split(/\r?\n/).filter(s=>s.includes('=')).map(s=>[s.slice(0,s.indexOf('=')),s.slice(s.indexOf('=')+1)]));
function sql(command){const r=spawnSync(process.execPath,['--import','./scripts/sites-env.mjs','./node_modules/wrangler/bin/wrangler.js','d1','execute','DB','--local','--config','wrangler.local.json','--persist-to','.wrangler/state','--command',command,'--json'],{encoding:'utf8'});if(r.status!==0)throw Error('Local database test command failed');return JSON.parse(r.stdout)[0].results;}
assert.equal(sql('SELECT COUNT(*) AS n FROM auth_users')[0].n,0,'Run only before creating real local accounts. No existing account is changed.');
const password=randomBytes(24).toString('hex'),email=vars.OWNER_EMAIL,editorEmail='auth-review@example.test';let ownerCreated=false;
async function call(path,body,cookie='',method='POST',origin=base){return fetch(base+path,{method,redirect:'manual',headers:{...(origin?{origin}:{}),...(cookie?{cookie}:{}),'Content-Type':'application/json'},...(body?{body:JSON.stringify(body)}:{})});}
function cookie(response){return response.headers.get('set-cookie')?.split(';')[0]||'';}
try{
 assert.equal((await call('/api/entries?admin=1',null,'','GET')).status,403);
 assert.equal((await call('/api/admin/users',null,'','GET')).status,403);
 assert.equal((await call('/api/auth/login',{email,password},'','POST','')).status,403);
 assert.equal((await call('/api/auth/activate',{email,password,token:'0'.repeat(64),setup:true})).status,400);
 let r=await call('/api/auth/activate',{email,password,token:vars.ADMIN_SETUP_TOKEN,setup:true});assert.equal(r.status,200,await r.text());ownerCreated=true;
 assert.equal((await call('/api/auth/activate',{email,password,token:vars.ADMIN_SETUP_TOKEN,setup:true})).status,409);
 r=await call('/api/auth/login',{email,password});assert.equal(r.status,200,await r.text());const owner=cookie(r);assert.match(r.headers.get('set-cookie'),/HttpOnly/);assert.match(r.headers.get('set-cookie'),/SameSite=Strict/);assert(owner);
 assert.equal((await call('/api/admin/users',null,owner,'GET')).status,200);
 r=await call('/api/admin/users',{email:editorEmail,name:'Temporary test editor'},owner);assert.equal(r.status,200);const {link}=await r.json(),token=new URL(link).hash.slice(1);
 assert.equal((await call('/api/auth/activate',{email:editorEmail,password,token,setup:false})).status,200);
 assert.equal((await call('/api/auth/activate',{email:editorEmail,password,token,setup:false})).status,400);
 r=await call('/api/auth/login',{email:editorEmail,password});assert.equal(r.status,200);let editor=cookie(r);
 assert.equal((await call('/api/entries?admin=1',null,editor,'GET')).status,200);
 assert.equal((await call('/api/admin/users',null,editor,'GET')).status,403);
 assert.equal((await call('/api/settings',{},editor,'PUT')).status,403);
 const users=await(await call('/api/admin/users',null,owner,'GET')).json();const id=users.find(u=>u.email===editorEmail).id;
 assert.equal((await call('/api/admin/users',{id,action:'disable'},owner,'PATCH')).status,200);
 assert.equal((await call('/api/entries?admin=1',null,editor,'GET')).status,403);
 assert.equal((await call('/api/auth/login',{email:editorEmail,password})).status,401);
 await call('/api/admin/users',{id,action:'enable'},owner,'PATCH');r=await call('/api/auth/login',{email:editorEmail,password});editor=cookie(r);assert(editor);
 sql("UPDATE auth_sessions SET expires_at=0 WHERE user_id='"+id+"'");assert.equal((await call('/api/entries?admin=1',null,editor,'GET')).status,403);
 r=await call('/api/auth/login',{email,password});const another=cookie(r);assert.equal((await call('/api/auth/logout',null,another)).status,200);assert.equal((await call('/api/admin/users',null,another,'GET')).status,403);
 assert.equal((await call('/api/auth/password',{current:password,password:password+'new'},owner)).status,200);
 assert.equal((await call('/api/admin/users',null,owner,'GET')).status,403);
 assert.equal((await call('/api/auth/login',{email,password})).status,401);
 r=await call('/api/auth/login',{email,password:password+'new'});assert.equal(r.status,200);
 for(let i=0;i<8;i++)assert.equal((await call('/api/auth/login',{email:'unknown@example.test',password:'wrong'})).status,401);
 assert.equal((await call('/api/auth/login',{email:'unknown@example.test',password:'wrong'})).status,429);
 console.log('PASS: anonymous denial, CSRF, setup once, login, invitation once, editor restrictions, block/revoke, expiry, logout, password change and rate limit.');
}finally{
 if(ownerCreated){sql("DELETE FROM auth_sessions WHERE user_id IN (SELECT id FROM auth_users WHERE id='owner' OR email='auth-review@example.test')");sql("DELETE FROM auth_users WHERE id='owner' OR email='auth-review@example.test'");}
 sql('DELETE FROM auth_attempts');console.log('Temporary local accounts removed. Owner setup is ready.');
}
