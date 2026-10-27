"""Build a standalone static deployment ZIP for the chosen canonical domain."""
from pathlib import Path
import argparse,os,shutil,subprocess,sys,tempfile,zipfile
from urllib.parse import urlsplit
ROOT=Path(__file__).parent
FILES=['README.md','SEO_LAUNCH.md','build.py','seo.py','check_seo.py','export_site.py','banner_body.html','about_body.html','gallery.json','image_dimensions.json','vercel.json','executives.json']
p=argparse.ArgumentParser();p.add_argument('--url',default='https://cbmogun.org');p.add_argument('--output',required=True);args=p.parse_args()
u=urlsplit(args.url);assert u.scheme=='https' and u.netloc and not u.query and not u.fragment and u.path in ['', '/'],'Use an HTTPS domain without a path.'
output=Path(args.output).resolve();output.parent.mkdir(parents=True,exist_ok=True)
with tempfile.TemporaryDirectory(prefix='cbm-ogun-export-') as temp:
 target=Path(temp)
 for name in FILES:shutil.copy2(ROOT/name,target/name)
 shutil.copytree(ROOT/'dist',target/'dist')
 env=dict(os.environ,SITE_URL=args.url.rstrip('/'))
 subprocess.run([sys.executable,'build.py'],cwd=target,env=env,check=True)
 subprocess.run([sys.executable,'check_seo.py'],cwd=target,env=env,check=True)
 with zipfile.ZipFile(output,'w',zipfile.ZIP_DEFLATED) as z:
  for name in FILES:z.write(target/name,name)
  for f in (target/'dist').rglob('*'):
   if f.is_file():z.write(f,f.relative_to(target))
print('Production package:',output)
