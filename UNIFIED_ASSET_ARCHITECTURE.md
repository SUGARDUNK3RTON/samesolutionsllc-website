# Unified Asset Architecture
## Same Solutions PWA - Equipment & Asset Management

---

## 🎯 Problem Statement

Currently we have:
- Vehicles (cars, trucks) - separate structure
- Boats - separate structure  
- Properties - with nested appliances
- No unified way to handle: jetskis, ATVs, trailers, motors, appliances

Each has different fields, different save functions, different storage locations.

---

## 🏗️ Proposed Solution: Universal Asset System

### Core Principle
**Every piece of equipment is an "Asset" with:**
1. Common base fields (id, name, owner, created, notes)
2. Type-specific fields (VIN for vehicles, HIN for boats, etc.)
3. Sub-components (engine, motor, ECU, filters, etc.)
4. Documentation links (manuals, parts finders, product pages)
5. Service history

### Asset Types
```
ASSET_TYPES = {
  vehicle: { label: 'Vehicle', icon: '🚗', idPrefix: 'VEH' },
  boat: { label: 'Boat', icon: '🚤', idPrefix: 'BOAT' },
  pwc: { label: 'PWC/Jetski', icon: '🚀', idPrefix: 'PWC' },
  atv: { label: 'ATV/UTV', icon: '🏍️', idPrefix: 'ATV' },
  trailer: { label: 'Trailer', icon: '🚛', idPrefix: 'TRL' },
  appliance: { label: 'Appliance', icon: '🔌', idPrefix: 'APL' },
  hvac: { label: 'HVAC System', icon: '❄️', idPrefix: 'HVAC' },
  tool: { label: 'Tool/Equipment', icon: '🔧', idPrefix: 'TOOL' },
  motor: { label: 'Motor/Engine', icon: '⚙️', idPrefix: 'MTR' }
}
```

---

## 📐 Universal Asset Schema

```javascript
const asset = {
  // === CORE (all assets) ===
  id: 'VEH-1234567890',      // Auto-generated
  type: 'vehicle',           // From ASSET_TYPES
  name: '2014 Cadillac CTS', // Display name (auto or manual)
  owner: 'sam-home',         // Customer/property ID
  parentAsset: null,         // e.g., Motor belongs to Boat
  created: '2026-03-09',
  updated: '2026-03-09',
  
  // === IDENTIFICATION (varies by type) ===
  identifiers: {
    vin: '1G6...',           // Vehicles
    hin: 'ABC12345...',      // Boats
    serial: 'SN123456',      // Appliances, motors
    model: 'CTS Vsport',
    plate: 'SAME7',
    registration: 'MC 1234 AB'
  },
  
  // === SPECIFICATIONS ===
  specs: {
    year: 2014,
    make: 'Cadillac',
    model: 'CTS',
    trim: 'Vsport Premium',
    // Type-specific:
    engine: '3.6L V6 Twin-Turbo (LF3)',
    horsepower: 420,
    length: null,            // Boats
    capacity: null,          // PWC/Boats
    weight: null,
    fuelType: 'Premium 91+',
    // Custom fields
    custom: {}
  },
  
  // === MAINTENANCE INFO ===
  maintenance: {
    oilType: '5W-30 Full Synthetic',
    oilCapacity: '6 qt',
    oilFilter: 'AC Delco PF63',
    airFilter: null,
    sparkPlugs: null,
    beltSize: null,
    // Service intervals
    oilChangeInterval: 5000,
    lastOilChange: { date: '2026-01-15', mileage: 85000 },
    nextService: { type: 'Oil Change', due: '2026-06-15' }
  },
  
  // === DOCUMENTATION LINKS ===
  docs: {
    manualUrl: 'https://www.manualslib.com/...',
    partsFinderUrl: 'https://www.autozone.com/...',
    productPageUrl: 'https://www.cadillac.com/...',
    warrantyUrl: null,
    purchaseReceipt: null,   // Could be file reference
    customLinks: [
      { label: 'Forum', url: 'https://...' },
      { label: 'TSBs', url: 'https://...' }
    ]
  },
  
  // === COMPONENTS (sub-assets) ===
  components: [
    {
      id: 'MTR-123',
      type: 'motor',
      name: 'LF3 Twin-Turbo V6',
      specs: { displacement: '3.6L', hp: 420 },
      maintenance: { oilType: '5W-30' },
      docs: { manualUrl: '...' }
    }
  ],
  
  // === STATUS & HISTORY ===
  status: 'active',          // active, stored, sold, scrapped
  condition: 'good',         // excellent, good, fair, poor
  knownIssues: 'Needs tires + alignment',
  mileage: 92000,            // Or hours for equipment
  location: 'Garage Bay 1',
  
  serviceHistory: [
    {
      id: 'SVC-123',
      date: '2026-03-02',
      type: 'Oil Change',
      description: 'Full synthetic oil change',
      mileage: 90000,
      cost: 75,
      parts: ['Mobil 1 5W-30', 'AC Delco PF63'],
      performedBy: 'self',
      notes: 'Next due at 95,000 mi',
      invoiceId: null
    }
  ],
  
  // === PHOTOS ===
  photos: [],
  
  // === NOTES ===
  notes: 'Primary daily driver'
};
```

