"""Static SEO enhancements. No credentials, external calls or third-party packages."""
import html,json,re,hashlib,base64
import sanity
from pathlib import Path
BRAND='City Boy Movement Ogun State'
META={
'index.html':('City Boy Movement Ogun State | CBM Ogun','City Boy Movement Ogun State: meet our leadership, explore chapter programmes and photos, register your support group and create your CBM Ogun banner.'),
'about.html':('About CBM Ogun | City Boy Movement Ogun State','Discover City Boy Movement Ogun State: our story, vision, mission, values and community focus. Meet the chapter and find ways to participate.'),
'leadership.html':('Leadership & State Executives | CBM Ogun','Meet City Boy Movement Ogun State leadership: Grand Patron, Patrons, State Director Dr. Adegboyega Abdulateef Sulaiman and the state executive team.'),
'gallery.html':('Inauguration & Women Wing Photo Gallery | CBM Ogun','Explore City Boy Movement Ogun State photos from the Inauguration and Women Wing. Browse albums and open each photograph in the full-image viewer.'),
'programmes.html':('Community Programmes & Focus Areas | CBM Ogun','Explore CBM Ogun programme priorities: community and social welfare, learning and opportunity, civic engagement, and volunteer service in Ogun State.'),
'programmes/community.html':('Community & Social Welfare | CBM Ogun','Explore City Boy Movement Ogun State’s community and social welfare focus, including community listening, practical support and responsible service.'),
'programmes/learning.html':('Learning, Skills & Opportunity | CBM Ogun','Explore City Boy Movement Ogun State’s focus on learning, skills and opportunity, with information to support personal development and community learning.'),
'programmes/civic.html':('Civic Engagement & Participation | CBM Ogun','Explore City Boy Movement Ogun State’s civic engagement focus: useful public information, respectful dialogue and participation in community life.'),
'programmes/volunteering.html':('Volunteer Service & Community Participation | CBM Ogun','Learn about City Boy Movement Ogun State’s volunteer service priorities, defined roles, teamwork and accountable community participation.'),
'news.html':('News, Events & Chapter Information | CBM Ogun','Find City Boy Movement Ogun State chapter information, membership guides and the route to national announcements, events and participation opportunities.'),
'contact.html':('Contact & Membership Enquiries | CBM Ogun','Find enquiry routes for City Boy Movement Ogun State, connect with our social channels and access national membership registration and account support.'),
'resources.html':('Membership FAQs & Chapter Resources | CBM Ogun','Get answers about City Boy Movement membership, programmes and chapter enquiries. Access the original Ogun State chapter logo for authorised use.'),
'banner.html':('Create Your City Boy Movement Ogun Banner | CBM Ogun','Create your personalised “I am City Boy” Ogun State banner. Add a photo and name, adjust the crop, and download a portrait or square PNG to share.'),
'support-group-registration.html':('Register Your Support Group | City Boy Movement Ogun','Register your professional, religious, artisan or humanitarian support group with City Boy Movement Ogun State using the chapter’s registration form.'),
'privacy.html':('Privacy Policy | City Boy Movement Ogun State','Read how the City Boy Movement Ogun State website handles banner images, Google Forms registration, external services and technical connection information.'),
'404.html':('Page Not Found | CBM Ogun','This page could not be found. Visit City Boy Movement Ogun State for chapter information, leadership, photos, programmes and membership links.')}

# Sanity Studio is built into dist/studio (see vercel.json buildCommand) and gets its own headers.
STUDIO_HEADERS=[{'key':'X-Content-Type-Options','value':'nosniff'},{'key':'Referrer-Policy','value':'strict-origin-when-cross-origin'},{'key':'X-Robots-Tag','value':'noindex, nofollow'},{'key':'Content-Security-Policy','value':"frame-ancestors 'self'; object-src 'none'; base-uri 'self'"}]
# News & Events moved from /updates to /news; keep old shared links working.
OLD_NEWS_REDIRECTS=[{'source':'/updates.html','destination':'/news','permanent':True},{'source':'/updates','destination':'/news','permanent':True},{'source':'/updates/(.*)\\.html','destination':'/news/$1','permanent':True},{'source':'/updates/:slug','destination':'/news/:slug','permanent':True}]
NOINDEX=['404.html','privacy.html','post.html']
ARTICLES={}  # news/*.html -> BlogPosting fields, filled by build.py

