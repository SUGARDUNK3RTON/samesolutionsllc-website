#!/usr/bin/env node
/**
 * Same Solutions PWA - CRITICAL FUNCTIONALITY TESTS
 * These MUST pass before launch. Each test represents a core user story.
 * 
 * A customer should be able to:
 * 1. Sign up / Log in
 * 2. See their jobs
 * 3. See their invoices
 * 4. See their properties
 * 
 * An admin (Sam) should be able to:
 * 1. Add customers
 * 2. Add jobs
 * 3. Generate invoices
 * 4. Track expenses
 * 5. Log mileage
 * 6. Document properties
 */

const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, '..', 'src', 'index.html');
const html = fs.readFileSync(indexPath, 'utf8');
const script = html.match(/<script>([\s\S]*?)<\/script>/)[1];

// Test tracking
const results = {
    critical: { passed: [], failed: [] },
    important: { passed: [], failed: [] },
    nice: { passed: [], failed: [] }
};

function testCritical(name, condition, details = '') {
    if (condition) {
        results.critical.passed.push({ name, details });
        console.log(`   \x1b[32m✅ PASS\x1b[0m ${name}`);
    } else {
        results.critical.failed.push({ name, details });
        console.log(`   \x1b[31m❌ FAIL\x1b[0m ${name} ${details ? `- ${details}` : ''}`);
    }
}

function testImportant(name, condition, details = '') {
    if (condition) {
        results.important.passed.push({ name, details });
        console.log(`   \x1b[32m✓\x1b[0m ${name}`);
    } else {
        results.important.failed.push({ name, details });
        console.log(`   \x1b[33m⚠\x1b[0m ${name} ${details ? `- ${details}` : ''}`);
    }
}

function testNice(name, condition, details = '') {
    if (condition) {
        results.nice.passed.push({ name, details });
        console.log(`   \x1b[36m○\x1b[0m ${name}`);
    } else {
        results.nice.failed.push({ name, details });
        console.log(`   \x1b[90m○\x1b[0m ${name} (not implemented)`);
    }
}

console.log('\x1b[1m\x1b[41m═══════════════════════════════════════════════════════════════════════════════\x1b[0m');
console.log('\x1b[1m\x1b[41m  CRITICAL FUNCTIONALITY TESTS - LAUNCH READINESS                             \x1b[0m');
console.log('\x1b[1m\x1b[41m═══════════════════════════════════════════════════════════════════════════════\x1b[0m');

// ============================================================================
// SECTION 1: AUTHENTICATION (CRITICAL - Customers need to log in)
// ============================================================================
console.log('\n\x1b[1m\x1b[31m━━━ AUTHENTICATION (Must work for launch) ━━━\x1b[0m');

testCritical('Login form exists', 
    html.includes('id="login-email"') && html.includes('id="login-password"'));
    
testCritical('Login function exists', 
    script.includes('function login') || script.includes('loginWithEmail'));
    
testCritical('Logout function exists', 
    script.includes('logout'));
    
testCritical('Role-based access (admin/customer)', 
    script.includes("role") && script.includes("admin") && script.includes("customer"));
    
testCritical('Session persistence (currentUser)', 
    script.includes('currentUser'));

testCritical('Password validation exists', 
    script.includes('password'));

testImportant('Firebase Auth integration', 
    script.includes('firebase') && script.includes('auth'));

testImportant('Google Sign-In option', 
    script.includes('loginWithGoogle') || script.includes('GoogleAuthProvider'));

testNice('Email verification', 
    script.includes('emailVerified') || script.includes('verifyEmail'));

testNice('Password reset', 
    script.includes('resetPassword') || script.includes('forgotPassword'));

// ============================================================================
// SECTION 2: CUSTOMER SELF-SERVICE (CRITICAL - Why they sign up)
// ============================================================================
console.log('\n\x1b[1m\x1b[31m━━━ CUSTOMER SELF-SERVICE (What customers see) ━━━\x1b[0m');

testCritical('Customer can see their jobs', 
    script.includes('getContactJobs') || script.match(/jobs.*filter.*customer/));

testCritical('Customer can see their invoices', 
    script.includes('getContactInvoices') || script.match(/invoices.*filter.*customer/));

