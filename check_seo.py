"""Run after build.py: validate generated metadata, schema, assets and crawl paths."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit
from xml.etree import ElementTree as ET
import json,re,base64,hashlib
ROOT=Path(__file__).parent;D=ROOT/'dist'
class Page(HTMLParser):
 def __init__(self):super().__init__(convert_charrefs=True);self.tags=[];self.title='';self.in_title=False;self.schema=[];self.in_schema=False;self.ids=set()
 def handle_starttag(self,tag,attrs):
  a=dict(attrs);self.tags.append((tag,a));self.ids.add(a['id']) if 'id' in a else None
  if tag=='title':self.in_title=True
  if tag=='script' and a.get('type')=='application/ld+json':self.in_schema=True;self.schema.append('')
 def handle_endtag(self,tag):
  if tag=='title':self.in_title=False
  if tag=='script':self.in_schema=False
 def handle_data(self,d):
  if self.in_title:self.title+=d
  if self.in_schema:self.schema[-1]+=d
pages={}
for p in D.rglob('*.html'):
 if p.relative_to(D).parts[0]=='studio':continue  # Sanity Studio app, not a site page
 parser=Page();parser.feed(p.read_text());pages[str(p.relative_to(D))]=parser
seen_titles=set();seen_desc=set();canonicals=set();image_count=0;schema_count=0
headers=(D/'_headers').read_text()
for file,p in pages.items():
 assert p.title and p.title not in seen_titles,(file,'duplicate title');seen_titles.add(p.title)
 assert 20<=len(p.title)<=80,(file,len(p.title))
 assert sum(t=='h1' for t,a in p.tags)==1,(file,'h1 count')
 desc=[a['content'] for t,a in p.tags if t=='meta' and a.get('name')=='description'];assert len(desc)==1 and desc[0] not in seen_desc,(file,'description');seen_desc.add(desc[0])
 canonical=[a['href'] for t,a in p.tags if t=='link' and a.get('rel')=='canonical'];assert len(canonical)==1 and canonical[0].startswith('https://'),file;canonicals.add(canonical[0]);base=urlsplit(canonical[0]);base=base.scheme+'://'+base.netloc
 for block in p.schema:
  schema=json.loads(block);assert schema['@context']=='https://schema.org';assert schema['@graph'];schema_count+=1
  digest="sha256-"+base64.b64encode(hashlib.sha256(block.encode()).digest()).decode();assert digest in headers,(file,'CSP hash')
 assert p.schema,(file,'missing schema')
 for tag,a in p.tags:
  if tag=='meta' and a.get('property')=='og:url':assert a['content']==canonical[0],file
  if tag=='img':
   image_count+=1;assert a.get('alt'),(file,'image alt');assert a.get('width') and a.get('height'),(file,'image dimensions',a.get('src'))
  for key in (['href'] if tag in ['a','link'] else ['src'] if tag in ['img','script'] else []):
   value=a.get(key,'')
   if value.startswith('/') and not value.startswith('//'):
    path=urlsplit(value).path
    # Pages are linked without .html (cleanUrls); assets keep their extensions.
    if tag=='a':assert not path.endswith('.html'),(file,'link should not end in .html',value)
    target=path.lstrip('/') or 'index.html';assert (D/target).is_file() or (D/(target+'.html')).is_file() or (D/target/'index.html').is_file(),(file,'broken link',value)
   if tag=='a' and value.startswith('#') and len(value)>1:assert value[1:] in p.ids,(file,'broken fragment',value)
 sitemap=ET.parse(D/'sitemap.xml')
ns={'s':'http://www.sitemaps.org/schemas/sitemap/0.9','image':'http://www.google.com/schemas/sitemap-image/1.1'}
urls=sitemap.findall('s:url/s:loc',ns);assert len(urls)==len(pages)-3
for node in urls:assert node.text in canonicals and not node.text.endswith(('/404','/privacy','/post','.html'))
for n in sitemap.findall('.//image:loc',ns):assert (D/urlsplit(n.text).path.lstrip('/')).exists()
assert 'Sitemap: '+base+'/sitemap.xml' in (D/'robots.txt').read_text()
print(f'PASS: {len(pages)} pages; {len(urls)} indexable sitemap URLs; {schema_count} JSON-LD graphs; {image_count} images checked; metadata, local links and CSP hashes valid.')
