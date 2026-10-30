"""Set a verified public origin, optional GA4 stream, and Search Console token."""
import argparse, re, json
from pathlib import Path
from urllib.parse import urlsplit
root=Path(__file__).resolve().parents[1];dist=root/'dist'
p=argparse.ArgumentParser();p.add_argument('--url');p.add_argument('--ga4-id');p.add_argument('--search-console-token');a=p.parse_args()
config=(dist/'site-config.js').read_text();old=re.search(r"siteUrl: '([^']+)'",config)[1];ga=re.search(r"ga4MeasurementId: '([^']*)'",config)[1]
url=(a.url or old).rstrip('/');parsed=urlsplit(url)
if parsed.scheme!='https' or not parsed.netloc or parsed.path or parsed.query or parsed.fragment or parsed.username:raise SystemExit('Use a verified HTTPS origin without a path, query, credentials, or fragment.')
if a.ga4_id is not None:
 if a.ga4_id and not re.fullmatch(r'G-[A-Z0-9]{5,20}',a.ga4_id):raise SystemExit('Expected a GA4 Measurement ID such as G-XXXXXXXXXX, or an empty string to disable.')
 ga=a.ga4_id
if a.search_console_token is not None and not re.fullmatch(r'[A-Za-z0-9_-]{10,200}',a.search_console_token):raise SystemExit('Unexpected verification token format.')
for path in list(dist.rglob('*.html'))+[dist/'sitemap.xml',dist/'robots.txt']:
 path.write_text(path.read_text().replace(old,url))
config=config.replace("siteUrl: '"+old+"'","siteUrl: '"+url+"'")
config=re.sub(r"ga4MeasurementId: '[^']*'","ga4MeasurementId: '"+ga+"'",config);(dist/'site-config.js').write_text(config)
if a.search_console_token:
 path=dist/'index.html';source=path.read_text();source=re.sub(r'<meta name="google-site-verification" content="[^"]*">','',source);source=source.replace('</head>','<meta name="google-site-verification" content="'+a.search_console_token+'"></head>');path.write_text(source)
print(json.dumps({'site_url':url,'analytics_configured':bool(ga),'search_console_token_added':bool(a.search_console_token)}))