---

## 🔗 Relationships

```
Property: sam-home
├── Vehicle: 2014 Cadillac CTS (OV-001)
│   └── Component: LF3 Engine
│       └── Component: Oil Filter
├── Vehicle: 2020 Silverado (OV-002)
├── Boat: Harris FloteBote (BOAT-SAM-001)
│   └── Component: Johnson 50HP Motor (MOTOR-SAM-001)
│       └── Component: Spark Plugs
│       └── Component: Water Pump
├── PWC: Jetski (PWC-SAM-001)
│   └── Component: Engine
│   └── Component: Oil Reservoir
│   └── Component: ECU
├── Trailer: Boat Trailer (TRL-SAM-001)
│   └── Component: Tires
│   └── Component: Bearings
├── Appliance: Refrigerator
│   └── Component: Water Filter
├── HVAC: Furnace
│   └── Component: Air Filter
```

---

## 🎮 UI: Universal Add Asset Form

```
┌─────────────────────────────────────────────────────────┐
│ ➕ Add Equipment / Asset                                │
├─────────────────────────────────────────────────────────┤
│ Type: [🚗 Vehicle ▼]                                    │
│                                                         │
│ ─── BASIC INFO ───                                      │
│ Year: [2014]  Make: [Cadillac]  Model: [CTS]           │
│                                                         │
│ ─── IDENTIFICATION ───                                  │
│ VIN: [1G6...]  Plate: [SAME7]  State: [MI]             │
│                                                         │
│ ─── OWNER/LOCATION ───                                  │
│ Owner: [sam-home ▼]  Location: [Garage Bay 1]          │
│                                                         │
│ ─── DOCUMENTATION (optional) ───                        │
│ Manual URL:    [https://...]  [🔍 Search ManualsLib]   │
│ Parts Finder:  [https://...]  [🔍 Search AutoZone]     │
│ Product Page:  [https://...]                           │
│                                                         │
│ ─── MAINTENANCE (optional) ───                          │
│ Oil Type: [5W-30]  Capacity: [6 qt]  Filter: [PF63]   │
│                                                         │
│ ─── NOTES ───                                           │
│ [                                                     ] │
│                                                         │
│ [Cancel]                              [💾 Save Asset]   │
└─────────────────────────────────────────────────────────┘
```

---

## 📋 Type-Specific Fields

### Vehicle
- VIN, Plate, State
- Engine, Transmission
- Mileage, Fuel Type

### Boat  
- HIN, MC#/Registration
- Length, Beam, Draft
- Capacity, Propulsion Type

### PWC/Jetski
- HIN, Registration
- Engine CC, 2-stroke/4-stroke
- Oil Reservoir capacity

### ATV/UTV
- VIN, Plate (if road legal)
- Engine CC, 2WD/4WD
- Tire size

### Trailer
- VIN, Plate
- GVWR, Length, Width
- Tire size, Bearing type

### Appliance
- Serial, Model
- Purchase date, Warranty expiration
- Filter type/size

### Motor/Engine (sub-component)
- Serial, Model
- Horsepower, Displacement
- Fuel type, Oil type

---

## 🏠 Sam's Home Example (Current Data)

