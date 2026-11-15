import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

// Exercise the real authorization function with hostile/missing identity data.
const source=readFileSync(new URL('../lib/supabase-server.ts',import.meta.url),'utf8');
const compiled=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
const exports={};
vm.runInNewContext(compiled,{exports,require:()=>({}),Headers});
const account=exports.supabaseAccount;
let reads=0;
const client=(user,rows,error=null)=>({auth:{getUser:async()=>({data:{user},error:null})},rpc:async()=>{reads++;return {data:rows,error};}});
assert.equal(await account(client(null,[])),null);
assert.equal(reads,0,'An anonymous request must not query privileged membership');
const user={id:'test-owner',email:'owner@example.test',user_metadata:{role:'owner'}};
assert.equal(await account(client(user,[])),null,'Editable metadata must not grant access');
assert.equal(await account(client(user,[{user_id:'someone-else',role:'owner'}])),null);
assert.equal(await account(client(user,[{user_id:user.id,role:'unexpected'}])),null);
await assert.rejects(account(client(user,null,{message:'Database unavailable'})),/permission check unavailable/);
const owner=await account(client(user,[{user_id:user.id,name:'Owner',role:'owner'}]));
assert.equal(owner.role,'owner');assert.equal(owner.userId,user.id);
console.log('PASS: anonymous, metadata escalation, mismatched identity, invalid role and unavailable authorization are denied; verified owner is accepted.');
