import re

with open(r'd:\موقع تيم depi sales\dashboard.html', encoding='utf-8') as f:
    html = f.read()

ids_in_html = set(re.findall(r'id="([^"]+)"', html))

with open(r'd:\موقع تيم depi sales\js\dashboard.js', encoding='utf-8') as f:
    js_dash = f.read()
with open(r'd:\موقع تيم depi sales\js\charts.js', encoding='utf-8') as f:
    js_charts = f.read()
with open(r'd:\موقع تيم depi sales\js\tables.js', encoding='utf-8') as f:
    js_tables = f.read()

js_all = js_dash + js_charts + js_tables

ids_referenced = set(re.findall(r'getElementById\("([^"]+)"\)', js_all))
canvas_in_js = set(re.findall(r"'(chart[A-Za-z0-9]+)'", js_all))
canvas_in_html = set(re.findall(r'id="(chart[A-Za-z0-9]+)"', html))

print('IDs referenced in JS but missing from HTML:')
missing = ids_referenced - ids_in_html
for m in sorted(missing):
    print(' ', m)

print()
print('Canvas IDs in JS but missing from HTML:')
missing_canvas = canvas_in_js - canvas_in_html
for c in sorted(missing_canvas):
    print(' ', c)

print()
print('ALL IDs in HTML:', sorted(ids_in_html))
print()
print('All canvas refs in JS:', sorted(canvas_in_js))
print()
print('All canvas IDs in HTML:', sorted(canvas_in_html))
print('DONE')
