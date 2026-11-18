'use client';
import {useState} from 'react';
import {Button} from '@/components/ui/button';
export default function BackupControl(){
 const [busy,setBusy]=useState(false),[error,setError]=useState(''),[done,setDone]=useState(false);
 async function download(){
  setBusy(true);setError('');setDone(false);
  try{
   const response=await fetch('/api/admin/backup',{method:'POST'});
   if(!response.ok){const data=await response.json() as {error?:string};throw new Error(data.error||'Não foi possível gerar o backup.');}
   const blob=await response.blob();const url=URL.createObjectURL(blob);
   const anchor=document.createElement('a');anchor.href=url;anchor.download='tenda-backup-'+new Date().toISOString().slice(0,10)+'.json';
   document.body.appendChild(anchor);anchor.click();anchor.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);setDone(true);
  }catch(error){setError(error instanceof Error?error.message:'Não foi possível gerar o backup.');}
  finally{setBusy(false);}
 }
 return <section className="editor" aria-labelledby="backup-title"><h2 id="backup-title">Cópia de segurança</h2><p>Guarde álbuns, eventos, configurações e fotos em um arquivo no seu computador. Inclui rascunhos e itens arquivados; não inclui senhas ou contas de acesso.</p><p>Faça a cópia após publicar novos conteúdos e guarde outra cópia em um local seguro. Evite editar o site enquanto o backup é preparado.</p><Button type="button" disabled={busy} onClick={()=>void download()}>{busy?'Preparando cópia…':'Baixar backup com fotos'}</Button>{done&&<p role="status">Download solicitado. Confira o arquivo na pasta de downloads e guarde uma segunda cópia.</p>}{error&&<p role="alert" className="notice error">{error}</p>}<p className="editor-hint">Backup manual, disponível somente ao administrador. Até 32 MB de fotos por cópia; acima disso, será necessário backup assistido em lotes. A restauração é assistida para evitar substituir publicações por engano.</p></section>;
}
