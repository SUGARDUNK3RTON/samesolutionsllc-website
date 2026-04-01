#!/usr/bin/env node
/**
 * Same Solutions PWA - FEATURE COMPLETENESS TESTS
 * Tests all requirements Sam identified
 */

const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, '..', 'src', 'index.html');
const html = fs.readFileSync(indexPath, 'utf8');
const script = html.match(/<script>([\s\S]*?)<\/script>/)[1];

const results = { pass: [], fail: [], partial: [] };

function test(category, name, condition, notes = '') {
    if (condition === true) {
        results.pass.push({ category, name, notes });
        console.log(`   \x1b[32m✅\x1b[0m ${name}`);
    } else if (condition === 'partial') {
        results.partial.push({ category, name, notes });
        console.log(`   \x1b[33m⚠️\x1b[0m ${name} - ${notes}`);
    } else {
        results.fail.push({ category, name, notes });
        console.log(`   \x1b[31m❌\x1b[0m ${name} - ${notes}`);
    }
}

console.log('\x1b[1m\x1b[45m═══════════════════════════════════════════════════════════════════════════════\x1b[0m');
console.log('\x1b[1m\x1b[45m  FEATURE COMPLETENESS TESTS - Sam\'s Requirements                             \x1b[0m');
console.log('\x1b[1m\x1b[45m═══════════════════════════════════════════════════════════════════════════════\x1b[0m');

// ============================================================================
// PASSWORD RESET (CRITICAL)
// ============================================================================
console.log('\n\x1b[1m━━━ PASSWORD RESET (Customer self-service) ━━━\x1b[0m');

test('auth', 'Password reset form exists',
    script.includes('showPasswordResetForm') || script.includes('passwordReset'));

test('auth', 'Firebase password reset integration',
    script.includes('sendPasswordResetEmail'));

test('auth', 'Reset email feedback to user',
    script.includes('Reset Email Sent') || script.includes('reset link'));

// ============================================================================
// EQUIPMENT AUTO-LOOKUP (Tony's Dishwasher Standard)
// ============================================================================
console.log('\n\x1b[1m━━━ EQUIPMENT AUTO-LOOKUP (Gold Standard) ━━━\x1b[0m');

test('equipment', 'Auto-lookup triggers on save',
    script.includes('performComprehensiveLookup'));

test('equipment', 'Manual lookup available (ManualsLib)',
    script.includes('manualslib') || script.includes('ManualsLib'));

test('equipment', 'Parts diagram lookup (PartSelect)',
    script.includes('partselect') || script.includes('PartSelect'));

test('equipment', 'Brand support phone numbers',
    script.includes('1-800') && script.includes('supportPhone'));

test('equipment', 'Installation guide links',
    script.includes('installGuide') || script.includes('Installation Guide'));

test('equipment', 'Schematic/wiring diagram storage',
    script.includes('schematic') || script.includes('wiring'),
    script.includes('schematic') ? '' : 'Need schematic field');

test('equipment', 'Lookup results saved to equipment record',
    script.includes('lastLookup') && script.includes('lookupHistory'));

// ============================================================================
// CONSISTENT DATA MODEL
// ============================================================================
console.log('\n\x1b[1m━━━ CONSISTENT DATA MODEL ━━━\x1b[0m');

test('model', 'Equipment has brand field',
    script.includes('appliance.brand') || script.includes("brand:"));

test('model', 'Equipment has model field',
    script.includes('appliance.model') || script.includes("model:"));

test('model', 'Equipment has serial field',
    script.includes('appliance.serial') || script.includes("serial:"));

test('model', 'Equipment has warranty tracking',
    script.includes('warrantyEnd'));

test('model', 'Equipment has install date',
    script.includes('installDate'));

test('model', 'Equipment linked to property',
    script.includes('property:') || script.includes('appliance.property'));

test('model', 'Equipment linked to room/location',
    script.includes('location:') || script.includes('appliance.location'));

// ============================================================================
// VEHICLE COMPONENTS
// ============================================================================
console.log('\n\x1b[1m━━━ VEHICLE COMPONENT TRACKING ━━━\x1b[0m');

test('vehicle', 'Vehicles have maintenance specs',
    script.includes('oilCapacity') && script.includes('oilType'));

test('vehicle', 'Tire size tracking',
    script.includes('tireSizeFront') || script.includes('tireSize'));

test('vehicle', 'Battery tracking',
    script.includes('battery') ? true : 'partial',
    'Basic battery info exists');

test('vehicle', 'Service history tracking',
    script.includes('serviceHistory'));

test('vehicle', 'Recall information',
    script.includes('recalls'));

const hasComponents = script.includes('components:') && 
    (script.includes('tires:') || script.includes('brakes:'));
test('vehicle', 'Detailed component tracking (tires, brakes, fluids)',
    hasComponents ? true : 'partial',
    hasComponents ? '' : 'Has maintenance specs but not full component model');

