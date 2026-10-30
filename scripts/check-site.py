"""Validate every static page, structured data, links and launch-content gates."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit, unquote
import sys, re, json, xml.etree.ElementTree as ET
ROOT=Path(__file__).resolve().parents[1];DIST=ROOT/'dist';errors=[]
class Page(HTMLParser):
 def __init__(self,path):
  super().__init__();self.path=path;self.ids=[];self.fragments=[];self.local=[];self.links=[];self.h1=0;self.main=0;self.preview=False;self.canonical=[];self.description=[];self.title='';self.in_title=False;self.in_schema=False;self.schema_text='';self.schemas=[]
 def handle_starttag(self,tag,attrs):
  a=dict(attrs)
  if 'id' in a:self.ids.append(a['id'])
  if tag=='h1':self.h1+=1
  if tag=='main':self.main+=1
  if tag=='title':self.in_title=True
  if tag=='script' and a.get('type')=='application/ld+json':self.in_schema=True;self.schema_text=''
  if tag=='link' and a.get('rel')=='canonical':self.canonical.append(a.get('href',''))
  if tag=='meta' and a.get('name')=='description':self.description.append(a.get('content',''))
  if 'data-preview-only' in a:self.preview=True
  if tag=='img' and 'alt' not in a:errors.append(f'{self.path.name}: image missing alt')
  if tag=='a':
   self.links.append(a)
   if not a.get('href'):errors.append(f'{self.path.name}: empty link')
   if a.get('target')=='_blank' and 'noopener' not in a.get('rel',''):errors.append(f'{self.path.name}: new tab missing noopener')
  for name in ('src','href'):
   value=a.get(name,'');parsed=urlsplit(value)
   if parsed.scheme=='javascript':errors.append(f'{self.path.name}: javascript link')
   if value and not parsed.scheme and not value.startswith('//'):self.local.append(parsed)
 def handle_data(self,value):
  if self.in_title:self.title+=value
  if self.in_schema:self.schema_text+=value
 def handle_endtag(self,tag):
  if tag=='title':self.in_title=False
  if tag=='script' and self.in_schema:
   self.in_schema=False
   try:self.schemas.append(json.loads(self.schema_text))
   except ValueError:errors.append(f'{self.path.name}: invalid JSON-LD')
pages={}
for path in DIST.rglob('*.html'):
 page=Page(path);page.feed(path.read_text());pages[path.resolve()]=page
config=(DIST/'site-config.js').read_text();base=re.search(r"siteUrl: '([^']+)'",config)[1]
urls=[];titles=[];descriptions=[];references=0
for path,page in pages.items():
 rel=path.relative_to(DIST);label=str(rel)
 if page.h1!=1 or page.main!=1:errors.append(label+': expected one h1/main')
 if len(page.ids)!=len(set(page.ids)):errors.append(label+': duplicate IDs')
 route=str(rel).replace('index.html','');expected=base+'/'+route
 if page.canonical!=[expected]:errors.append(label+': canonical mismatch')
 if len(page.description)!=1 or len(page.description[0])<40:errors.append(label+': missing description')
 titles.append(page.title);descriptions.extend(page.description);urls.append(expected)
 if not page.title or len(page.title)>85:errors.append(label+': missing or excessively long title')
 for ref in page.local:
  references+=1
  target=(path.parent/unquote(ref.path)).resolve() if ref.path else path
  if target.is_dir():target=target/'index.html'
  if DIST not in target.parents:errors.append(label+': link escapes site');continue
  if not target.is_file():errors.append(label+': missing local target '+str(target.relative_to(DIST)))
  elif ref.fragment and (target not in pages or unquote(ref.fragment) not in pages[target].ids):errors.append(label+': broken fragment '+ref.fragment)
 for a in page.links:
  href=a.get('href','')
  if href.startswith('mailto:') and not href.startswith('mailto:tech@diarva.org'):errors.append(label+': unexpected mailbox')
  if href.startswith('tel:') and href!='tel:+13657670707':errors.append(label+': unexpected telephone')
 def inspect(value):
  if isinstance(value,dict):
   types=value.get('@type',[]);types=[types] if isinstance(types,str) else types
   if any(t in ('Review','AggregateRating') for t in types):errors.append(label+': unverified review schema')
   for v in value.values():inspect(v)
  elif isinstance(value,list):
   for v in value:inspect(v)
 for data in page.schemas:inspect(data)
 source=path.read_text()
 if page.preview:
  if source.count('Sample testimonial ·')!=3 or source.count('Example ')!=3:errors.append('Each sample testimonial needs a label and example company')
  if '--launch' in sys.argv:errors.append('LAUNCH GATE: replace sample testimonials with approved feedback, or remove the sample section')
 if 'analytics.js' not in source or 'site-config.js' not in source:errors.append(label+': missing analytics/config integration')
if len(titles)!=len(set(titles)):errors.append('Page titles must be unique')
if len(descriptions)!=len(set(descriptions)):errors.append('Page descriptions must be unique')
for path in (DIST/'assets').glob('*.svg'):ET.parse(path)
sitemap=ET.parse(DIST/'sitemap.xml');listed=[e.text for e in sitemap.findall('.//{http://www.sitemaps.org/schemas/sitemap/0.9}loc')]
if set(listed)!=set(urls):errors.append('Sitemap does not match canonical pages')
if base+'/sitemap.xml' not in (DIST/'robots.txt').read_text():errors.append('robots.txt sitemap mismatch')
if errors:
 for e in errors:print('FAIL:',e)
 sys.exit(1)
print(f'PASS: {len(pages)} pages, {references} local references, unique titles/descriptions, canonicals, sitemap, JSON-LD, contact links, and sample labels.')
