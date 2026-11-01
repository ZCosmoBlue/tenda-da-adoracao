'use client';
import {useEffect,useRef} from 'react';

export default function HomeMotion(){
 const progress=useRef<HTMLDivElement>(null);
 useEffect(()=>{
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  let frame=0;
  const update=()=>{frame=0;const length=document.documentElement.scrollHeight-innerHeight;if(progress.current)progress.current.style.transform='scaleX('+(length>0?Math.min(1,Math.max(0,scrollY/length)):0)+')';};
  const schedule=()=>{if(!frame)frame=requestAnimationFrame(update);};
  const resize=new ResizeObserver(schedule);
  resize.observe(document.body);
  addEventListener('scroll',schedule,{passive:true});addEventListener('resize',schedule);update();
  const hero=document.querySelector<HTMLElement>('.hero');
  const move=(event:PointerEvent)=>{if(reduced.matches||event.pointerType!=='mouse'||!hero)return;const bounds=hero.getBoundingClientRect();hero.style.setProperty('--glow-x',((event.clientX-bounds.left)/bounds.width*100)+'%');hero.style.setProperty('--glow-y',((event.clientY-bounds.top)/bounds.height*100)+'%');};
  const reset=()=>{hero?.style.removeProperty('--glow-x');hero?.style.removeProperty('--glow-y');};
  hero?.addEventListener('pointermove',move);hero?.addEventListener('pointerleave',reset);reduced.addEventListener('change',reset);
  return()=>{cancelAnimationFrame(frame);resize.disconnect();removeEventListener('scroll',schedule);removeEventListener('resize',schedule);hero?.removeEventListener('pointermove',move);hero?.removeEventListener('pointerleave',reset);reduced.removeEventListener('change',reset);};
 },[]);
 return <div className="reading-progress" aria-hidden="true"><div ref={progress}/></div>;
}
