'use strict';
const $=(s)=>document.querySelector(s), $$=(s)=>[...document.querySelectorAll(s)];
const menu=$('.menu-toggle'), nav=$('#nav');
menu?.addEventListener('click',()=>{const expanded=menu.getAttribute('aria-expanded')==='true';menu.setAttribute('aria-expanded',String(!expanded));nav.classList.toggle('open',!expanded)});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&nav?.classList.contains('open')){nav.classList.remove('open');menu.setAttribute('aria-expanded','false');menu.focus()}});
const dialog=$('#detail-dialog'), content=$('#dialog-content');
function openDialog(markup){content.innerHTML=markup;dialog.setAttribute('aria-label',content.querySelector('h2')?.textContent||'Chapter information');dialog.showModal();document.body.style.overflow='hidden'}
function closeDialog(){dialog.close()}
dialog?.querySelector('.dialog-close').addEventListener('click',closeDialog);
dialog?.addEventListener('close',()=>document.body.style.overflow='');
dialog?.addEventListener('click',e=>{const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)closeDialog()});
function escapeHTML(text){return text.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function filterLgas(){const term=$('#lga-search').value.toLowerCase().trim().replace(/[^a-z0-9]/g,''),district=$('#district-filter').value;let shown=0;$$('.lga-card').forEach(card=>{const match=card.dataset.lga.toLowerCase().replace(/[^a-z0-9]/g,'').includes(term)&&(district==='all'||card.dataset.district===district);card.hidden=!match;if(match)shown++});$('#lga-count').textContent=`Showing ${shown} local government ${shown===1?'area':'areas'}`;$('#lga-empty').hidden=shown>0}
$('#lga-search')?.addEventListener('input',filterLgas);$('#district-filter')?.addEventListener('change',filterLgas);$('#reset-lga')?.addEventListener('click',()=>{$('#lga-search').value='';$('#district-filter').value='all';filterLgas();$('#lga-search').focus()});
$$('.lga-card').forEach(card=>card.addEventListener('click',()=>{const name=escapeHTML(card.dataset.lga),district=escapeHTML(card.dataset.district);openDialog(`<span class="eyebrow">ACROSS OGUN / LOCAL DIRECTORY</span><h2>${name}</h2><p class="lga-detail-line">Local Government Area · Ogun ${district}</p><h3>Local chapter information</h3><p>Explore chapter information, programme priorities and national membership through City Boy Movement Ogun State.</p><p>Browse the district directory or visit our Contact page for movement information and enquiry routes.</p><a class="button dark" href="https://cbmnigeria.org/register" target="_blank" rel="noopener noreferrer">Join the Movement ↗</a>`)}));
$$('[data-filter]').forEach(button=>button.addEventListener('click',()=>{$$('[data-filter]').forEach(b=>{const on=b===button;b.classList.toggle('active',on);b.setAttribute('aria-pressed',String(on))});$$('.article-card').forEach(card=>card.hidden=button.dataset.filter!=='all'&&card.dataset.category!==button.dataset.filter)}));
const galleryItems=$$('.moment-card');let galleryIndex=0;
function visiblePhotos(){return galleryItems.filter(item=>!item.hidden)}
function showGalleryPhoto(index){
 const photos=visiblePhotos();if(!photos.length)return;
 galleryIndex=(index+photos.length)%photos.length;const item=photos[galleryIndex];
 content.innerHTML=`<div class="moment-viewer"><img src="/assets/${escapeHTML(item.dataset.photo)}" alt="${escapeHTML(item.querySelector('img').alt)}"><div class="moment-viewer-info"><span class="eyebrow">${escapeHTML(item.dataset.category)}</span><h2>${escapeHTML(item.dataset.caption)}</h2><p>${escapeHTML(item.dataset.description)}</p></div><div class="moment-viewer-controls"><button type="button" class="button outline" id="gallery-prev" aria-label="Previous photo">←</button><span aria-live="polite">${galleryIndex+1} / ${photos.length}</span><button type="button" class="button outline" id="gallery-next" aria-label="Next photo">→</button></div></div>`;
 dialog.setAttribute('aria-label',item.dataset.caption);
 $('#gallery-prev').addEventListener('click',()=>{showGalleryPhoto(galleryIndex-1);$('#gallery-prev').focus()});
 $('#gallery-next').addEventListener('click',()=>{showGalleryPhoto(galleryIndex+1);$('#gallery-next').focus()});
}
$$('[data-gallery]').forEach(button=>button.addEventListener('click',()=>{
 $$('[data-gallery]').forEach(b=>{const on=b===button;b.classList.toggle('active',on);b.setAttribute('aria-pressed',String(on))});
 galleryItems.forEach(item=>item.hidden=button.dataset.gallery!=='all'&&item.dataset.category!==button.dataset.gallery);
 const count=visiblePhotos().length;$('#gallery-count').textContent=`${count} ${count===1?'photo':'photos'}`;
}));
galleryItems.forEach(button=>button.addEventListener('click',()=>{showGalleryPhoto(visiblePhotos().indexOf(button));dialog.classList.add('moment-dialog');dialog.showModal();document.body.style.overflow='hidden'}));
dialog?.addEventListener('close',()=>dialog.classList.remove('moment-dialog'));
document.addEventListener('keydown',event=>{if(!dialog?.open||!dialog.classList.contains('moment-dialog'))return;if(event.key==='ArrowRight'){event.preventDefault();showGalleryPhoto(galleryIndex+1)}if(event.key==='ArrowLeft'){event.preventDefault();showGalleryPhoto(galleryIndex-1)}});
$('#copy-registration')?.addEventListener('click',async()=>{const button=$('#copy-registration');try{await navigator.clipboard.writeText('https://cbmnigeria.org/register');button.textContent='Registration link copied ✓';$('#copy-status').textContent='National registration link copied to clipboard.'}catch{openDialog('<h2>National registration link</h2><p>Select and copy the link below.</p><input aria-label="National registration URL" readonly value="https://cbmnigeria.org/register" class="copy-link-field">');content.querySelector('input').select()}});
if($('#year'))$('#year').textContent=new Date().getFullYear();

