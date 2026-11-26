import json
import os

with open(r'd:\موقع تيم depi sales\data\sales_data.json', encoding='utf-8') as f:
    data = json.load(f)

by_year = {}
for r in data:
    year = r['orderDate'][:4] if r['orderDate'] else 'unknown'
    by_year.setdefault(year, []).append(r)

out_dir = r'd:\موقع تيم depi sales\data'

for year, records in sorted(by_year.items()):
    content = f'window.SALES_DATA=(window.SALES_DATA||[]).concat({json.dumps(records, ensure_ascii=False, separators=(",", ":"))});'
    path = os.path.join(out_dir, f'sales_{year}.js')
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    size_kb = os.path.getsize(path) / 1024
    print(f'sales_{year}.js — {len(records):,} records — {size_kb:.0f} KB')

print('\nDone! Delete sales_data.js after verifying.')