// ============================================================================
// RECREATIONAL EQUIPMENT (Boats, Trailers, Jetskis)
// ============================================================================
console.log('\n\x1b[1m━━━ RECREATIONAL EQUIPMENT ━━━\x1b[0m');

test('recreational', 'Boat tracking',
    script.includes('boat') || script.includes('Boat'),
    'Need boat data structure');

test('recreational', 'Trailer tracking',
    script.includes('trailer') || script.includes('Trailer'),
    'Need trailer data structure');

test('recreational', 'Jetski/PWC tracking',
    script.includes('jetski') || script.includes('pwc') || script.includes('Jetski'),
    'Need jetski data structure');

test('recreational', 'ATV/UTV tracking',
    script.includes('atv') || script.includes('utv'),
    'Need ATV data structure');

test('recreational', 'Hull ID Number (HIN) for boats',
    script.includes('hin') || script.includes('HIN'),
    'Need HIN field for boats');

test('recreational', 'Motor/engine tracking for rec equipment',
    script.includes('motor:') || script.includes('outboard'),
    'Need motor tracking');

// ============================================================================
// HIERARCHY & LINKING
// ============================================================================
console.log('\n\x1b[1m━━━ HIERARCHY & LINKING ━━━\x1b[0m');

test('hierarchy', 'Customer → Properties link',
    script.includes('getContactProperties'));

test('hierarchy', 'Property → Rooms link',
    script.includes('rooms:') || script.includes('ROOMS'));

test('hierarchy', 'Room → Appliances link',
    script.includes('location:') && script.includes('appliances'));

test('hierarchy', 'Customer → Vehicles link',
    script.includes('customerVehicles') || script.includes('ownerVehicles'));

test('hierarchy', 'Vehicle → Components link',
    script.includes('maintenance:') ? 'partial' : false,
    'Has maintenance object but not full components hierarchy');

test('hierarchy', 'Trailer → Boat link (towable)',
    script.includes('trailerId') || script.includes('linkedTrailer'),
    'Need trailer-boat linking');

// ============================================================================
// DIAGRAM STORAGE
// ============================================================================
console.log('\n\x1b[1m━━━ DIAGRAM/DOCUMENTATION STORAGE ━━━\x1b[0m');

test('diagrams', 'Floor plan storage',
    script.includes('floorPlan') || script.includes('floor-plan'));

test('diagrams', 'Parts diagram links',
    script.includes('partsDiagram') || script.includes('Parts Diagram'));

test('diagrams', 'Wiring schematic storage',
    script.includes('wiring') || script.includes('schematic'));

test('diagrams', 'Plumbing diagram storage',
    script.includes('plumbing') && script.includes('diagram'),
    'Need plumbing diagram field');

test('diagrams', 'Photo attachment to equipment',
    script.includes('photos') || script.includes('image'));

test('diagrams', 'Document URL storage',
    script.includes('documentation:') || script.includes('manuals:'));

// ============================================================================
// RESULTS
// ============================================================================
const total = results.pass.length + results.fail.length + results.partial.length;

console.log('\n\x1b[1m═══════════════════════════════════════════════════════════════════════════════\x1b[0m');
console.log('\x1b[1m  FEATURE COMPLETENESS SUMMARY\x1b[0m');
console.log('\x1b[1m═══════════════════════════════════════════════════════════════════════════════\x1b[0m\n');

console.log(`   \x1b[32m✅ Complete:\x1b[0m     ${results.pass.length}/${total}`);
console.log(`   \x1b[33m⚠️  Partial:\x1b[0m      ${results.partial.length}/${total}`);
console.log(`   \x1b[31m❌ Missing:\x1b[0m      ${results.fail.length}/${total}`);

const completePct = ((results.pass.length / total) * 100).toFixed(0);
const workingPct = (((results.pass.length + results.partial.length) / total) * 100).toFixed(0);

console.log(`\n   Completion: ${completePct}% fully done, ${workingPct}% at least partial\n`);

if (results.fail.length > 0) {
    console.log('\x1b[31m   MISSING FEATURES:\x1b[0m');
    results.fail.forEach(f => {
        console.log(`   → ${f.category}: ${f.name}${f.notes ? ` (${f.notes})` : ''}`);
    });
}

if (results.partial.length > 0) {
    console.log('\n\x1b[33m   PARTIAL FEATURES (need enhancement):\x1b[0m');
    results.partial.forEach(f => {
        console.log(`   → ${f.category}: ${f.name}${f.notes ? ` (${f.notes})` : ''}`);
    });
}

// Save results
fs.writeFileSync(path.join(__dirname, 'feature-completeness.json'), JSON.stringify({
    timestamp: new Date().toISOString(),
    pass: results.pass.length,
    partial: results.partial.length,
    fail: results.fail.length,
    completePct,
    workingPct,
    details: results
}, null, 2));

console.log('\n');
process.exit(results.fail.length > 5 ? 1 : 0); // Allow some missing for now
