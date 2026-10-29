"""News & Events content from Sanity: build-time GROQ fetch and Portable Text rendering. Standard library only."""
import html,json,os,re,urllib.parse,urllib.request
from datetime import datetime
PROJECT=os.environ.get('SANITY_PROJECT_ID','zn3hw447').strip();DATASET=os.environ.get('SANITY_DATASET','production').strip();TOKEN=os.environ.get('SANITY_TOKEN','').strip()
API_VERSION='2024-01-01'
IMAGE='{alt,caption,"url":asset->url,"w":asset->metadata.dimensions.width,"h":asset->metadata.dimensions.height}'
QUERY='*[_type=="post"&&defined(slug.current)&&!(_id in path("drafts.**"))]|order(coalesce(publishedAt,_createdAt) desc){title,"slug":slug.current,excerpt,publishedAt,featured,seoTitle,seoDescription,"category":category->title,"cover":mainImage'+IMAGE+',body[]{...,_type=="image"=>'+IMAGE+'}}'
def configured():return bool(PROJECT)
def fetch_posts():
 host=('api' if TOKEN else 'apicdn')+'.sanity.io'
 url=f'https://{PROJECT}.{host}/v{API_VERSION}/data/query/{urllib.parse.quote(DATASET)}?'+urllib.parse.urlencode({'query':QUERY})
 req=urllib.request.Request(url,headers={'Authorization':'Bearer '+TOKEN} if TOKEN else {})
 with urllib.request.urlopen(req,timeout=30) as r:posts=json.load(r)['result']
 for p in posts:
  # Slugs become file names, so keep them to safe URL characters.
  p['slug']=re.sub(r'[^a-z0-9-]+','-',p['slug'].lower()).strip('-')
  p['category']=p.get('category') or 'Chapter news'
 return [p for p in posts if p['slug'] and p.get('title')]
def esc(t):return html.escape(t or '',quote=True)
def nice_date(value):
 if not value:return ''
 d=datetime.fromisoformat(value.replace('Z','+00:00'));return f'{d:%B} {d.day}, {d.year}'
def image_url(img,width):return img['url']+'?'+urllib.parse.urlencode({'w':width,'auto':'format','fit':'max'})
def img_tag(img,width,cls='',lazy=True):
 if not img or not img.get('url'):return ''
 w,h=img.get('w') or 1200,img.get('h') or 800;display=min(width,w)
 cls=f' class="{cls}"' if cls else ''
 return f'<img{cls} src="{esc(image_url(img,display))}" alt="{esc(img.get("alt") or img.get("caption") or "News & Events image")}" width="{display}" height="{round(h*display/w)}" loading="{"lazy" if lazy else "eager"}">'
def spans(block):
 defs={d['_key']:d for d in block.get('markDefs',[])};out=''
 for child in block.get('children',[]):
  text=esc(child.get('text','')).replace('\n','<br>')
  for mark in child.get('marks',[]):
   if mark in ('strong','em','code'):text=f'<{mark}>{text}</{mark}>'
   elif mark=='underline':text=f'<u>{text}</u>'
   elif mark in defs and defs[mark].get('_type')=='link' and defs[mark].get('href'):
    href=defs[mark]['href'];ext=href.startswith('http')
    text=f'<a href="{esc(href)}"'+(' target="_blank" rel="noopener noreferrer"' if ext else '')+f'>{text}</a>'
  out+=text
 return out
def render(blocks):
 out=[];open_list=None
 for b in blocks or []:
  tag={'bullet':'ul','number':'ol'}.get(b.get('listItem'))
  if open_list and open_list!=tag:out.append(f'</{open_list}>');open_list=None
  if tag:
   if not open_list:out.append(f'<{tag}>');open_list=tag
   out.append('<li>'+spans(b)+'</li>')
  elif b.get('_type')=='block':
   el={'h2':'h2','h3':'h3','h4':'h4','blockquote':'blockquote'}.get(b.get('style'),'p');out.append(f'<{el}>{spans(b)}</{el}>')
  elif b.get('_type')=='image' and b.get('url'):
   cap=f'<figcaption>{esc(b["caption"])}</figcaption>' if b.get('caption') else ''
   out.append(f'<figure class="post-figure">{img_tag(b,1200)}{cap}</figure>')
 if open_list:out.append(f'</{open_list}>')
 return ''.join(out)