def page_path(file):
 # Pages are served without .html (vercel.json cleanUrls): about.html -> /about, index.html -> /.
 return '/' if file=='index.html' else '/'+file.removesuffix('.html')
def clean_links(text):
 text=re.sub(r'href="/index\.html(?=[#?"])','href="/',text)
 return re.sub(r'href="(/[^"#?]+?)\.html(?=[#?"])',r'href="\1',text)

def clean(text):return html.unescape(re.sub('<[^>]+>',' ',text)).strip()
def jld(value):return json.dumps(value,ensure_ascii=False,separators=(',',':')).replace('<','\\u003c')
def enhance(file,body,text,base,root):
 title,desc=META.get(file,(BRAND,'Explore City Boy Movement Ogun State chapter information.'))
 canonical=base+page_path(file)
 title_e=html.escape(title,quote=True);desc_e=html.escape(desc,quote=True)
 text=re.sub(r'<title>.*?</title>',f'<title>{title_e}</title>',text)
 text=re.sub(r'<meta name="description"[^>]*>',f'<meta name="description" content="{desc_e}">',text)
 for prop,value in [('og:title',title_e),('og:description',desc_e)]:text=re.sub(r'<meta property="'+prop+r'"[^>]*>',f'<meta property="{prop}" content="{value}">',text)
 text=text.replace('/assets/social-cover.png','/assets/social-cover.jpg')
 text=clean_links(text)
 # Reserve image space and serve appropriately sized gallery files.
 dims=json.loads((root/'image_dimensions.json').read_text())
 def image_tag(m):
  tag=m.group();src=re.search(r'src="([^"]+)"',tag)
  if not src:return tag
  path=src[1]
  if path in dims:
   w,h=dims[path]
   if not re.search(r'\bwidth=',tag):tag=tag[:-1]+f' width="{w}" height="{h}">'
   if '/assets/gallery/' in path and path.endswith('.webp'):
    small=path[:-5]+'-800.webp'
    if small in dims:tag=tag[:-1]+f' srcset="{small} {dims[small][0]}w, {path} {w}w" sizes="(max-width:480px) calc(100vw - 32px), (max-width:760px) calc(50vw - 30px), (max-width:1300px) calc(33vw - 40px), 400px">'
  if 'decoding=' not in tag:tag=tag[:-1]+' decoding="async">'
  return tag
 text=re.sub(r'<img\b[^>]*>',image_tag,text)
 indexable=file not in NOINDEX
 robot='index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1' if indexable else 'noindex,follow'
 extra=f'<meta name="robots" content="{robot}"><meta property="og:site_name" content="{BRAND}"><meta property="og:locale" content="en_NG"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta property="og:image:type" content="image/jpeg"><meta property="og:image:alt" content="City Boy Movement Ogun State chapter"><meta name="twitter:title" content="{title_e}"><meta name="twitter:description" content="{desc_e}"><meta name="twitter:image" content="{base}/assets/social-cover.jpg"><meta name="twitter:image:alt" content="City Boy Movement Ogun State chapter"><meta name="twitter:site" content="@cityboymovt_og">'
 for env,name in [('GOOGLE_SITE_VERIFICATION','google-site-verification'),('BING_SITE_VERIFICATION','msvalidate.01')]:
  import os
  if os.environ.get(env):extra+=f'<meta name="{name}" content="{html.escape(os.environ[env],quote=True)}">'
 if file=='index.html':extra+='<link rel="preload" href="/assets/president-tinubu.webp" as="image" fetchpriority="high">'
 org_id=base+'/#organization';site_id=base+'/#website'
 graph=[{'@type':'Organization','@id':org_id,'name':BRAND,'alternateName':['CBM Ogun','City Boy Movement Ogun'],'url':base+'/','logo':{'@type':'ImageObject','url':base+'/assets/cbm-ogun-logo.png','width':1881,'height':858},'description':'The Ogun State chapter of City Boy Movement.','areaServed':{'@type':'AdministrativeArea','name':'Ogun State, Nigeria'},'parentOrganization':{'@type':'Organization','name':'City Boy Movement','url':'https://cbmnigeria.org/'},'sameAs':['https://x.com/cityboymovt_og','https://www.instagram.com/ogcityboymovt/']},{'@type':'WebSite','@id':site_id,'url':base+'/','name':BRAND,'alternateName':'CBM Ogun','publisher':{'@id':org_id},'inLanguage':'en-NG'}]
 page_type='ImageGallery' if file=='gallery.html' else 'AboutPage' if file=='about.html' else 'ContactPage' if file=='contact.html' else 'CollectionPage' if file in ['programmes.html','news.html','leadership.html'] else 'WebPage'
 page={'@type':page_type,'@id':canonical+'#webpage','url':canonical,'name':title,'description':desc,'isPartOf':{'@id':site_id},'about':{'@id':org_id},'inLanguage':'en-NG'}
 if file not in ['index.html','404.html']:
  crumbs=[{'@type':'ListItem','position':1,'name':'Home','item':base+'/'}]
  if '/' in file:
   parent=file.split('/')[0]+'.html';crumbs.append({'@type':'ListItem','position':2,'name':'Programmes' if file.startswith('programmes/') else 'News & Events','item':base+page_path(parent)})
  label={'gallery.html':'Gallery','leadership.html':'Leadership','banner.html':'Create your banner','support-group-registration.html':'Support group registration'}.get(file,title.split(' | ')[0])
  crumbs.append({'@type':'ListItem','position':len(crumbs)+1,'name':label,'item':canonical});graph.append({'@type':'BreadcrumbList','@id':canonical+'#breadcrumb','itemListElement':crumbs});page['breadcrumb']={'@id':canonical+'#breadcrumb'}
 if file=='gallery.html':
  photos=json.loads((root/'gallery.json').read_text());page['mainEntity']={'@type':'ItemList','numberOfItems':len(photos),'itemListElement':[{'@type':'ListItem','position':i+1,'item':{'@type':'ImageObject','contentUrl':base+p['image'],'caption':p['description'],'name':p['title']}} for i,p in enumerate(photos)]}
 if file=='banner.html':graph.append({'@type':'WebApplication','name':'CBM Ogun Banner Generator','url':canonical,'applicationCategory':'DesignApplication','operatingSystem':'Any modern web browser','browserRequirements':'Requires JavaScript','isAccessibleForFree':True,'publisher':{'@id':org_id}})
 if file in ARTICLES:
  page['@type']='BlogPosting';page['publisher']={'@id':org_id};page.update({k:v for k,v in ARTICLES[file].items() if v})
 graph.append(page)
 extra+='<script type="application/ld+json">'+jld({'@context':'https://schema.org','@graph':graph})+'</script>'
 text=text.replace('</head>',extra+'</head>')
 return text

