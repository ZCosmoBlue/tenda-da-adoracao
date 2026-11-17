import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

const source=readFileSync(new URL('../lib/password-recovery.ts',import.meta.url),'utf8');
const compiled=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
let scenario={},calls=[],headers;
const client={auth:{
 resetPasswordForEmail:async(email,options)=>{calls.push(['request',email,options]);return {error:scenario.sendError??null};},
 exchangeCodeForSession:async()=>({data:{session:scenario.invalid?null:{},redirectType:scenario.type??'recovery'},error:scenario.invalid?{}:null}),
 updateUser:async()=>{calls.push(['update']);return {error:scenario.updateError??null};},
 signOut:async({scope})=>{calls.push(['signout',scope]);headers.set('X-Test-Session-Cleared','true');return {error:null};},
}};
const exports={};
vm.runInNewContext(compiled,{exports,Response,URL,require:()=>({supabaseServer:async()=>{headers=new Headers({'Cache-Control':'private, no-store'});return {client,responseHeaders:headers};},supabaseAccount:async()=>scenario.allowed===false?null:{role:'owner'}})});
const request=new Request('https://church.example/api/auth/reset-password');
for(const [name,setup,status,updates] of [
 ['expired link',{invalid:true},400,0],
 ['wrong flow',{type:'signup'},403,0],
 ['blocked membership',{allowed:false},403,0],
 ['password rejected',{updateError:{}},400,1],
 ['authorized recovery',{},200,1],
]){
 scenario=setup;calls=[];
 const result=await exports.resetRecoveredPassword(request,'one-use-code','a-test-password');
 assert.equal(result.status,status,name);
 assert.equal(calls.filter(c=>c[0]==='update').length,updates,name);
 if(!setup.invalid)assert.equal(result.headers.get('X-Test-Session-Cleared'),'true','Cleanup must precede response construction');
 if(status===200)assert.ok(calls.some(c=>c[1]==='global'),'Successful reset must revoke all sessions');
}
scenario={};calls=[];
assert.equal((await exports.requestPasswordRecovery(request,'owner@example.test')).status,200);
assert.equal(calls[0][2].redirectTo,'https://church.example/administrador/redefinir-senha');
scenario={sendError:{status:400}};
assert.equal((await exports.requestPasswordRecovery(request,'unknown@example.test')).status,200,'Do not enumerate accounts');
scenario={sendError:{status:429}};
assert.equal((await exports.requestPasswordRecovery(request,'owner@example.test')).status,429);
console.log('PASS: invalid links, wrong flows and blocked members cannot change passwords; recovery revokes sessions, cleans cookies and does not enumerate accounts.');
