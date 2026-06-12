# 🐄 Magadh Dairy Farm

Immersive 3D website + digital khata (ledger) for Faizan's village dairy business.

## What's inside

| Page | What it does |
| --- | --- |
| `/` | 3D farm (cows, buffaloes, barn, milk cans — drag to rotate) + live product availability in ₹ |
| `/portal` | Customers enter their mobile number and see their purchase logs, payments and live due |
| `/admin` | Dashboard — total udhaar, today's sales/collection, stock alerts |
| `/admin/ledger` | **The register**: one horizontal row per customer, one column per day. Click any cell to record what they took. Live due on the right, payment button per row |
| `/admin/customers` | Transfer customers from the manual register (name, phone, purana baaki) |
| `/admin/customers/[id]` | Full khata of one customer — entries, payments, edit, delete |
| `/admin/stock` | Update today's available stock & rates — sells decrement automatically, website shows khatam/kam/available live |

## Run it

```bash
npm install
cp .env.example .env.local   # then fill in MONGODB_URI and ADMIN_PASSWORD
npm run seed   # fills MongoDB with demo products, 10 customers, ~16 days of entries
npm run dev    # http://localhost:3013
```

Admin login: password `faizan123` (change `ADMIN_PASSWORD` in `.env.local`).

## Notes

- DB: MongoDB Atlas (`MONGODB_URI` in `.env.local`), currency is ₹ (INR).
- Product order everywhere: **Milk → Paneer → Ghee → Khowa → Dahi** (most-sold first).
- Stock rules: recording a purchase subtracts from stock and blocks the entry if not enough is left; deleting an entry adds the stock back.
- Due formula: `purana baaki (opening balance) + total purchases − total payments`, computed live on every screen.
