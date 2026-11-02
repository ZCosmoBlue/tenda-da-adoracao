'use client';
import {useState} from 'react';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Tabs,TabsList,TabsTrigger,TabsContent} from '@/components/ui/tabs';
import type {Entry} from '@/lib/models';
import {dateLabel} from '@/lib/models';

const statuses={draft:'Rascunho',published:'Publicado',ended:'Encerrado',archived:'Arquivado'};
const normalize=(text:string)=>text.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('pt-BR');
type Props={entries:Entry[];loading:boolean;failed:boolean;disabled:boolean;onEdit:(entry:Entry)=>void;onDuplicate:(entry:Entry)=>void;onCreate:(kind:'album'|'event')=>void};

export default function PublicationLibrary({entries,loading,failed,disabled,onEdit,onDuplicate,onCreate}:Props){
 const [kind,setKind]=useState<'album'|'event'>('album');
 const [query,setQuery]=useState('');
 const [status,setStatus]=useState('all');
 const [sort,setSort]=useState('recent');
 const collection=entries.filter(entry=>entry.kind===kind);
 const results=collection.filter(entry=>(status==='all'||entry.status===status)&&normalize(entry.title+' '+entry.description).includes(normalize(query.trim())))
  .sort((a,b)=>sort==='title'?a.title.localeCompare(b.title,'pt-BR'):b.updated_at.localeCompare(a.updated_at)||a.id.localeCompare(b.id));
 const clear=()=>{setQuery('');setStatus('all');};
 return <section className="publication-library" aria-label="Gerenciar publicações">
  <div className="dashboard-overview" aria-label="Resumo das publicações">
   {[['Publicações',entries.length],['Publicadas',entries.filter(e=>e.status==='published').length],['Rascunhos',entries.filter(e=>e.status==='draft').length],['Fotos enviadas',entries.reduce((sum,e)=>sum+e.photos.length,0)]].map(([label,count])=><div key={label}><span>{label}</span><strong>{loading||failed?'—':count}</strong></div>)}
  </div>
  <div className="dashboard-quick-actions"><div><h2>O que vamos compartilhar?</h2><p>Comece um álbum ou prepare o próximo encontro.</p></div><div><Button disabled={disabled||loading||failed} onClick={()=>onCreate('album')}>+ Novo álbum</Button><Button variant="outline" disabled={disabled||loading||failed} onClick={()=>onCreate('event')}>+ Novo evento</Button></div></div>
  <Tabs value={kind} onValueChange={value=>{setKind(value as 'album'|'event');clear();}}><TabsList aria-label="Tipo de publicação"><TabsTrigger value="album">Álbuns ({entries.filter(e=>e.kind==='album').length})</TabsTrigger><TabsTrigger value="event">Eventos ({entries.filter(e=>e.kind==='event').length})</TabsTrigger></TabsList><TabsContent value={kind}>
  <div className="library-filters"><div><label htmlFor="publication-search">Buscar publicação</label><Input id="publication-search" type="search" placeholder="Busque pelo título ou descrição" value={query} onChange={e=>setQuery(e.target.value)}/></div><div><label htmlFor="publication-status">Situação</label><select id="publication-status" value={status} onChange={e=>setStatus(e.target.value)}><option value="all">Todas</option>{Object.entries(statuses).map(([value,label])=><option key={value} value={value}>{label}</option>)}</select></div><div><label htmlFor="publication-sort">Ordenar por</label><select id="publication-sort" value={sort} onChange={e=>setSort(e.target.value)}><option value="recent">Alteradas recentemente</option><option value="title">Título (A–Z)</option></select></div></div>
  {kind==='event'&&<p className="library-result-count">Duplicar reaproveita título, descrição e local. Escolha uma nova data e envie a imagem atualizada antes de publicar.</p>}
  {disabled&&<p className="library-editing-note">Uma publicação está aberta abaixo. Salve ou feche a edição antes de abrir outra.</p>}
  {loading?<p role="status" className="library-feedback">Carregando suas publicações…</p>:failed?<p className="library-feedback">Não foi possível carregar a biblioteca. Tente novamente na mensagem abaixo.</p>:<>
   <p className="library-result-count" role="status">{results.length} {results.length===1?'publicação encontrada':'publicações encontradas'}</p>
   {results.length?<div className="admin-list">{results.map(entry=><article key={entry.id} className="admin-entry">{entry.photos[0]?<img loading="lazy" src={'/api/media/'+entry.photos[0].id} alt=""/>:<div className="entry-placeholder">{kind==='album'?'FOTOS':'EVENTO'}</div>}<div><span className={'badge status-'+entry.status}>{statuses[entry.status]}</span><h2>{entry.title}</h2><p>{kind==='event'?dateLabel(entry.date):entry.photos.length+(entry.photos.length===1?' foto':' fotos')}</p></div><div className="library-entry-actions"><Button variant="outline" disabled={disabled} onClick={()=>onEdit(entry)} aria-label={'Editar '+entry.title}>Editar</Button>{entry.kind==='event'&&<Button variant="outline" disabled={disabled} onClick={()=>onDuplicate(entry)} aria-label={'Duplicar '+entry.title}>Duplicar</Button>}</div></article>)}</div>:<div className="library-empty"><h3>{collection.length?'Nenhuma publicação com esses filtros.':kind==='album'?'Seu primeiro álbum começa aqui.':'Vamos preparar o próximo encontro?'}</h3><p>{collection.length?'Tente outro título ou escolha uma situação diferente.':kind==='album'?'Escolha as fotos, escreva uma descrição e publique para a comunidade.':'Adicione data, horário e uma imagem de divulgação.'}</p>{collection.length?<Button variant="outline" onClick={clear}>Limpar filtros</Button>:<Button disabled={disabled} onClick={()=>onCreate(kind)}>{kind==='album'?'Criar primeiro álbum':'Criar evento'}</Button>}</div>}
  </>}
 </TabsContent></Tabs></section>;
}
