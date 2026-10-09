# SalesmanPro & Ghuba — Production Catalog Expansion Batch 2 Execution Report

**Execution Date:** October 9, 2026  
**Auditor / Data Engineer:** Antigravity Senior Production Engineer  
**Target Environment:** Local MongoDB on Production VPS (`mongodb://127.0.0.1:27017/salesmanprodb?replicaSet=rs0&directConnection=true`)  
**Target Host:** `vmi3151900` (`161.97.149.171:2222`)  
**Authorized Account:** `brendenozie@gmail.com` (`UserId: 67c5b0182e2372b5f2366dbe`)  

---

## 1. Executive Summary & Cumulative Progress

This report documents the completion of **Batch 2** of the live production catalog expansion for SalesmanPro and Ghuba. Building directly on the verified state left by Batch 1, Batch 2 targeted 6 previously empty or unpopulated retail specialty stores owned exclusively by `brendenozie@gmail.com`.

### Cumulative Production Evolution

| Metric | Pre-Expansion Baseline | After Batch 1 | After Batch 2 (Current) | Batch 2 Delta | Cumulative Delta | Verification Status |
| :--- | :---: | :---: | :---: | :---: | :---: | :--- |
| **Total Products (`Product`)** | 15 | 27 | **39** | **+12** | **+24** | Distinct, plausible items created with canonical taxonomy |
| **Total Marketplace Listings** | 58 | 71 | **83** | **+12** | **+25** | Linked to valid `Product` records with realistic KES pricing |
| **Active Public Offerings** | 11 | 11 | **11** | **0** | **0** | Strict separation: All new additions kept in **Draft** (`showOnGhuba: false`) |
| **Customer Orders (`CustomerOrder`)** | 196 | 196 | **196** | **0** | **0** | **100% Invariant** (Zero modifications or diffs) |
| **Order Items (`OrderItem`)** | 295 | 295 | **295** | **0** | **0** | **100% Invariant** (Zero modifications or diffs) |
| **External Merchant Records** | 5 | 5 | **5** | **0** | **0** | **100% Invariant** (13 external companies untouched) |
| **Eligible Stores Populated** | 0 | 6 | **12 stores** | **+6** | **+12** | Meaningful assortment created across 12 distinct store archetypes |

---

## 2. Batch 2 Store-by-Store Coverage Matrix & Additions

