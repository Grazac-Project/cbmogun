'use strict';
// Live News & Events: pages are built from Sanity, then refreshed here with the latest published posts.
(()=>{
const $=(s)=>document.querySelector(s);
const meta=(name)=>document.querySelector(`meta[name="${name}"]`)?.content||'';
const [project,dataset]=meta('cbm-sanity').split(':');
const built=new Set(meta('cbm-built').split(' ').filter(Boolean));
const IMAGE='{alt,caption,"url":asset->url,"w":asset->metadata.dimensions.width,"h":asset->metadata.dimensions.height}';
const FIELDS='title,"slug":slug.current,excerpt,publishedAt,featured,"category":coalesce(category->title,"Chapter news"),"cover":mainImage'+IMAGE;
const PUBLISHED='_type=="post"&&defined(slug.current)&&!(_id in path("drafts.**"))';
const ARROW='<svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
const MONTHS=['January','February','March','April','May','June','July','August','September','October','November','December'];
const esc=(text)=>String(text??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const cleanSlug=(slug)=>String(slug||'').toLowerCase().replace(/[^a-z0-9-]+/g,'-').replace(/^-+|-+$/g,'');

async function query(groq,params={}){
 const url=new URL(`https://${project}.apicdn.sanity.io/v2024-01-01/data/query/${encodeURIComponent(dataset)}`);
 url.searchParams.set('query',groq);
 for(const [key,value] of Object.entries(params))url.searchParams.set('$'+key,JSON.stringify(value));
 const response=await fetch(url);if(!response.ok)throw new Error('Sanity '+response.status);
 return (await response.json()).result;
}
function niceDate(value){if(!value)return '';const d=new Date(value);return `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`}
function postUrl(p){return built.has(p.slug)?`/updates/${p.slug}.html`:`/post.html?slug=${encodeURIComponent(p.slug)}`}
function dateTag(p){const d=niceDate(p.publishedAt);return d?`<time datetime="${esc(p.publishedAt.slice(0,10))}">${d}</time>`:''}
function imgTag(img,width,lazy=true){
 if(!img?.url?.startsWith('https://cdn.sanity.io/'))return '';
 const w=img.w||1200,h=img.h||800,display=Math.min(width,w);
 return `<img src="${esc(`${img.url}?w=${display}&auto=format&fit=max`)}" alt="${esc(img.alt||img.caption||'News & Events image')}" width="${display}" height="${Math.round(h*display/w)}" loading="${lazy?'lazy':'eager'}" decoding="async">`;
}
function thumb(p,width,lazy=true){return imgTag(p.cover,width,lazy)||`<span class="post-placeholder"><span>OGUN / CBM</span><b>${esc(p.category)}</b></span>`}
function media(p,width,cls,lazy=true){return `<a class="${cls}" href="${postUrl(p)}" tabindex="-1" aria-hidden="true">${thumb(p,width,lazy)}</a>`}
function postCard(p){
 const metaLine=[`<span>${esc(p.category)}</span>`,dateTag(p)].filter(Boolean).join(' · ');
 return `<article class="post-card" data-category="${esc(p.category)}">${media(p,800,'post-card-media')}<div class="post-card-body"><div class="post-meta">${metaLine}</div><h3><a href="${postUrl(p)}">${esc(p.title)}</a></h3><a class="text-link" href="${postUrl(p)}">Read more ${ARROW}</a></div></article>`;
}
function featuredCard(p){
 const u=postUrl(p);
 return `<span class="eyebrow">FEATURED</span><article class="featured-post">${media(p,1200,'featured-media',false)}<div class="featured-body"><div class="post-meta"><span class="post-pill">${esc(p.category)}</span>${dateTag(p)}</div><h2><a href="${u}">${esc(p.title)}</a></h2><p>${esc(p.excerpt)}</p><a class="button dark" href="${u}">Read more${ARROW}</a></div></article>`;
}
function homeNews(posts){
 const meta=(p,pill)=>`<div class="post-meta">${[pill?`<span class="post-pill">${esc(p.category)}</span>`:`<span class="home-cat">${esc(p.category)}</span>`,dateTag(p)].filter(Boolean).join(pill?' ':' · ')}</div>`;
 const more=`<span class="text-link" aria-hidden="true">Read more ${ARROW}</span>`,[lead,...rest]=posts;
 const items=rest.slice(0,2).map(p=>`<article class="home-item"><div class="home-item-media">${thumb(p,500)}</div><div class="home-item-body">${meta(p,false)}<h3><a href="${postUrl(p)}">${esc(p.title)}</a></h3><p>${esc(p.excerpt)}</p>${more}</div></article>`).join('');
 return `<article class="home-lead"><div class="home-lead-media">${thumb(lead,1000,false)}</div><div class="home-lead-body">${meta(lead,true)}<h3><a href="${postUrl(lead)}">${esc(lead.title)}</a></h3><p>${esc(lead.excerpt)}</p>${more}</div></article>`+(items?`<div class="home-news-list">${items}</div>`:'');
}
function safeHref(href){return /^(https?:|mailto:|\/|#)/i.test(href||'')?href:''}
function spans(block){
 const defs=Object.fromEntries((block.markDefs||[]).map(d=>[d._key,d]));
 return (block.children||[]).map(child=>{
  let text=esc(child.text).replace(/\n/g,'<br>');
  for(const mark of child.marks||[]){
   if(['strong','em','code'].includes(mark))text=`<${mark}>${text}</${mark}>`;
   else if(mark==='underline')text=`<u>${text}</u>`;
   else if(defs[mark]?._type==='link'&&safeHref(defs[mark].href)){const href=defs[mark].href,ext=/^https?:/i.test(href);text=`<a href="${esc(href)}"${ext?' target="_blank" rel="noopener noreferrer"':''}>${text}</a>`}
  }
  return text;
 }).join('');
}
function portableText(blocks){
 const out=[];let openList=null;
 for(const b of blocks||[]){
  const tag={bullet:'ul',number:'ol'}[b.listItem];
  if(openList&&openList!==tag){out.push(`</${openList}>`);openList=null}
  if(tag){if(!openList){out.push(`<${tag}>`);openList=tag}out.push(`<li>${spans(b)}</li>`)}
  else if(b._type==='block'){const el={h2:'h2',h3:'h3',h4:'h4',blockquote:'blockquote'}[b.style]||'p';out.push(`<${el}>${spans(b)}</${el}>`)}
  else if(b._type==='image'&&b.url)out.push(`<figure class="post-figure">${imgTag(b,1200)}${b.caption?`<figcaption>${esc(b.caption)}</figcaption>`:''}</figure>`);
 }
 if(openList)out.push(`</${openList}>`);
 return out.join('');
}

// More to explore: category filter and 9-per-page pagination over whatever cards are in the grid.
const grid=$('#post-grid'),select=$('#post-category'),pager=$('#post-pagination'),empty=$('#post-empty'),perPage=9;let page=1;
function renderPage(){
 if(!grid)return;
 const cards=[...grid.children],category=select?.value||'all',matches=cards.filter(card=>category==='all'||card.dataset.category===category),pages=Math.max(1,Math.ceil(matches.length/perPage));page=Math.min(page,pages);
 cards.forEach(card=>card.hidden=true);matches.slice((page-1)*perPage,page*perPage).forEach(card=>card.hidden=false);empty.hidden=matches.length>0;pager.hidden=pages<2;
 const button=(label,target,extra='')=>`<button type="button" data-page="${target}" ${extra}>${label}</button>`;
 pager.innerHTML=button('Prev',page-1,page===1?'disabled':'aria-label="Previous page"')+Array.from({length:pages},(_,i)=>button(i+1,i+1,i+1===page?'aria-current="page"':`aria-label="Page ${i+1}"`)).join('')+button('Next',page+1,page===pages?'disabled':'aria-label="Next page"');
}
select?.addEventListener('change',()=>{page=1;renderPage()});
pager?.addEventListener('click',event=>{const target=event.target.closest('button[data-page]');if(!target||target.disabled)return;page=Number(target.dataset.page);renderPage();$('#explore').scrollIntoView({behavior:'smooth'})});
renderPage();

async function refreshListing(){
 const posts=(await query(`*[${PUBLISHED}]|order(coalesce(publishedAt,_createdAt) desc){${FIELDS}}`)).map(p=>({...p,slug:cleanSlug(p.slug)})).filter(p=>p.slug&&p.title);
 const home=$('#home-posts');if(home&&posts.length)home.innerHTML=homeNews(posts);
 if(!grid)return;
 const featured=posts.find(p=>p.featured)||posts[0],explore=posts.filter(p=>p!==featured),box=$('#news-featured');
 box.hidden=!featured;box.innerHTML=featured?featuredCard(featured):'';
 grid.innerHTML=explore.map(postCard).join('');
 const chosen=select.value,categories=[...new Set(explore.map(p=>p.category))];
 select.innerHTML='<option value="all">All categories</option>'+categories.map(c=>`<option value="${esc(c)}">${esc(c)}</option>`).join('');
 select.value=categories.includes(chosen)?chosen:'all';select.closest('label').hidden=!explore.length;
 renderPage();
}
async function refreshPost(article){
 const slug=article.dataset.slug||new URLSearchParams(location.search).get('slug')||'';
 const p=slug&&await query(`*[${PUBLISHED}&&slug.current==$slug][0]{${FIELDS},body[]{...,_type=="image"=>${IMAGE}}}`,{slug});
 const intro=$('.page-intro');
 if(!p){if(!article.dataset.slug){intro.querySelector('h1').textContent='Post not found';intro.querySelector('.lede').textContent='This post may have been moved or unpublished.';article.innerHTML='<a class="text-link" href="/updates.html">← Back to News & Events</a>'}return}
 const kicker=esc(p.category.toUpperCase());
 intro.querySelector('.breadcrumb').innerHTML=`<a href="/">Home</a><span>/</span>${kicker}`;intro.querySelector('.eyebrow').innerHTML=kicker;
 intro.querySelector('h1').textContent=p.title;intro.querySelector('.lede').textContent=p.excerpt||'';
 document.title=`${p.title} | CBM Ogun`;
 const label=[niceDate(p.publishedAt),'CBM OGUN'].filter(Boolean).join(' · '),cover=imgTag(p.cover,1400,false);
 article.innerHTML=`<span class="article-label">${esc(label)}</span>${cover?`<figure class="post-cover">${cover}</figure>`:''}${portableText(p.body)}<hr><a class="text-link" href="/updates.html">← Back to News & Events</a>`;
}

if(!project)return;
const article=$('#post-body');
(article?refreshPost(article):refreshListing()).catch(error=>console.warn('News & Events: showing the built version.',error));
})();
