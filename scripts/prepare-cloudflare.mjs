import {readFile,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';

const built=JSON.parse(await readFile('dist/server/wrangler.json','utf8'));
const config={
 name:'tenda-da-adoracao',main:'./index.js',
 compatibility_date:built.compatibility_date,compatibility_flags:built.compatibility_flags,
 no_bundle:true,rules:built.rules,assets:{directory:'../client'},
 workers_dev:true,preview_urls:false,
 observability:{enabled:true},
};
await writeFile('dist/server/wrangler.cloudflare.json',JSON.stringify(config,null,2)+'\n');
console.log('Configuração de publicação preparada em '+resolve('dist/server/wrangler.cloudflare.json'));
