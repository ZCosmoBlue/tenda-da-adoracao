import {readFile,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';

const databaseId=process.argv[2];
if(!databaseId||!/^[-0-9a-f]{36}$/i.test(databaseId)||databaseId==='00000000-0000-4000-8000-000000000000'){
 throw new Error('Informe o ID real do banco D1: node scripts/prepare-cloudflare.mjs ID_DO_BANCO');
}
const built=JSON.parse(await readFile('dist/server/wrangler.json','utf8'));
const config={
 name:'tenda-da-adoracao',main:'./index.js',
 compatibility_date:built.compatibility_date,compatibility_flags:built.compatibility_flags,
 no_bundle:true,rules:built.rules,assets:{directory:'../client'},
 workers_dev:true,preview_urls:false,
 d1_databases:[{binding:'DB',database_name:'tenda-da-adoracao-db',database_id:databaseId,migrations_dir:'../../drizzle'}],
 r2_buckets:[{binding:'BUCKET',bucket_name:'tenda-da-adoracao-fotos'}],
 observability:{enabled:true},
};
await writeFile('dist/server/wrangler.cloudflare.json',JSON.stringify(config,null,2)+'\n');
console.log('Configuração de publicação preparada em '+resolve('dist/server/wrangler.cloudflare.json'));
