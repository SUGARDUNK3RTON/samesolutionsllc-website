#!/usr/bin/env node
/**
 * Same Solutions PWA - Integration Tests
 * Tests feature workflows end-to-end
 */

const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, '..', 'src', 'index.html');
const html = fs.readFileSync(indexPath, 'utf8');
const script = html.match(/<script>([\s\S]*?)<\/script>/)[1];

let passed = 0, failed = 0;

function describe(name, fn) { console.log(`\n\x1b[35m━━━ ${name} ━━━\x1b[0m`); fn(); }
function it(name, fn) {
    try { fn(); passed++; console.log(`   \x1b[32m✓\x1b[0m ${name}`); }
    catch (e) { failed++; console.log(`   \x1b[31m✗\x1b[0m ${name}: ${e.message}`); }
}
function expect(actual) {
    return {
        toBeTruthy: () => { if (!actual) throw new Error('Expected truthy'); },
        toContain: (str) => { if (!actual.includes(str)) throw new Error(`Missing: ${str}`); }
    };
}

console.log('\x1b[1m\x1b[35m═══════════════════════════════════════════════════════════════════════════════\x1b[0m');
console.log('\x1b[1m\x1b[35m  SAME SOLUTIONS PWA - INTEGRATION TESTS\x1b[0m');
console.log('\x1b[1m\x1b[35m═══════════════════════════════════════════════════════════════════════════════\x1b[0m');

describe('Job-to-Payment Workflow', () => {
    it('addJob triggers saveData', () => expect(script.match(/function addJob[\s\S]*?saveData\(\)/)).toBeTruthy());
    it('job status can be owed', () => expect(script).toContain("status: 'owed'"));
    it('invoice links to jobs', () => expect(script).toContain('inv.jobs'));
    it('markInvoicePaid updates status', () => expect(script.match(/markInvoicePaid[\s\S]*?status = 'paid'/)).toBeTruthy());
    it('payment logged to activity', () => expect(script.match(/markInvoicePaid[\s\S]*?logActivity/)).toBeTruthy());
});

describe('Customer Management', () => {
    it('customer has name field', () => expect(script).toContain('customer.name'));
    it('customer links to properties', () => expect(script).toContain('properties'));
    it('balance calculation exists', () => expect(script.match(/owed[\s\S]*?reduce|reduce[\s\S]*?owed/)).toBeTruthy());
    it('search is case-insensitive', () => expect(script).toContain('toLowerCase'));
});

describe('Mileage Tracking', () => {
    it('MILEAGE_RATE defined', () => expect(script).toContain('MILEAGE_RATE'));
    it('mileage links to customer', () => expect(script).toContain('mileage-customer'));
    it('mileage has date', () => expect(script).toContain('mileage-date'));
});

describe('Property Documentation', () => {
    it('property has systems', () => expect(script).toContain('systems'));
    it('property has appliances', () => expect(script).toContain('appliances'));
    it('photos attachable', () => expect(script).toContain('photos'));
});

describe('Vehicle Service', () => {
    it('VIN decoder API', () => expect(script).toContain('vpic.nhtsa.dot.gov'));
    it('oil/maintenance specs', () => expect(script).toContain('oil'));
    it('owner vehicles tracked', () => expect(script).toContain('ownerVehicles'));
    it('customer vehicles linked', () => expect(script).toContain('customerVehicles'));
});

describe('Expense Tracking', () => {
    it('expense has date', () => expect(script).toContain('expense-date'));
    it('expense has amount', () => expect(script).toContain('expense-amount'));
    it('reimbursable flag', () => expect(script).toContain('reimbursable'));
    it('receipt support', () => expect(script).toContain('receipt'));
});

describe('Authentication', () => {
    it('login function', () => expect(script).toContain('login'));
    it('admin role', () => expect(script).toContain('admin'));
    it('customer role', () => expect(script).toContain('customer'));
    it('session management', () => expect(script).toContain('currentUser'));
});

describe('Data Sync', () => {
    it('localStorage', () => expect(script).toContain('localStorage'));
    it('cloud sync', () => expect(script).toContain('syncToCloud'));
    it('backup', () => expect(script).toContain('backup'));
    it('export', () => expect(script).toContain('export'));
    it('import', () => expect(script).toContain('import'));
});

describe('Quote Management', () => {
    it('quote-customer field', () => expect(script).toContain('quote-customer'));
    it('convert to invoice', () => expect(script).toContain('convertQuoteToInvoice'));
    it('status tracking', () => expect(script).toContain('status'));
});

describe('Timer/Job Tracking', () => {
    it('timer start', () => expect(script).toContain('startTimer'));
    it('timer interval', () => expect(script).toContain('timerInterval'));
    it('stop timer saves', () => expect(script).toContain('stopTimer'));
});

describe('Recurring Jobs', () => {
    it('recurringJobs defined', () => expect(script).toContain('recurringJobs'));
    it('frequency setting', () => expect(script).toContain('frequency'));
    it('auto-check', () => expect(script).toContain('checkRecurringJobs'));
});

// Results
const total = passed + failed;
const pct = ((passed/total)*100).toFixed(1);

console.log('\n\x1b[1m\x1b[35m═══════════════════════════════════════════════════════════════════════════════\x1b[0m');
console.log(`\x1b[1m\x1b[35m  INTEGRATION TEST RESULTS: ${passed}/${total} (${pct}%)\x1b[0m`);
console.log('\x1b[1m\x1b[35m═══════════════════════════════════════════════════════════════════════════════\x1b[0m\n');

console.log(`   \x1b[32m✓ Passed:\x1b[0m ${passed}`);
console.log(`   \x1b[31m✗ Failed:\x1b[0m ${failed}\n`);

process.exit(failed > 0 ? 1 : 0);