```javascript
// Current structure we should transform:
samHome.ownerVehicles = {
  'OV-001': { /* Cadillac CTS */ },
  'OV-002': { /* Silverado */ },
  'OV-003': { /* 1946 Chevy Pickup */ }
};

// Boats/Marine (needs to be added):
samHome.boats = {
  'BOAT-SAM-001': {
    type: 'boat',
    name: '20ft Harris FloteBote',
    specs: { year: null, make: 'Harris', model: 'FloteBote', length: 20 },
    identifiers: { hin: null, registration: null }, // NEEDS: HIN, MC#
    components: [
      {
        id: 'MOTOR-SAM-001',
        type: 'motor',
        name: '2000 Johnson 50HP',
        specs: { year: 2000, make: 'Johnson', model: 'J50VLSIB', hp: 50, stroke: '2-stroke' },
        identifiers: { serial: 'G 0494714' },
        maintenance: {
          oilType: 'TC-W3 2-stroke',
          sparkPlugs: 'NGK QL78YC',
          sparkGap: '0.030"'
        },
        docs: {
          manualUrl: 'https://www.manualslib.com/products/Johnson-J50plsib-11469271.html'
        }
      }
    ],
    docs: {
      manualUrl: null,  // NEEDS
      partsFinderUrl: null
    }
  }
};

// PWC (needs to be added):
samHome.pwc = {
  'PWC-SAM-001': {
    type: 'pwc',
    name: 'Jetski', // NEEDS: make/model/year
    specs: {},      // NEEDS: all specs
    components: [
      { type: 'motor', name: 'Engine' },
      { type: 'component', name: 'Oil Reservoir' },
      { type: 'component', name: 'ECU' }
    ]
  }
};

// Trailers (needs to be added):
samHome.trailers = {
  'TRL-SAM-001': {
    type: 'trailer',
    name: 'Boat Trailer',
    identifiers: { plate: null }, // NEEDS
    components: [
      { type: 'component', name: 'Tires' },
      { type: 'component', name: 'Bearings' }
    ]
  },
  'TRL-SAM-002': {
    type: 'trailer',
    name: 'PWC Trailer',
    identifiers: { plate: null } // NEEDS
  }
};

// Appliances (NEEDS: links to manuals/product pages)
samHome.rooms.kitchen.appliances = [
  {
    id: 'APL-001',
    type: 'appliance',
    name: 'Electric Range',
    identifiers: { make: null, model: null, serial: null }, // NEEDS
    docs: {
      manualUrl: null,      // NEEDS
      partsFinderUrl: null, // NEEDS
      productPageUrl: null  // NEEDS
    }
  }
];
```

---

## ✅ Benefits of This Approach

1. **Single save function** - `saveAsset(asset)` works for all types
2. **Single edit function** - `editAsset(assetId)` 
3. **Single detail view** - `showAssetDetail(assetId)`
4. **Consistent documentation** - Every asset can have manuals/parts links
5. **Hierarchical components** - Motor belongs to boat, filter belongs to motor
6. **Easy to extend** - Add new type = add to ASSET_TYPES, done
7. **Searchable** - One search function for all equipment
8. **Consistent service history** - Same format for all types

---

## 🚀 Implementation Plan

### Phase 1: Create Unified Schema
- [ ] Define ASSET_TYPES constant
- [ ] Create universal asset schema
- [ ] Create migration function for existing data

### Phase 2: Universal Functions
- [ ] `addAsset(type)` - Universal add form
- [ ] `saveAsset(asset)` - Universal save
- [ ] `editAsset(assetId)` - Universal edit
- [ ] `showAssetDetail(assetId)` - Universal detail view
- [ ] `addComponent(parentAssetId)` - Add sub-component
- [ ] `addDocLink(assetId, linkType)` - Add documentation

### Phase 3: UI Integration
- [ ] Update Knowledge Base to use unified assets
- [ ] Add "Documentation" tab to asset details
- [ ] Add "Components" tree view
- [ ] Add quick-add for common items

### Phase 4: Data Entry
- [ ] Document Sam's vehicles with full specs
- [ ] Add boat with motor components
- [ ] Add jetski with components
- [ ] Add trailers
- [ ] Add appliances with manual links
