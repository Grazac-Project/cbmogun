"""Local preview of dist/ that behaves like Vercel: clean URLs, vercel.json redirects, /studio routes and 404.html."""
import http.server,json,re,sys
from pathlib import Path
ROOT=Path(__file__).parent;D=ROOT/'dist';PORT=int(sys.argv[1]) if len(sys.argv)>1 else 8765

def pattern(source):
 # vercel.json sources: ":name" segments and plain regex groups.
 names=re.findall(r':(\w+)',source)
 return re.compile('^'+re.sub(r':\w+',r'([^/]+)',source)+'$'),names
REDIRECTS=[(*pattern(r['source']),r['destination']) for r in json.loads((ROOT/'vercel.json').read_text()).get('redirects',[])]

class Handler(http.server.SimpleHTTPRequestHandler):
 def __init__(self,*args,**kwargs):super().__init__(*args,directory=str(D),**kwargs)
 def redirect(self,location):
  self.send_response(308);self.send_header('Location',location);self.end_headers()
 def do_GET(self):
  path,_,query=self.path.partition('?');query='?'+query if query else ''
  for regex,names,destination in REDIRECTS:
   m=regex.match(path)
   if m:
    for i,value in enumerate(m.groups(),1):destination=destination.replace(f'${i}',value)
    for name,value in zip(names,m.groups()):destination=destination.replace(':'+name,value)
    return self.redirect(destination+query)
  if path.endswith('.html') and not path.startswith('/studio/'):
   return self.redirect((path[:-5].removesuffix('/index') or '/')+query)
  target=D/path.lstrip('/')
  if path!='/' and not target.is_file() and (D/(path.lstrip('/')+'.html')).is_file():self.path=path+'.html'+query
  elif path.startswith('/studio') and not target.is_file():self.path='/studio/index.html'
  elif not target.is_file() and not (target/'index.html').is_file():
   self.send_response(404);self.send_header('Content-Type','text/html; charset=utf-8');self.end_headers();self.wfile.write((D/'404.html').read_bytes());return
  return super().do_GET()

if __name__=='__main__':
 print(f'Previewing dist/ at http://localhost:{PORT}');http.server.ThreadingHTTPServer(('',PORT),Handler).serve_forever()