def finish(base,root):
 from xml.etree.ElementTree import Element,SubElement,ElementTree,register_namespace
 ns='http://www.sitemaps.org/schemas/sitemap/0.9';ins='http://www.google.com/schemas/sitemap-image/1.1';register_namespace('',ns);register_namespace('image',ins)
 tree=Element('{'+ns+'}urlset');pages=[];hashes=set()
 for p in sorted((root/'dist').rglob('*.html')):
  file=str(p.relative_to(root/'dist'))
  if file.startswith('studio/'):continue
  text=p.read_text()
  for script in re.findall(r'<script type="application/ld\+json">(.*?)</script>',text):hashes.add("'sha256-"+base64.b64encode(hashlib.sha256(script.encode()).digest()).decode()+"'")
  if file in NOINDEX:continue
  loc=base+page_path(file);node=SubElement(tree,'{'+ns+'}url');SubElement(node,'{'+ns+'}loc').text=loc;pages.append(loc)
  main=text.split('<main id="main">',1)[1].split('</main>',1)[0]
  for src in dict.fromkeys(re.findall(r'<img[^>]+src="(/assets/[^"]+)"',main)):
   im=SubElement(node,'{'+ins+'}image');SubElement(im,'{'+ins+'}loc').text=base+src
 ElementTree(tree).write(root/'dist/sitemap.xml',encoding='utf-8',xml_declaration=True)
 (root/'dist/robots.txt').write_text('User-agent: *\nAllow: /\n\nSitemap: '+base+'/sitemap.xml\n')
 # Permit the exact generated JSON-LD blocks without allowing arbitrary inline JavaScript.
 config=json.loads((root/'vercel.json').read_text());csp="default-src 'self'; script-src 'self' "+' '.join(sorted(hashes))+"; style-src 'self' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https://cdn.sanity.io; connect-src 'self'"+(f' https://{sanity.PROJECT}.apicdn.sanity.io' if sanity.configured() else '')+"; frame-src https://docs.google.com; base-uri 'self'; form-action 'none'; frame-ancestors 'none'; object-src 'none'"
 for row in config['headers']:
  # The site-wide rules skip /studio, which has its own looser policy so Sanity Studio can run.
  if row['source'] in ['/(.*)','/((?!studio(?:/|$)).*)']:row['source']='/((?!studio(?:/|$)).*)'
  for h in row['headers']:
   if h['key']=='Content-Security-Policy':h['value']=csp
 config['headers']=[row for row in config['headers'] if row['source'] not in ['/assets/(.*)','/404.html','/privacy.html','/post.html','/404','/privacy','/post','/studio','/studio/(.*)']]
 config['cleanUrls']=True
 config['headers'] += [{'source':'/assets/(.*)','headers':[{'key':'Cache-Control','value':'public, max-age=604800, stale-while-revalidate=86400'}]},{'source':'/404','headers':[{'key':'X-Robots-Tag','value':'noindex, follow'}]},{'source':'/privacy','headers':[{'key':'X-Robots-Tag','value':'noindex, follow'}]},{'source':'/post','headers':[{'key':'X-Robots-Tag','value':'noindex, follow'}]},{'source':'/studio','headers':STUDIO_HEADERS},{'source':'/studio/(.*)','headers':STUDIO_HEADERS}]
 config['redirects']=[{'source':'/index.html','destination':'/','permanent':True}]+OLD_NEWS_REDIRECTS
 # Studio routes are handled in the browser; real files under /studio are served first.
 config['rewrites']=[{'source':'/studio','destination':'/studio/index.html'},{'source':'/studio/:path*','destination':'/studio/index.html'}]
 (root/'vercel.json').write_text(json.dumps(config,indent=2)+'\n')
 headers='/*\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: strict-origin-when-cross-origin\n  Permissions-Policy: camera=(), microphone=(), geolocation=()\n  Content-Security-Policy: '+csp+'\n/assets/*\n  Cache-Control: public, max-age=604800, stale-while-revalidate=86400\n/404\n  X-Robots-Tag: noindex, follow\n/privacy\n  X-Robots-Tag: noindex, follow\n/post\n  X-Robots-Tag: noindex, follow\n'
 (root/'dist/_headers').write_text(headers);(root/'dist/_redirects').write_text('/index.html / 301\n/updates.html /news 301\n/updates /news 301\n/updates/:slug.html /news/:slug 301\n/updates/:slug /news/:slug 301\n/studio/* /studio/index.html 200\n')
 return len(pages)
