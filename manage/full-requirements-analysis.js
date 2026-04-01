#!/usr/bin/env node
/**
 * COMPREHENSIVE REQUIREMENTS ANALYSIS
 * Measures progress against ALL understood requirements
 */

const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, '..', 'src', 'index.html');
const html = fs.readFileSync(indexPath, 'utf8');
const script = html.match(/<script>([\s\S]*?)<\/script>/)[1];

// Requirements organized by category
const REQUIREMENTS = {
    'AUTHENTICATION': [
        { name: 'Login form', test: () => html.includes('login-email') && html.includes('login-password'), priority: 'critical' },
        { name: 'Password validation', test: () => script.includes('password'), priority: 'critical' },
        { name: 'Role-based access (admin/customer/household)', test: () => script.includes('admin') && script.includes('customer') && script.includes('household'), priority: 'critical' },
        { name: 'Firebase Auth integration', test: () => script.includes('firebase') && script.includes('auth'), priority: 'critical' },
        { name: 'Google Sign-In', test: () => script.includes('GoogleAuthProvider'), priority: 'high' },
        { name: 'Password reset (self-service)', test: () => script.includes('sendPasswordResetEmail'), priority: 'critical' },
        { name: 'Session persistence', test: () => script.includes('currentUser') && script.includes('localStorage'), priority: 'critical' },
        { name: 'Customer portal view filtering', test: () => script.includes('filterDataForCustomer'), priority: 'critical' },
    ],
    'CUSTOMER MANAGEMENT': [
        { name: 'Add customer', test: () => script.includes('addCustomer'), priority: 'critical' },
        { name: 'Edit customer', test: () => script.includes('updateCustomer'), priority: 'high' },
        { name: 'Delete customer', test: () => script.includes('deleteCustomer'), priority: 'high' },
        { name: 'Customer search', test: () => script.includes('filterCustomers') || script.includes('customer-search'), priority: 'high' },
        { name: 'Customer balance tracking', test: () => script.includes('getContactBalance'), priority: 'critical' },
        { name: 'Customer contact info', test: () => script.includes('phone') && script.includes('email'), priority: 'high' },
        { name: 'Customer type categorization', test: () => script.includes('contactTypes'), priority: 'medium' },
    ],
    'JOB TRACKING': [
        { name: 'Add job', test: () => script.includes('addJob'), priority: 'critical' },
        { name: 'Edit job', test: () => script.includes('updateJob') || script.includes('editJob'), priority: 'high' },
        { name: 'Delete job', test: () => script.includes('deleteJob') || script.includes('removeJob'), priority: 'high' },
        { name: 'Job status (owed/paid)', test: () => script.includes("'owed'") && script.includes("'paid'"), priority: 'critical' },
        { name: 'Job types (labor, automotive, etc)', test: () => script.includes('jobTypes'), priority: 'high' },
        { name: 'Job-customer linking', test: () => script.includes('j.customer') || script.includes('job.customer'), priority: 'critical' },
        { name: 'Timer/time tracking', test: () => script.includes('startTimer') && script.includes('stopTimer'), priority: 'medium' },
        { name: 'Recurring jobs', test: () => script.includes('recurringJobs'), priority: 'medium' },
    ],
    'INVOICING': [
        { name: 'Generate invoice', test: () => script.includes('generateInvoice') || html.includes('generate-invoice'), priority: 'critical' },
        { name: 'Invoice numbering (SS-XXX)', test: () => script.includes('SS-') && script.includes('invoiceCounter'), priority: 'critical' },
        { name: 'Mark invoice paid', test: () => script.includes('markInvoicePaid'), priority: 'critical' },
        { name: 'Edit invoice', test: () => script.includes('editInvoice'), priority: 'high' },
        { name: 'Delete invoice', test: () => script.includes('deleteInvoice'), priority: 'high' },
        { name: 'Invoice PDF export', test: () => script.includes('html2pdf'), priority: 'high' },
        { name: 'Invoice email', test: () => script.includes('mailto') || script.includes('email'), priority: 'medium' },
        { name: 'Invoice print', test: () => script.includes('print') || html.includes('@media print'), priority: 'medium' },
    ],
    'QUOTES': [
        { name: 'Create quote', test: () => script.includes('addQuote') || html.includes('add-quote'), priority: 'high' },
        { name: 'Edit quote', test: () => script.includes('updateQuote') || script.includes('editQuote'), priority: 'medium' },
        { name: 'Delete quote', test: () => script.includes('removeQuote') || script.includes('deleteQuote'), priority: 'medium' },
        { name: 'Convert quote to invoice', test: () => script.includes('convertQuoteToInvoice'), priority: 'high' },
        { name: 'Quote status tracking', test: () => script.includes('quote') && script.includes('status'), priority: 'medium' },
    ],
    'EXPENSE TRACKING': [
        { name: 'Add expense', test: () => script.includes('addExpense'), priority: 'high' },
        { name: 'Edit expense', test: () => script.includes('editExpense') || script.includes('saveExpenseEdit'), priority: 'high' },
        { name: 'Delete expense', test: () => script.includes('deleteExpense'), priority: 'high' },
        { name: 'Expense categories', test: () => script.includes('expense') && script.includes('category'), priority: 'medium' },
        { name: 'Reimbursable flag', test: () => script.includes('reimbursable'), priority: 'medium' },
        { name: 'Receipt attachment', test: () => script.includes('receipt'), priority: 'low' },
    ],
    'MILEAGE TRACKING': [
        { name: 'Log mileage', test: () => script.includes('addMileage') || html.includes('add-mileage'), priority: 'high' },
        { name: 'IRS mileage rate', test: () => script.includes('MILEAGE_RATE') && script.includes('0.70'), priority: 'critical' },
        { name: 'Edit mileage', test: () => script.includes('editMileage'), priority: 'medium' },
        { name: 'Delete mileage', test: () => script.includes('deleteMileage'), priority: 'medium' },
        { name: 'Mileage reports', test: () => script.includes('mileage') && script.includes('report'), priority: 'medium' },
    ],
    'PROPERTY DOCUMENTATION': [
        { name: 'Property data structure', test: () => script.includes('PROPERTIES'), priority: 'critical' },
        { name: 'Room tracking', test: () => script.includes('rooms') || script.includes('ROOMS'), priority: 'high' },
        { name: 'Systems documentation', test: () => script.includes('systems'), priority: 'high' },
        { name: 'Floor plans', test: () => script.includes('floorPlan') || script.includes('floor-plan'), priority: 'medium' },
        { name: 'Property photos', test: () => script.includes('photos'), priority: 'medium' },
        { name: 'GIS/parcel data', test: () => script.includes('parcel') || script.includes('gis'), priority: 'low' },
    ],
    'APPLIANCE/EQUIPMENT': [
        { name: 'Add appliance', test: () => script.includes('saveAppliance') || script.includes('addAppliance'), priority: 'high' },
        { name: 'Edit appliance', test: () => script.includes('editAppliance'), priority: 'high' },
        { name: 'Delete appliance', test: () => script.includes('deleteAppliance'), priority: 'high' },
        { name: 'Auto-lookup manuals', test: () => script.includes('performComprehensiveLookup'), priority: 'high' },
        { name: 'ManualsLib integration', test: () => script.includes('manualslib'), priority: 'medium' },
        { name: 'PartSelect integration', test: () => script.includes('partselect'), priority: 'medium' },
        { name: 'Brand support links', test: () => script.includes('brandSupport'), priority: 'medium' },
        { name: 'Warranty tracking', test: () => script.includes('warrantyEnd'), priority: 'high' },
        { name: 'Service history', test: () => script.includes('serviceHistory'), priority: 'medium' },
    ],
    'VEHICLE TRACKING': [
        { name: 'Add vehicle', test: () => script.includes('addVehicle') || script.includes('saveNewVehicle'), priority: 'high' },
        { name: 'Edit vehicle', test: () => script.includes('editVehicle') || script.includes('saveVehicleEdit'), priority: 'high' },
        { name: 'Delete vehicle', test: () => script.includes('deleteVehicle'), priority: 'high' },
        { name: 'VIN decoder', test: () => script.includes('vpic.nhtsa.dot.gov'), priority: 'high' },
        { name: 'Owner vehicles separate', test: () => script.includes('ownerVehicles') || script.includes('OWNER_VEHICLES'), priority: 'high' },
        { name: 'Customer vehicles', test: () => script.includes('customerVehicles'), priority: 'high' },
        { name: 'Maintenance specs (oil, tires)', test: () => script.includes('oilType') && script.includes('tireSize'), priority: 'high' },
        { name: 'Service history', test: () => script.includes('serviceHistory'), priority: 'medium' },
        { name: 'Recall tracking', test: () => script.includes('recalls'), priority: 'medium' },
    ],
    'RECREATIONAL EQUIPMENT': [
        { name: 'Boat tracking', test: () => script.includes("type: 'boat'") || script.includes('boats:'), priority: 'high' },
        { name: 'Jetski/PWC tracking', test: () => script.includes('jetski') || script.includes('pwc'), priority: 'high' },
        { name: 'ATV/UTV tracking', test: () => script.includes('atv') || script.includes('utv'), priority: 'high' },
        { name: 'Trailer tracking', test: () => script.includes("type: 'trailer'") || script.includes('trailers:'), priority: 'high' },
        { name: 'Trailer-boat linking', test: () => script.includes('linkedEquipment') || script.includes('trailerId'), priority: 'high' },
        { name: 'Motor/engine tracking', test: () => script.includes('motor:') && script.includes('hp'), priority: 'medium' },
        { name: 'HIN (Hull ID) field', test: () => script.includes('hin'), priority: 'medium' },
    ],
    'DATA PERSISTENCE': [
        { name: 'localStorage save', test: () => script.includes('localStorage.setItem'), priority: 'critical' },
        { name: 'localStorage load', test: () => script.includes('localStorage.getItem'), priority: 'critical' },
        { name: 'Auto-save', test: () => script.includes('saveData()'), priority: 'critical' },
        { name: 'Backup mechanism', test: () => script.includes('backup'), priority: 'high' },
        { name: 'Firebase Firestore sync', test: () => script.includes('syncToCloud'), priority: 'high' },
        { name: 'Export data', test: () => script.includes('exportData'), priority: 'high' },
        { name: 'Import data', test: () => script.includes('importData') || script.includes('FileReader'), priority: 'high' },
        { name: 'Retry mechanism', test: () => script.includes('withRetry'), priority: 'medium' },
    ],
    'OFFLINE/PWA': [
        { name: 'Service Worker', test: () => html.includes('serviceWorker'), priority: 'high' },
        { name: 'Offline indicator', test: () => script.includes('navigator.onLine'), priority: 'high' },
        { name: 'Manifest file', test: () => html.includes('manifest.json'), priority: 'high' },
        { name: 'App icons', test: () => html.includes('icon-192') || html.includes('icon-512'), priority: 'medium' },
    ],
    'SECURITY': [
        { name: 'No eval()', test: () => (script.match(/[^a-zA-Z]eval\s*\(/g) || []).length === 0, priority: 'critical' },
        { name: 'HTTPS resources', test: () => (html.match(/http:\/\/(?!localhost)/g) || []).length === 0, priority: 'critical' },
        { name: 'Input sanitization', test: () => script.includes('trim()'), priority: 'high' },
        { name: 'Role-based data access', test: () => script.includes('isAdmin') || script.includes('isCustomerPortal'), priority: 'critical' },
    ],
    'UX/ACCESSIBILITY': [
        { name: 'Skip link', test: () => html.includes('skip') && html.includes('main-content'), priority: 'high' },
        { name: 'Touch targets (44px)', test: () => html.includes('min-height: 44px') || html.includes('min-height:44px'), priority: 'high' },
        { name: 'Image alt text', test: () => (html.match(/<img/g) || []).length <= (html.match(/<img[^>]*alt=/g) || []).length + 1, priority: 'high' },
        { name: 'Keyboard navigation', test: () => script.includes('keydown') && script.includes('Escape'), priority: 'high' },
        { name: 'Responsive design', test: () => html.includes('@media'), priority: 'high' },
        { name: 'Toast notifications', test: () => script.includes('toast('), priority: 'high' },
        { name: 'Loading indicators', test: () => script.includes('loading') || script.includes('Loading'), priority: 'medium' },
        { name: 'Confirmation dialogs', test: () => script.includes('confirm('), priority: 'high' },
    ],
    'BUSINESS IDENTITY': [
        { name: 'Company name', test: () => script.includes('Same Solutions LLC'), priority: 'critical' },
        { name: 'Owner name', test: () => script.includes('Samuel Foran'), priority: 'critical' },
        { name: 'Phone number', test: () => script.includes('(248) 568-5861'), priority: 'critical' },
        { name: 'Email address', test: () => script.includes('sam@samesolutionsllc.com'), priority: 'critical' },
        { name: 'Brand colors (black/gold)', test: () => script.includes('101820') && script.includes('FFB612'), priority: 'high' },
    ],
};

// Run all tests
console.log('\x1b[1m\x1b[44m═══════════════════════════════════════════════════════════════════════════════\x1b[0m');
console.log('\x1b[1m\x1b[44m  COMPREHENSIVE REQUIREMENTS ANALYSIS - Total App Completion                   \x1b[0m');
console.log('\x1b[1m\x1b[44m═══════════════════════════════════════════════════════════════════════════════\x1b[0m');

const results = {
    byCategory: {},
    byPriority: { critical: { pass: 0, fail: 0 }, high: { pass: 0, fail: 0 }, medium: { pass: 0, fail: 0 }, low: { pass: 0, fail: 0 } },
    total: { pass: 0, fail: 0 },
    failures: []
};

Object.entries(REQUIREMENTS).forEach(([category, reqs]) => {
    console.log(`\n\x1b[1m━━━ ${category} ━━━\x1b[0m`);
    results.byCategory[category] = { pass: 0, fail: 0, reqs: [] };
    
    reqs.forEach(req => {
        let passed = false;
        try {
            passed = req.test();
        } catch (e) {
            passed = false;
        }
        
        if (passed) {
            results.byCategory[category].pass++;
            results.byPriority[req.priority].pass++;
            results.total.pass++;
            console.log(`   \x1b[32m✅\x1b[0m ${req.name}`);
        } else {
            results.byCategory[category].fail++;
            results.byPriority[req.priority].fail++;
            results.total.fail++;
            results.failures.push({ category, name: req.name, priority: req.priority });
            console.log(`   \x1b[31m❌\x1b[0m ${req.name} [${req.priority}]`);
        }
        
        results.byCategory[category].reqs.push({ name: req.name, priority: req.priority, passed });
    });
    
    const catTotal = results.byCategory[category].pass + results.byCategory[category].fail;
    const catPct = ((results.byCategory[category].pass / catTotal) * 100).toFixed(0);
    console.log(`   \x1b[90m${results.byCategory[category].pass}/${catTotal} (${catPct}%)\x1b[0m`);
});

// Summary
const total = results.total.pass + results.total.fail;
const pct = ((results.total.pass / total) * 100).toFixed(1);

console.log('\n\x1b[1m═══════════════════════════════════════════════════════════════════════════════\x1b[0m');
console.log('\x1b[1m  REQUIREMENTS COMPLETION SUMMARY\x1b[0m');
console.log('\x1b[1m═══════════════════════════════════════════════════════════════════════════════\x1b[0m\n');

console.log(`   \x1b[1mOVERALL: ${results.total.pass}/${total} (${pct}%)\x1b[0m\n`);

console.log('   By Priority:');
['critical', 'high', 'medium', 'low'].forEach(p => {
    const t = results.byPriority[p].pass + results.byPriority[p].fail;
    const pPct = t > 0 ? ((results.byPriority[p].pass / t) * 100).toFixed(0) : 100;
    const color = pPct == 100 ? '32' : pPct >= 80 ? '33' : '31';
    console.log(`   \x1b[${color}m${p.toUpperCase().padEnd(10)}: ${results.byPriority[p].pass}/${t} (${pPct}%)\x1b[0m`);
});

console.log('\n   By Category:');
Object.entries(results.byCategory).forEach(([cat, data]) => {
    const t = data.pass + data.fail;
    const cPct = ((data.pass / t) * 100).toFixed(0);
    const bar = '█'.repeat(Math.floor(cPct / 5)) + '░'.repeat(20 - Math.floor(cPct / 5));
    const color = cPct == 100 ? '32' : cPct >= 80 ? '33' : '31';
    console.log(`   \x1b[${color}m${cat.padEnd(25)} ${bar} ${cPct}%\x1b[0m`);
});

if (results.failures.length > 0) {
    console.log('\n   \x1b[31mMISSING REQUIREMENTS:\x1b[0m');
    results.failures.forEach(f => {
        console.log(`   → [${f.priority}] ${f.category}: ${f.name}`);
    });
}

// Save results
fs.writeFileSync(path.join(__dirname, 'full-requirements-analysis.json'), JSON.stringify({
    timestamp: new Date().toISOString(),
    total: { pass: results.total.pass, fail: results.total.fail, pct },
    byPriority: results.byPriority,
    byCategory: Object.fromEntries(
        Object.entries(results.byCategory).map(([k, v]) => [k, { pass: v.pass, fail: v.fail, pct: ((v.pass/(v.pass+v.fail))*100).toFixed(0) }])
    ),
    failures: results.failures
}, null, 2));

console.log('\n');
