import openpyxl
import json
import os

wb = openpyxl.load_workbook(r'd:\موقع تيم depi sales\Sales (3)-1.xlsx', read_only=True, data_only=True)
ws = wb['Table1']
rows = list(ws.iter_rows(values_only=True))
data = rows[1:]

records = []
for r in data:
    if r[2] is None:
        continue
    records.append({
        'orderDetailId': r[0],
        'orderId': r[1],
        'orderDate': r[2].strftime('%Y-%m-%d') if r[2] else None,
        'dueDate': r[3].strftime('%Y-%m-%d') if r[3] else None,
        'shipDate': r[4].strftime('%Y-%m-%d') if r[4] else None,
        'statusId': r[5],
        'status': r[6],
        'customerId': r[7],
        'salesPersonId': r[8],
        'territoryId': r[9],
        'territory': r[10],
        'territoryGroup': r[11],
        'shipMethodId': r[12],
        'shipMethod': r[13],
        'productId': r[14],
        'product': r[15],
        'subCategory': r[16],
        'category': r[17],
        'qty': r[18],
        'unitPrice': float(r[19]) if r[19] else 0,
        'taxAmt': float(r[20]) if r[20] else 0,
        'freight': float(r[21]) if r[21] else 0,
        'lineTotal': float(r[18] * r[19]) if r[18] and r[19] else 0
    })

out_path = r'd:\موقع تيم depi sales\data\sales_data.json'
os.makedirs(os.path.dirname(out_path), exist_ok=True)
with open(out_path, 'w', encoding='utf-8') as f:
    json.dump(records, f, ensure_ascii=False, separators=(',', ':'))

print(f'Records exported: {len(records)}')
print(f'File: {out_path}')
print(f'Size: {os.path.getsize(out_path):,} bytes')