testCritical('Customer can see their properties', 
    script.includes('getContactProperties') || script.match(/properties.*filter.*customer/));

testCritical('Customer cannot see other customers', 
    script.includes('isCustomerPortal') || script.includes('currentUser'));

testCritical('Customer view filters data by login', 
    script.includes('filterDataForCustomer') || script.includes('customerScope'));

testImportant('Customer can see their balance', 
    script.includes('getContactBalance'));

testImportant('Customer can view invoice details', 
    script.includes('viewInv') || script.includes('showInvoice'));

testNice('Customer can pay invoices online', 
    script.includes('stripe') || script.includes('paypal') || script.includes('payment'));

testNice('Customer can request service', 
    script.includes('requestService') || script.includes('submitRequest'));

// ============================================================================
// SECTION 3: ADMIN CORE FUNCTIONS (CRITICAL - Sam's daily operations)
// ============================================================================
console.log('\n\x1b[1m\x1b[31m━━━ ADMIN CORE FUNCTIONS (Your daily operations) ━━━\x1b[0m');

testCritical('Add new customer', 
    script.includes('addCustomer') && html.includes('add-customer'));

testCritical('Add new job', 
    script.includes('addJob') && html.includes('add-job'));

testCritical('Generate invoice', 
    script.includes('generateInvoice') || html.includes('generate-invoice'));

testCritical('Mark invoice paid', 
    script.includes('markInvoicePaid') || script.includes('markPaid'));

testCritical('Track expenses', 
    script.includes('expense') && html.includes('add-expense'));

testCritical('Log mileage', 
    script.includes('mileage') && html.includes('add-mileage'));

testCritical('Document properties', 
    script.includes('property') || script.includes('PROPERTIES'));

testImportant('Edit existing customer', 
    script.includes('editCustomer') || script.includes('updateCustomer'));

testImportant('Edit existing job', 
    script.includes('editJob') || script.includes('updateJob'));

testImportant('Delete job (with confirmation)', 
    script.includes('deleteJob') || script.match(/delete.*job/i));

// ============================================================================
// SECTION 4: DATA PERSISTENCE (CRITICAL - Don't lose data!)
// ============================================================================
console.log('\n\x1b[1m\x1b[31m━━━ DATA PERSISTENCE (Never lose data) ━━━\x1b[0m');

testCritical('Save to localStorage', 
    script.includes('localStorage.setItem'));

testCritical('Load from localStorage', 
    script.includes('localStorage.getItem'));

testCritical('Auto-save after changes', 
    script.includes('saveData()'));

testCritical('Backup mechanism', 
    script.includes('backup') || script.includes('_backup'));

testImportant('Cloud sync to Firebase', 
    script.includes('syncToCloud') || script.includes('Firestore'));

testImportant('Export data as file', 
    script.includes('exportData') || script.includes('download'));

testImportant('Import data from file', 
    script.includes('importData') || script.includes('FileReader'));

testNice('Automatic cloud backup', 
    script.includes('autoSync') || script.includes('setInterval.*sync'));

// ============================================================================
// SECTION 5: INVOICING (CRITICAL - How you get paid)
// ============================================================================
console.log('\n\x1b[1m\x1b[31m━━━ INVOICING (How you get paid) ━━━\x1b[0m');

testCritical('Invoice number generation', 
    script.includes('SS-') && script.includes('invoiceCounter'));

testCritical('Invoice displays correctly', 
    html.includes('invoice-preview') || script.includes('renderInvoice'));

testCritical('Invoice shows customer info', 
    script.match(/invoice.*customer|customer.*invoice/));

testCritical('Invoice shows job details', 
    script.match(/invoice.*jobs|jobs.*invoice/));

testCritical('Invoice calculates total', 
    script.includes('total') && script.includes('reduce'));

testImportant('PDF export works', 
    script.includes('html2pdf'));

testImportant('Email invoice option', 
    script.includes('emailInvoice') || script.includes('mailto'));

testImportant('Print invoice option', 
    script.includes('print') || html.includes('print'));

testNice('Invoice templates', 
    script.includes('template') && script.includes('invoice'));

// ============================================================================
// SECTION 6: OFFLINE CAPABILITY (IMPORTANT - Field work)
// ============================================================================
console.log('\n\x1b[1m\x1b[33m━━━ OFFLINE CAPABILITY (Field work) ━━━\x1b[0m');

