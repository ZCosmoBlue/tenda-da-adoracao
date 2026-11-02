'use client';
import {useState} from 'react';
import {Dialog,DialogContent,DialogTitle,DialogDescription,DialogClose,DialogTrigger} from '@/components/ui/dialog';
import {Button} from '@/components/ui/button';
import {dateLabel,type Entry} from '@/lib/models';

export default function PublicationPreview({entry,pendingUrls,disabled}:{entry:Entry;pendingUrls:string[];disabled:boolean}){
 const [device,setDevice]=useState<'mobile'|'desktop'>('mobile');
 const [index,setIndex]=useState(0);
 const photos=[...entry.photos.map(photo=>({src:'/api/media/'+photo.id,caption:photo.caption})),...pendingUrls.map(src=>({src,caption:''}))];
 const photo=photos[index];
 const title=entry.title.trim()||'Título da publicação';
 const date=entry.date&&Number.isFinite(Date.parse(entry.date))?dateLabel(entry.date):'Data e horário ainda não definidos';
 const navigate=(step:number)=>setIndex(current=>(current+step+photos.length)%photos.length);
 return <Dialog onOpenChange={open=>{if(open)setIndex(0);}}><DialogTrigger asChild><Button type="button" variant="outline" disabled={disabled}>Ver prévia</Button></DialogTrigger><DialogContent className="publication-preview-dialog" showCloseButton={false} onKeyDown={event=>{if(event.altKey||event.ctrlKey||event.metaKey||event.shiftKey||photos.length<2)return;if(event.key==='ArrowLeft'||event.key==='ArrowRight'){event.preventDefault();navigate(event.key==='ArrowLeft'?-1:1);}}}>
  <div className="preview-heading"><div><DialogTitle>Prévia da publicação</DialogTitle><DialogDescription>Conferir esta prévia não salva nem publica alterações.</DialogDescription></div><DialogClose asChild><Button variant="outline" type="button">Voltar à edição</Button></DialogClose></div>
  <div className="preview-device-controls" role="group" aria-label="Tamanho da prévia"><Button type="button" variant={device==='mobile'?'default':'outline'} aria-pressed={device==='mobile'} onClick={()=>setDevice('mobile')}>Celular</Button><Button type="button" variant={device==='desktop'?'default':'outline'} aria-pressed={device==='desktop'} onClick={()=>setDevice('desktop')}>Computador</Button></div>
  <p className="preview-notice">Prévia — alterações ainda não publicadas.{pendingUrls.length>0&&` Inclui ${pendingUrls.length} foto(s) selecionada(s) ainda não enviada(s).`}{entry.status==='published'&&' A versão já publicada continua disponível no site.'}</p>
  <div className="preview-scroll"><div className={'preview-surface preview-'+device}>
   <span className="eyebrow">{entry.kind==='album'?'ÁLBUM DE FOTOS':'EVENTO ESPECIAL'}</span><h2>{title}</h2><p className="preview-meta">{entry.kind==='event'?date+' · '+(entry.location.trim()||'Local ainda não definido'):'Álbum de fotos da Tenda da Adoração'}</p>
   <p className="preview-description">{entry.description}</p>
   {photo?<div className="photo-viewer"><figure className="viewer-frame" key={photo.src}><img src={photo.src} alt={photo.caption||'Foto '+(index+1)+' de '+title}/>{photo.caption&&<figcaption>{photo.caption}</figcaption>}</figure><div className="viewer-controls">{photos.length>1&&<Button type="button" variant="outline" onClick={()=>navigate(-1)}>Anterior</Button>}<span role="status" aria-live="polite">Foto {index+1} de {photos.length}</span>{photos.length>1&&<Button type="button" variant="outline" onClick={()=>navigate(1)}>Próxima</Button>}</div></div>:<p className="preview-no-photo">Nenhuma imagem selecionada.{entry.kind==='album'?' Adicione fotos para publicar este álbum.':''}</p>}
  </div></div><p className="preview-footnote">A primeira foto é a capa. A largura de computador se adapta ao espaço disponível nesta janela.</p>
 </DialogContent></Dialog>;
}
