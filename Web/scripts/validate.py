import json

with open(r'd:\موقع تيم depi sales\data\sales_data.json', encoding='utf-8') as f:
    data = json.load(f)

print(f'Records: {len(data)}')
print(f'Sample keys: {list(data[0].keys())}')
dates = [r['orderDate'] for r in data if r['orderDate']]
print(f'Date range: {min(dates)} to {max(dates)}')
print(f'Total revenue: ${sum(r["lineTotal"] for r in data):,.2f}')
print(f'Unique orders: {len(set(r["orderId"] for r in data))}')
print(f'Unique products: {len(set(r["productId"] for r in data))}')
print(f'Categories: {sorted(set(r["category"] for r in data if r["category"]))}')
print(f'Territories: {sorted(set(r["territory"] for r in data if r["territory"]))}')
print(f'Statuses: {sorted(set(r["status"] for r in data if r["status"]))}')
print('JSON VALID: OK')
