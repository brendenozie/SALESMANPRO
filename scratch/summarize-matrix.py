import json

with open('scratch/matrix-49-results.json', 'r', encoding='utf-8') as f:
    lines = f.readlines()

json_str = ''.join(lines[19:756])
data = json.loads(json_str)

print(f"Total Hostnames: {len(data)}")
all_owned = all(d['isTargetOwner'] for d in data)
print(f"All 49 Owned by 67c5b0182e2372b5f2366dbe: {all_owned}")

at_target = [d for d in data if d['shortfall'] == 0]
has_offerings = [d for d in data if d['distinctOfferings'] > 0]
zero_offerings = [d for d in data if d['distinctOfferings'] == 0]

print(f"\nStores already at >= 20 offerings: {len(at_target)}")
for s in at_target:
    print(f"  - #{s['index']} {s['companyName']} ({s['hostname']}): {s['distinctOfferings']} offerings")

print(f"\nStores with existing partial offerings (>0 and <20): {len(has_offerings) - len(at_target)}")
for s in has_offerings:
    if s['shortfall'] > 0:
        print(f"  - #{s['index']} {s['companyName']} ({s['hostname']}): {s['distinctOfferings']} offerings (needs +{s['shortfall']})")

print(f"\nStores with 0 offerings (needs +20): {len(zero_offerings)}")
