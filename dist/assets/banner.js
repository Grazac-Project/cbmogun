(() => {
'use strict';
const canvas=document.getElementById('banner-canvas')||document.getElementById('banner-sample');
if(!canvas)return;
const editor=!!document.getElementById('banner-canvas');
const $=id=>document.getElementById(id);
const logo=new Image();let photo=null,logoReady=false,busy=false,photoRequest=0;
const green='#00612B',deep='#004A21',yellow='#FFD400';
const state={name:'',lga:'',format:'portrait',zoom:1,x:0,y:-50};
function error(message=''){if(!editor)return;$('banner-error').textContent=message;$('banner-error').hidden=!message;}
function font(ctx,size,weight=700){ctx.font=`${weight} ${size}px Montserrat, Arial, sans-serif`;}
function text(ctx,str,x,y,size,color='#fff',weight=700){font(ctx,size,weight);ctx.fillStyle=color;ctx.fillText(str,x,y);}
// Vector marks stay sharp in the full-resolution PNG export.
function socialIcon(ctx,kind,x,y,size=24){
 ctx.save();ctx.translate(x,y);ctx.scale(size/24,size/24);ctx.fillStyle='#fff';ctx.strokeStyle='#fff';ctx.lineWidth=1.8;
 if(kind==='x'){
  ctx.fill(new Path2D('M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.64 7.584H.47l8.6-9.835L0 1.154h7.594l5.243 6.932 6.064-6.933zm-1.29 19.49h2.039L6.487 3.24H4.3l13.31 17.403z'));
 }else if(kind==='instagram'){
  ctx.beginPath();ctx.roundRect(2,2,20,20,6);ctx.stroke();ctx.beginPath();ctx.arc(12,12,4.7,0,Math.PI*2);ctx.stroke();ctx.beginPath();ctx.arc(18.2,5.8,1.3,0,Math.PI*2);ctx.fill();
 }else{
  ctx.beginPath();ctx.arc(12,12,10,0,Math.PI*2);ctx.stroke();ctx.beginPath();ctx.ellipse(12,12,4.4,10,0,0,Math.PI*2);ctx.moveTo(2,12);ctx.lineTo(22,12);ctx.stroke();
 }
 ctx.restore();
}
function wrap(ctx,str,max){const words=str.split(/\s+/),lines=[];let line='';for(const word of words){const test=line?line+' '+word:word;if(line&&ctx.measureText(test).width>max){lines.push(line);line=word;}else line=test;}if(line)lines.push(line);return lines;}
function render(){
 const height=state.format==='square'?1080:1350;
 if(canvas.height!==height)canvas.height=height;
 const ctx=canvas.getContext('2d'),s=(height-260)/1090,Y=v=>260+(v-260)*s,S=Math.max(.78,s);
 ctx.clearRect(0,0,1080,height);ctx.fillStyle=green;ctx.fillRect(0,0,1080,height);
 ctx.fillStyle=deep;ctx.beginPath();ctx.moveTo(1080,260);ctx.lineTo(650,260);ctx.lineTo(1080,Y(900));ctx.fill();
 ctx.fillStyle='rgba(255,255,255,.035)';ctx.beginPath();ctx.arc(130,Y(900),360,0,Math.PI*2);ctx.fill();
 ctx.fillStyle='#fff';ctx.fillRect(0,0,1080,260);
 if(logoReady)ctx.drawImage(logo,66,38,400,400*logo.height/logo.width);
 text(ctx,'OGUN STATE',620,102,32,green,800);text(ctx,'CHAPTER',623,141,24,green,600);
 text(ctx,'COMMUNITY · CONNECTION · SERVICE',623,184,15,green,600);
 // A gateway arch, chapter seal and editorial typography frame every member.
 ctx.save();ctx.strokeStyle='rgba(255,255,255,.10)';ctx.lineWidth=2;
 for(let i=0;i<5;i++){ctx.beginPath();ctx.arc(1010,Y(710),350+i*30,Math.PI,Math.PI*1.5);ctx.stroke();}
 ctx.restore();
 text(ctx,'THE GATEWAY STATE',70,Y(314),19*S,'#D4E8DC',700);
 ctx.save();ctx.translate(177,Y(466));
 ctx.strokeStyle=yellow;ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,0,90*S,0,Math.PI*2);ctx.stroke();
 ctx.beginPath();ctx.arc(0,0,78*S,0,Math.PI*2);ctx.stroke();
 ctx.textAlign='center';text(ctx,'ONE',0,-5*S,25*S,'#fff',800);text(ctx,'MOVEMENT',0,26*S,15*S,yellow,800);ctx.restore();
 text(ctx,'I am',70,Y(653),49*S,'#fff',500);
 text(ctx,'City',62,Y(785),112*S,yellow,900);
 text(ctx,'Boy',62,Y(910),112*S,'#fff',900);
 ctx.fillStyle=yellow;ctx.fillRect(70,Y(954),190,7*S);
 text(ctx,'PEOPLE. PURPOSE.',70,Y(998),15*S,'#D4E8DC',700);
 text(ctx,'POSSIBILITY.',70,Y(1023),15*S,'#D4E8DC',700);
 const box={x:370,y:Y(392),w:640,h:680*s-(height===1080?38:0)};
 ctx.fillStyle='#EEF1EB';ctx.fillRect(box.x,box.y,box.w,box.h);
 if(photo){
  const scale=Math.max(box.w/photo.width,box.h/photo.height)*state.zoom;
  const w=photo.width*scale,h=photo.height*scale;
  const px=box.x+(box.w-w)*(.5+state.x/200),py=box.y+(box.h-h)*(.5+state.y/200);
  ctx.save();ctx.beginPath();ctx.rect(box.x,box.y,box.w,box.h);ctx.clip();ctx.drawImage(photo,px,py,w,h);ctx.restore();
 }else{
  const cx=box.x+box.w/2,cy=box.y+box.h*.4,r=Math.min(box.w,box.h)*.15;
  ctx.fillStyle='#CFD9CF';ctx.beginPath();ctx.arc(cx,cy,r,0,Math.PI*2);ctx.fill();
  ctx.beginPath();ctx.ellipse(cx,cy+r*2.65,r*2.2,r*1.7,0,Math.PI,0);ctx.fill();
  ctx.save();ctx.textAlign='center';text(ctx,'YOUR PHOTO',cx,box.y+box.h*.86,22*S,green,700);ctx.restore();
 }
 ctx.strokeStyle='#fff';ctx.lineWidth=5;ctx.strokeRect(box.x,box.y,box.w,box.h);
 ctx.fillStyle=yellow;ctx.fillRect(box.x-9,box.y-9,86,9);ctx.fillRect(box.x-9,box.y-9,9,86);ctx.fillRect(box.x+box.w-77,box.y+box.h,86,9);ctx.fillRect(box.x+box.w,box.y+box.h-77,9,86);
 const name=(state.name.trim()||'YOUR NAME').replace(/\s+/g,' ');let size=54*S,lines;
 do{font(ctx,size,800);lines=wrap(ctx,name,940);if(lines.length<=2&&lines.every(l=>ctx.measureText(l).width<=940))break;size-=1;}while(size>24);
 const base=height-(lines.length>1?177:148);
 ctx.fillStyle='#fff';lines.slice(0,2).forEach((line,i)=>ctx.fillText(line,70,base+i*(size+7)));
 text(ctx,state.lga?`${state.lga} · Ogun State`:'OGUN STATE CHAPTER',70,height-89,23*S,'#E2F2E7',600);
 ctx.save();ctx.textAlign='right';text(ctx,'#CBMOgun',1010,height-89,23*S,yellow,800);ctx.restore();
 ctx.fillStyle=deep;ctx.fillRect(0,height-62,1080,62);ctx.fillStyle=yellow;ctx.fillRect(0,height-67,1080,5);
 // An evenly spaced signature strip keeps all three contact points readable.
 const footerY=height-42;
 socialIcon(ctx,'x',70,footerY,23);text(ctx,'@cityboymovt_og',106,height-24,20,'#fff',600);
 socialIcon(ctx,'instagram',403,footerY,24);text(ctx,'@ogcityboymovt',440,height-24,20,'#fff',600);
 ctx.strokeStyle='rgba(255,255,255,.25)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(756,height-45);ctx.lineTo(756,height-18);ctx.stroke();
 socialIcon(ctx,'web',788,footerY,24);text(ctx,'cbmogun.org',826,height-24,20,'#fff',700);
 canvas.setAttribute('aria-label',`City Boy Movement Ogun State banner for ${state.name.trim()||'your name'}${state.lga?', '+state.lga:''}`);
 if(editor){$('banner-dimensions').textContent=`1080 × ${height} PNG`;const valid=!!state.name.trim()&&!!photo&&logoReady&&!busy;$('banner-download').disabled=!valid;$('banner-download-note').textContent=valid?'Ready to download your full-resolution PNG.':busy?'Preparing your image…':!logoReady?'Loading chapter artwork…':'Add your name and photo to enable download.';}
}
logo.onload=()=>{logoReady=true;render();};logo.onerror=()=>{error('The chapter logo could not be loaded. Refresh this page and try again.');render();};logo.src='/assets/cbm-ogun-logo.png';
render();document.fonts?.ready.then(render).catch(()=>{});
if(!editor)return;
$('banner-form').addEventListener('submit',event=>event.preventDefault());
$('banner-name').addEventListener('input',e=>{state.name=e.target.value;render();});
$('banner-lga').addEventListener('change',e=>{state.lga=e.target.value;render();});
$('banner-format').addEventListener('change',e=>{state.format=e.target.value;render();});
for(const [id,key] of [['banner-zoom','zoom'],['banner-x','x'],['banner-y','y']])$(id).addEventListener('input',e=>{state[key]=Number(e.target.value);render();});
function resetCrop(){state.zoom=1;state.x=0;state.y=-50;$('banner-zoom').value='1';$('banner-x').value='0';$('banner-y').value='-50';render();}
$('banner-reset-crop').addEventListener('click',resetCrop);
function clearPhoto(){photoRequest++;photo=null;$('banner-photo').value='';$('photo-filename').textContent='No photo selected';$('banner-remove-photo').hidden=true;$('banner-crop').disabled=true;busy=false;resetCrop();}
$('banner-remove-photo').addEventListener('click',()=>{clearPhoto();error();});
$('banner-photo').addEventListener('change',async e=>{
 const file=e.target.files[0];if(!file)return;const request=++photoRequest;error();
 if(!['image/jpeg','image/png','image/webp'].includes(file.type)){clearPhoto();error('Please choose a JPG, PNG or WebP photo.');return;}
 if(file.size>10*1024*1024){clearPhoto();error('That photo is larger than 10 MB. Please choose a smaller image.');return;}
 busy=true;render();
 try{
  const src=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=reject;reader.readAsDataURL(file);});
  const image=new Image();await new Promise((resolve,reject)=>{image.onload=resolve;image.onerror=reject;image.src=src;});
  if(request!==photoRequest)return;
  if(image.width*image.height>48000000)throw new Error('large');
  photo=image;busy=false;$('photo-filename').textContent=file.name;$('banner-remove-photo').hidden=false;$('banner-crop').disabled=false;resetCrop();
 }catch(err){if(request!==photoRequest)return;clearPhoto();error(err.message==='large'?'Please use a photo smaller than 48 megapixels.':'This photo could not be opened. Please choose another JPG, PNG or WebP image.');}
});
$('banner-start-over').addEventListener('click',()=>{$('banner-form').reset();state.name='';state.lga='';state.format='portrait';clearPhoto();error();$('banner-name').focus();});
$('banner-download').addEventListener('click',async()=>{
 if(!state.name.trim()||!photo||!logoReady||busy)return;
 busy=true;error();render();const button=$('banner-download'),label=button.innerHTML;button.textContent='Preparing download…';
 try{
  await document.fonts?.ready;render();
  const blob=await new Promise((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(new Error('export')),'image/png'));
  const url=URL.createObjectURL(blob),link=document.createElement('a');
  const safeName=state.name.trim().toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')||'member';
  link.href=url;link.download=`cbm-ogun-${safeName}-${state.format}.png`;document.body.appendChild(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),10000);
  $('banner-download-note').textContent='Your PNG download has started. Share it when you are ready.';
 }catch{error('The banner could not be downloaded. Please try again.');}
 finally{busy=false;button.innerHTML=label;render();}
});
})();
