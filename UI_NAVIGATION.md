# UI Navigation - Tab Bar Documentation
## Same Solutions PWA

---

## 📱 Tab Bar (Horizontal Scroll Navigation)

### Official Name
The sideways scrollbar at the top of the app is called the **Tab Bar** or **Horizontal Navigation Bar**.

Alternative names in web/mobile development:
- Tab Bar (iOS style)
- Bottom Navigation / Top Navigation
- Horizontal Scroll Nav
- Pill Navigation
- Segmented Control (when fixed width)

### Purpose
Provides quick access to main app sections without hierarchical drilling. Users can swipe left/right to see more tabs, or tap to navigate directly.

### Current Tabs (v120)
| Tab | Icon | Purpose |
|-----|------|---------|
| Dashboard | 📊 | Overview, quick stats, recent activity |
| Estimator | ⚡ | Quick job cost estimation |
| Customers | 👥 | Customer/contact management |
| Jobs | 📋 | Work history (individual tasks) |
| Invoices | 🧾 | Billing documents (group jobs) |
| Quotes | 📝 | Estimates before work |
| Parts | 🔧 | Parts inventory |
| Reports | 📈 | Analytics & exports |
| Expenses | 💳 | Business expense tracking |
| Mileage | 🚗 | IRS mileage tracking |
| Knowledge | 🧠 | Equipment specs database |

### Proposed Changes (per Sam's feedback)
| Current | Change | Reason |
|---------|--------|--------|
| Jobs | Rename to "Work History" | Better describes purpose |
| Mileage | Move to sub-section | Not frequently used |
| Parts | Move to sub-section | Not frequently used |

---

## 🔗 Jobs vs Invoices - Data Relationship

### Current (Correct) Architecture
```
Invoice SS-001
├── jobs: ["J-001", "J-002"]  ← References by ID (no duplication)
├── subtotal: 250             ← Calculated from jobs
├── discount: 0
├── total: 250
└── status: "paid"

Job J-001
├── id: "J-001"
├── customer: "mike-letvin"
├── description: "Vent cleaning"
├── amount: 100               ← Source of truth
├── status: "paid"
└── invoice: "SS-001"         ← Back-reference

Job J-002
├── id: "J-002"
├── amount: 150
├── invoice: "SS-001"         ← Back-reference
```

### Key Points
1. **Jobs are the atomic unit of work** - each has its own amount
2. **Invoices group jobs** - reference by ID, don't copy data
3. **Invoice total calculated** from sum of job amounts minus discount
4. **Two-way linking** - Job knows its invoice, Invoice knows its jobs

### No Data Duplication ✅
- Job amounts stored once (in job)
- Invoice totals calculated (not stored separately)
- Customer ID referenced (not customer data copied)

---

## 📋 Test Cases Needed

### Tab Bar Tests
- [ ] All tabs render correctly
- [ ] Horizontal scroll works on mobile
- [ ] Active tab highlighted
- [ ] Tab preserves state when switching back
- [ ] Customer role sees limited tabs
- [ ] Admin role sees all tabs

### Jobs ↔ Invoice Relationship Tests
- [ ] Creating invoice links job.invoice correctly
- [ ] Deleting invoice clears job.invoice reference
- [ ] Invoice total equals sum of job amounts
- [ ] Editing job amount updates invoice total
- [ ] Jobs page shows invoice link if invoiced
- [ ] Invoice page shows expandable job list
