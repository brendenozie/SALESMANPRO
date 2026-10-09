import json

with open(r'c:\Users\Brenden\Desktop\SalesForce\SalesMan\scratch\14-live-details.json', 'r', encoding='utf-8') as f:
    items = json.load(f)

print(f"{'Idx':<3} | {'Name':<35} | {'Store':<22} | {'Category / Subcategory':<35} | {'Sell Price':<10} | {'Imgs':<5} | {'Stock':<6}")
print("-" * 125)
for idx, item in enumerate(items, 1):
    name = item['name'][:35]
    store = item['store']['name'][:22]
    cat = f"{item['category']['name'] or 'N/A'} / {item['category']['subCategory'] or 'N/A'}"[:35]
    price = f"KES {item['pricing'].get('sellingPrice', 'N/A')}"
    imgs = item['imagery']['count']
    stock = str(item['inventory'].get('listingStock') or item['inventory'].get('productStock') or 'N/A')
    print(f"{idx:<3} | {name:<35} | {store:<22} | {cat:<35} | {price:<10} | {imgs:<5} | {stock:<6}")