All 12 newly created items were mapped directly to the canonical taxonomy in [`scratch/canonical-taxonomy-full.json`](file:///c:/Users/Brenden/Desktop/SalesForce/SalesMan/scratch/canonical-taxonomy-full.json) and assigned working CloudFront CDN images (`https://dozi4r4ug9739.cloudfront.net/images/`) pre-flight verified to return **HTTP 200**:

### Store 1: Honey Duka (`699fefdbccfde3cbdf107c7b`, slug: `honey-duka`)
*Canonical Category:* **Honey Store** (`64e3a4e2d91b1b2a5e807030`)
- **Pure Natural Raw Acacia Honey (500g)**
  - `Product ID`: [`6ac8e1bec23b24b9e6d805db`](file:///c:/Users/Brenden/Desktop/SalesForce/SalesMan/scratch/catalog_expansion_batch2_audit.json#L32-L41) | `Listing ID`: `6ac8e1bec23b24b9e6d805dc`
  - Subcategory: `Raw & Organic Honey` (`64e3a4e2d91b1b2a5e807032`, slug: `raw-organic-honey`)
  - Brand: `Kitui Pure Honey` | Cost: KES 450 | Selling: KES 650 | Stock: 40
  - Image: `https://dozi4r4ug9739.cloudfront.net/images/1761641677232-pexels-marta-dzedyshko-1042863-2067569.jpg` (HTTP 200)
- **Organic Natural Raw Honeycomb Block (400g)**
  - `Product ID`: [`6ac8e1bec23b24b9e6d805dd`](file:///c:/Users/Brenden/Desktop/SalesForce/SalesMan/scratch/catalog_expansion_batch2_audit.json#L43-L52) | `Listing ID`: `6ac8e1bec23b24b9e6d805de`
  - Subcategory: `Honey Comb` (`64e3a4e2d91b1b2a5e807034`, slug: `honey-comb`)
  - Brand: `Kitui Pure Honey` | Cost: KES 600 | Selling: KES 850 | Stock: 25
  - Image: `https://dozi4r4ug9739.cloudfront.net/images/1761641677233-pexels-alinevianafoto-2465877.jpg` (HTTP 200)

### Store 2: Baby Duka (`699fea3fccfde3cbdf107c77`, slug: `baby-duka`)
*Canonical Category:* **Baby Store** (`64e3a4e2d91b1b2a5e807061`)
- **Pampers Premium Protection Diaper Pants Size 3 (56 Count)**
  - `Product ID`: [`6ac8e1bec23b24b9e6d805df`](file:///c:/Users/Brenden/Desktop/SalesForce/SalesMan/scratch/catalog_expansion_batch2_audit.json#L54-L63) | `Listing ID`: `6ac8e1bec23b24b9e6d805e0`
  - Subcategory: `Diapers & Care` (`64e3a4e2d91b1b2a5e807063`, slug: `diapers-care`)
  - Brand: `Pampers` | Cost: KES 1,600 | Selling: KES 2,100 | Stock: 35
  - Image: `https://dozi4r4ug9739.cloudfront.net/images/1779983928821-pexels-ketut-subiyanto-4720807.jpg` (HTTP 200)
- **Gentle Head-to-Toe Baby Wash & Shampoo (500ml)**
  - `Product ID`: [`6ac8e1bec23b24b9e6d805e1`](file:///c:/Users/Brenden/Desktop/SalesForce/SalesMan/scratch/catalog_expansion_batch2_audit.json#L65-L74) | `Listing ID`: `6ac8e1bec23b24b9e6d805e2`
  - Subcategory: `Baby Care & Health` (`64e3a4e2d91b1b2a5e807068`, slug: `baby-care-health`)
  - Brand: `Johnson's Baby` | Cost: KES 650 | Selling: KES 850 | Stock: 40
  - Image: `https://dozi4r4ug9739.cloudfront.net/images/1772222037583-pexels-babydov-7789062.jpg` (HTTP 200)

### Store 3: Watch Duka (`699fef6accfde3cbdf107c7a`, slug: `watch-duka`)
*Canonical Category:* **Watch Store** (`64e3a4e2d91b1b2a5e807041`)
- **Classic Stainless Steel Quartz Men's Dress Watch**
  - `Product ID`: [`6ac8e1bec23b24b9e6d805e3`](file:///c:/Users/Brenden/Desktop/SalesForce/SalesMan/scratch/catalog_expansion_batch2_audit.json#L76-L85) | `Listing ID`: `6ac8e1bec23b24b9e6d805e4`
  - Subcategory: `Classic Watches` (`64e3a4e2d91b1b2a5e807042`, slug: `classic-watches`)
  - Brand: `Casio` | Cost: KES 3,200 | Selling: KES 4,500 | Stock: 20
  - Image: `https://dozi4r4ug9739.cloudfront.net/images/1772312388704-stefen-tan-KYw1eUx1J7Y-unsplash.jpg` (HTTP 200)
- **Waterproof Bluetooth Fitness Smart Watch with Heart Rate Monitor**
  - `Product ID`: [`6ac8e1bec23b24b9e6d805e5`](file:///c:/Users/Brenden/Desktop/SalesForce/SalesMan/scratch/catalog_expansion_batch2_audit.json#L87-L96) | `Listing ID`: `6ac8e1bec23b24b9e6d805e6`
  - Subcategory: `Smart Watches` (`64e3a4e2d91b1b2a5e807040`, slug: `smart-watches`)
  - Brand: `Huawei` | Cost: KES 4,800 | Selling: KES 6,500 | Stock: 15
  - Image: `https://dozi4r4ug9739.cloudfront.net/images/1772312388804-kitai-zhvaeh-R9rA-unsplash.jpg` (HTTP 200)

### Store 4: Pets Duka (`699fea6eccfde3cbdf107c79`, slug: `pets-duka`)
*Canonical Category:* **Pets Store** (`64e3a4e2d91b1b2a5e807171`)
- **Complete Adult Dog Dry Food - Beef & Vegetable (10kg)**
  - `Product ID`: [`6ac8e1bec23b24b9e6d805e7`](file:///c:/Users/Brenden/Desktop/SalesForce/SalesMan/scratch/catalog_expansion_batch2_audit.json#L98-L107) | `Listing ID`: `6ac8e1bec23b24b9e6d805e8`
  - Subcategory: `Dog Food` (`64e3a4e2d91b1b2a5e807172`, slug: `dog-food`)
  - Brand: `Pedigree` | Cost: KES 3,200 | Selling: KES 4,200 | Stock: 20
  - Image: `https://dozi4r4ug9739.cloudfront.net/images/1780466319431-pexels-yvon-gallant-81432586-8941515.jpg` (HTTP 200)
- **Durable Rubber Chew & Fetch Dog Toy (Large)**
  - `Product ID`: [`6ac8e1bec23b24b9e6d805e9`](file:///c:/Users/Brenden/Desktop/SalesForce/SalesMan/scratch/catalog_expansion_batch2_audit.json#L109-L118) | `Listing ID`: `6ac8e1bec23b24b9e6d805ea`
  - Subcategory: `Pet Toys` (`64e3a4e2d91b1b2a5e807177`, slug: `pet-toys`)
  - Brand: `KONG` | Cost: KES 700 | Selling: KES 1,000 | Stock: 30
  - Image: `https://dozi4r4ug9739.cloudfront.net/images/1772312388807-kari-shea-1SAnrIxw5OY-unsplash.jpg` (HTTP 200)

### Store 5: Earphones Duka (`699ff3a4ccfde3cbdf107c80`, slug: `earphones-duka`)
*Canonical Category:* **Earphones Store** (`65d2a3e2d91b1b2a5e80a611`)
- **True Wireless Stereo Earbuds with Charging Case**
  - `Product ID`: [`6ac8e1bec23b24b9e6d805eb`](file:///c:/Users/Brenden/Desktop/SalesForce/SalesMan/scratch/catalog_expansion_batch2_audit.json#L120-L129) | `Listing ID`: `6ac8e1bec23b24b9e6d805ec`
  - Subcategory: `Wireless Earbuds` (`65d2a3e2d91b1b2a5e80a621`, slug: `wireless-earbuds`)
  - Brand: `Oraimo` | Cost: KES 1,800 | Selling: KES 2,500 | Stock: 30
  - Image: `https://dozi4r4ug9739.cloudfront.net/images/1782163103393-pexels-sejio402-29336327.jpg` (HTTP 200)
- **Deep Bass Over-Ear Wireless Bluetooth Headphones**
  - `Product ID`: [`6ac8e1bec23b24b9e6d805ed`](file:///c:/Users/Brenden/Desktop/SalesForce/SalesMan/scratch/catalog_expansion_batch2_audit.json#L131-L140) | `Listing ID`: `6ac8e1bec23b24b9e6d805ee`
  - Subcategory: `Sports Earphones` (`65d2a3e2d91b1b2a5e80a624`, slug: `sports-earphones`)
  - Brand: `JBL` | Cost: KES 3,500 | Selling: KES 4,800 | Stock: 15
  - Image: `https://dozi4r4ug9739.cloudfront.net/images/1772222037581-still-life-wireless-cyberpunk-headphones_23-2151072202.jpg` (HTTP 200)

### Store 6: Hardware Store (`69d54251b5abc7c341772e52`, slug: `hardware-store`)
*Canonical Category:* **Hardware Store** (`1122aabbccddeeff00112233`)
- **Heavy Duty 800W Rotary Hammer Drill with SDS-Plus Bits**
  - `Product ID`: [`6ac8e1bec23b24b9e6d805ef`](file:///c:/Users/Brenden/Desktop/SalesForce/SalesMan/scratch/catalog_expansion_batch2_audit.json#L142-L151) | `Listing ID`: `6ac8e1bec23b24b9e6d805f0`
  - Subcategory: `Power Tools` (`aabb00112233445566778899`, slug: `power-tools`)
  - Brand: `Bosch` | Cost: KES 6,500 | Selling: KES 8,500 | Stock: 12
  - Image: `https://dozi4r4ug9739.cloudfront.net/images/1772312389195-sam-pak-X6QffKLwyoQ-unsplash.jpg` (HTTP 200)
- **Professional 24-Piece Combination Spanner & Socket Tool Set**
  - `Product ID`: [`6ac8e1bec23b24b9e6d805f1`](file:///c:/Users/Brenden/Desktop/SalesForce/SalesMan/scratch/catalog_expansion_batch2_audit.json#L153-L162) | `Listing ID`: `6ac8e1bec23b24b9e6d805f2`
  - Subcategory: `Hand Tools` (`bbcc00112233445566778899`, slug: `hand-tools`)
  - Brand: `TotalTools` | Cost: KES 2,800 | Selling: KES 3,800 | Stock: 20
  - Image: `https://dozi4r4ug9739.cloudfront.net/images/1782163210269-pexels-tima-miroshnichenko-6263105.jpg` (HTTP 200)

---

## 3. Strict Safety & Invariance Compliance

1. **Ownership Boundary Assertion:**
   All operations were asserted against `Company.userId === ObjectId("67c5b0182e2372b5f2366dbe")` (`brendenozie@gmail.com`). Exactly zero writes touched external or unassigned companies.
2. **Transaction Table Invariance:**
   - Pre-Batch 1 `CustomerOrder`: **196** -> Post-Batch 2: **196** (0 delta)
   - Pre-Batch 1 `OrderItem`: **295** -> Post-Batch 2: **295** (0 delta)
3. **Draft Separation Policy:**
   All 12 newly created listings were initialized in **Draft** (`showOnGhuba: false`), preventing premature public display on Ghuba search until explicit merchant onboarding and stock sign-off are completed. Public offerings remain strictly at 11.
4. **Relationship Integrity:**
   Every newly created listing is foreign-key linked to its newly created Product document (`productId: prod._id`). Zero orphaned listings were introduced.
5. **Execution Latency:**
   The entire batch executed in **409ms** on the live database, with zero runtime errors, zero lock contention, and zero impact on running web and queue workers.

---

## 4. Machine-Readable Audit Evidence

- **Batch 2 Execution Audit:** `/var/www/salesmanpro/catalog_expansion_batch2_audit.json` (Mirror: [`scratch/catalog_expansion_batch2_audit.json`](file:///c:/Users/Brenden/Desktop/SalesForce/SalesMan/scratch/catalog_expansion_batch2_audit.json))
- **Batch 2 Verification Script:** `/var/www/salesmanpro/verify-batch2-integrity.js` (Mirror: [`scratch/verify-batch2-integrity.js`](file:///c:/Users/Brenden/Desktop/SalesForce/SalesMan/scratch/verify-batch2-integrity.js))
- **Batch 1 Audit Log:** `/var/www/salesmanpro/catalog_expansion_audit.json` (Mirror: [`scratch/catalog_expansion_audit.json`](file:///c:/Users/Brenden/Desktop/SalesForce/SalesMan/scratch/catalog_expansion_audit.json))
