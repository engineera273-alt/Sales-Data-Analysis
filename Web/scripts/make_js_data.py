import json

with open(r'd:\موقع تيم depi sales\data\sales_data.json', encoding='utf-8') as f:
    data = f.read()

out = f'window.SALES_DATA = {data};'

with open(r'd:\موقع تيم depi sales\data\sales_data.js', 'w', encoding='utf-8') as f:
    f.write(out)

print(f'Written: {len(out):,} bytes')
