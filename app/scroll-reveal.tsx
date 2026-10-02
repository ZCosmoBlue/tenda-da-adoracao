'use client';
import {useEffect} from 'react';

// Content stays visible when scripts or animation support are unavailable.
export default function ScrollReveal(){
 useEffect(()=>{
  const root=document.getElementById('conteudo');
  if(!root||!('IntersectionObserver' in window))return;
  const motion=window.matchMedia('(prefers-reduced-motion: reduce)');
  const seen=new WeakSet<Element>();
  const animations=new Set<Animation>();
  const observer=new IntersectionObserver(items=>{
   for(const item of items){
    if(!item.isIntersecting)continue;
    observer.unobserve(item.target);
    if(motion.matches||!(item.target instanceof HTMLElement)||!item.target.animate)continue;
    const animation=item.target.animate([{opacity:.25,transform:'translateY(20px)'},{opacity:1,transform:'translateY(0)'}],{duration:650,easing:'cubic-bezier(.22,1,.36,1)'});
    animations.add(animation);
    animation.onfinish=()=>animations.delete(animation);
   }
  },{threshold:0,rootMargin:'0px 0px -24px 0px'});
  const scan=()=>root.querySelectorAll('.section-label,.essence-grid,.family-heading,.values article,.service-list article,.story-card,.gallery-section>h2,.welcome>h2,.welcome>p,.welcome>address').forEach(el=>{if(!seen.has(el)){seen.add(el);observer.observe(el);}});
  const stop=()=>{if(motion.matches){animations.forEach(a=>a.cancel());animations.clear();}};
  const updates=new MutationObserver(scan);
  scan();updates.observe(root,{childList:true,subtree:true});motion.addEventListener('change',stop);
  return()=>{observer.disconnect();updates.disconnect();motion.removeEventListener('change',stop);animations.forEach(a=>a.cancel());};
 },[]);
 return null;
}
