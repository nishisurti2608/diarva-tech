"""Check the deployed static source and explicit launch readiness gates."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlparse
import sys, re, xml.etree.ElementTree as ET
ROOT=Path(__file__).resolve().parents[1]
class Page(HTMLParser):
 def __init__(self):super().__init__();self.ids=[];self.fragments=[];self.local=[];self.links=[];self.h1=0;self.main=0;self.preview=False;self.errors=[]
 def handle_starttag(self,tag,attrs):
  a=dict(attrs)
  if 'id' in a:self.ids.append(a['id'])
  if tag=='h1':self.h1+=1
  if tag=='main':self.main+=1
  if 'data-preview-only' in a:self.preview=True
  if tag=='img' and 'alt' not in a:self.errors.append('Image missing alt attribute')
  if tag=='a':
   self.links.append(a)
   if not a.get('href'):self.errors.append('Anchor missing destination')
   if a.get('target')=='_blank' and 'noopener' not in a.get('rel',''):self.errors.append('External tab missing noopener')
  for name in ('src','href'):
   val=a.get(name,'')
   if val.startswith('#'):self.fragments.append(val[1:])
   elif val and not urlparse(val).scheme and not val.startswith('//'):self.local.append(val)
html=(ROOT/'dist/index.html').read_text();p=Page();p.feed(html)
errors=p.errors
if len(p.ids)!=len(set(p.ids)):errors.append('Duplicate element IDs')
if p.h1!=1 or p.main!=1:errors.append('Expected one h1 and one main landmark')
for fragment in p.fragments:
 if fragment not in p.ids:errors.append('Broken section anchor: '+fragment)
for asset in p.local:
 if not (ROOT/'dist'/asset).is_file():errors.append('Missing asset: '+asset)
for svg in (ROOT/'dist/assets').glob('*.svg'):ET.parse(svg)
ET.parse(ROOT/'dist/sitemap.xml')
if not re.search(r'<meta name="description" content="[^\"]{40,}"',html):errors.append('Missing search description')
if '<link rel="canonical"' not in html:errors.append('Missing canonical URL')
if '[ D / T ]' in html or 'mailto:info@diarva.org' in html:errors.append('Outdated brand/contact content')
for a in p.links:
 href=a.get('href','')
 if href.startswith('mailto:') and not href.startswith('mailto:tech@diarva.org'):errors.append('Unexpected enquiry mailbox')
 if href.startswith('tel:') and href!='tel:+13657670707':errors.append('Unexpected telephone number')
if p.preview and ('not real customer reviews' not in html or html.count('Sample testimonial ·')!=3):errors.append('Sample testimonials need explicit labels')
if '--launch' in sys.argv and p.preview:errors.append('LAUNCH GATE: replace sample testimonials with approved feedback, or remove the preview section')
if errors:
 for error in errors:print('FAIL:',error)
 sys.exit(1)
print(f'PASS: structure, {len(p.fragments)} section links, {len(p.local)} local asset references, SVG/XML, metadata, contact destinations, and sample labels.')