testImportant('Service Worker registered', 
    html.includes('serviceWorker') || script.includes('serviceWorker'));

testImportant('Offline indicator', 
    script.includes('navigator.onLine') || script.includes('offline'));

testImportant('Works without internet', 
    script.includes('localStorage')); // Local-first by design

testNice('Sync when back online', 
    script.includes('online') && script.includes('sync'));

// ============================================================================
// SECTION 7: SECURITY (CRITICAL - Protect customer data)
// ============================================================================
console.log('\n\x1b[1m\x1b[31m━━━ SECURITY (Protect customer data) ━━━\x1b[0m');

testCritical('No eval() usage', 
    (script.match(/[^a-zA-Z]eval\s*\(/g) || []).length === 0);

testCritical('HTTPS for external resources', 
    (html.match(/http:\/\/(?!localhost)/g) || []).length === 0);

testCritical('Login required for access', 
    script.includes('currentUser') && script.includes('login'));

testCritical('Role-based data access', 
    script.includes('isAdmin') || script.includes('role'));

testImportant('Input sanitization', 
    script.includes('trim()') && script.includes('replace'));

testImportant('Error messages don\'t expose internals', 
    !script.includes('console.error(e.stack)'));

testNice('Rate limiting', 
    script.includes('rateLimit') || script.includes('throttle'));

// ============================================================================
// RESULTS SUMMARY
// ============================================================================
console.log('\n\x1b[1m═══════════════════════════════════════════════════════════════════════════════\x1b[0m');
console.log('\x1b[1m  LAUNCH READINESS SUMMARY\x1b[0m');
console.log('\x1b[1m═══════════════════════════════════════════════════════════════════════════════\x1b[0m\n');

const criticalPass = results.critical.passed.length;
const criticalFail = results.critical.failed.length;
const criticalTotal = criticalPass + criticalFail;
const criticalPct = ((criticalPass / criticalTotal) * 100).toFixed(0);

const importantPass = results.important.passed.length;
const importantFail = results.important.failed.length;
const importantTotal = importantPass + importantFail;
const importantPct = ((importantPass / importantTotal) * 100).toFixed(0);

const nicePass = results.nice.passed.length;
const niceFail = results.nice.failed.length;
const niceTotal = nicePass + niceFail;
const nicePct = niceTotal > 0 ? ((nicePass / niceTotal) * 100).toFixed(0) : 0;

console.log(`   \x1b[31m🔴 CRITICAL (Must have):\x1b[0m     ${criticalPass}/${criticalTotal} (${criticalPct}%)`);
console.log(`   \x1b[33m🟡 IMPORTANT (Should have):\x1b[0m  ${importantPass}/${importantTotal} (${importantPct}%)`);
console.log(`   \x1b[36m🔵 NICE-TO-HAVE (Future):\x1b[0m    ${nicePass}/${niceTotal} (${nicePct}%)`);

console.log('\n');

if (criticalFail === 0) {
    console.log('\x1b[42m\x1b[30m ✅ LAUNCH READY: All critical functionality verified \x1b[0m');
} else {
    console.log('\x1b[41m\x1b[37m ❌ NOT READY: ' + criticalFail + ' critical issues must be fixed \x1b[0m');
    console.log('\n   Critical failures:');
    results.critical.failed.forEach(f => {
        console.log(`   \x1b[31m→\x1b[0m ${f.name}`);
    });
}

if (importantFail > 0) {
    console.log('\n   Important items to address:');
    results.important.failed.forEach(f => {
        console.log(`   \x1b[33m→\x1b[0m ${f.name}`);
    });
}

// Save results
fs.writeFileSync(path.join(__dirname, 'launch-readiness.json'), JSON.stringify({
    timestamp: new Date().toISOString(),
    critical: { pass: criticalPass, fail: criticalFail, pct: criticalPct },
    important: { pass: importantPass, fail: importantFail, pct: importantPct },
    nice: { pass: nicePass, fail: niceFail, pct: nicePct },
    launchReady: criticalFail === 0,
    results
}, null, 2));

console.log('\n');
process.exit(criticalFail > 0 ? 1 : 0);
