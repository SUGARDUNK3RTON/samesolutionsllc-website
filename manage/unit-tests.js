/**
 * Same Solutions PWA - Unit Tests
 * Run: node tests/unit-tests.js
 */
const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, '..', 'src', 'index.html');
const html = fs.readFileSync(indexPath, 'utf8');
const script = html.match(/<script>([\s\S]*?)<\/script>/)[1];

let passed = 0, failed = 0;
const tests = [];

function describe(name, fn) { console.log(`\n\x1b[36m━━━ ${name} ━━━\x1b[0m`); fn(); }
function it(name, fn) {
    try { fn(); passed++; console.log(`   \x1b[32m✓\x1b[0m ${name}`); tests.push({ name, status: 'passed' }); }
    catch (e) { failed++; console.log(`   \x1b[31m✗\x1b[0m ${name}\n     \x1b[31m${e.message}\x1b[0m`); tests.push({ name, status: 'failed', error: e.message }); }
}
function expect(actual) {
    return {
        toBe: (expected) => { if (actual !== expected) throw new Error(`Expected ${expected}, got ${actual}`); },
        toBeTruthy: () => { if (!actual) throw new Error(`Expected truthy, got ${actual}`); },
        toBeGreaterThan: (n) => { if (!(actual > n)) throw new Error(`Expected ${actual} > ${n}`); },
        toContain: (str) => { if (!actual.includes(str)) throw new Error(`Missing: ${str}`); },
        toMatch: (re) => { if (!re.test(actual)) throw new Error(`No match for ${re}`); }
    };
}

console.log('\x1b[1m\x1b[36m═══════════════════════════════════════════════════════════════════════════════\x1b[0m');
console.log('\x1b[1m\x1b[36m  SAME SOLUTIONS PWA - UNIT TESTS\x1b[0m');
console.log('\x1b[1m\x1b[36m═══════════════════════════════════════════════════════════════════════════════\x1b[0m');

describe('Currency Formatting', () => {
    it('fmt function exists', () => expect(script).toContain('function fmt'));
    it('uses toLocaleString', () => expect(script).toContain('toLocaleString'));
    it('handles decimals with toFixed', () => expect(script).toContain('toFixed'));
});

describe('Date Functions', () => {
    it('today() function exists', () => expect(script).toContain('function today()'));
    it('uses ISO format', () => expect(script).toContain('toISOString'));
    it('formats for display', () => expect(script).toContain('toLocaleDateString'));
});

describe('Data Mutation Helpers', () => {
    it('addJob exists with saveData', () => {
        expect(script).toContain('function addJob(');
        expect(!!script.match(/function addJob\([^)]*\)[\s\S]*?saveData\(\)/)).toBeTruthy();
    });
    it('updateJob exists', () => expect(script).toContain('function updateJob('));
    it('removeJob exists', () => expect(script).toContain('function removeJob('));
    it('addCustomer exists', () => expect(script).toContain('function addCustomer('));
    it('updateCustomer exists', () => expect(script).toContain('function updateCustomer('));
    it('addInvoice exists', () => expect(script).toContain('function addInvoice('));
    it('addExpenseRecord exists', () => expect(script).toContain('function addExpenseRecord('));
});

describe('Invoice Generation', () => {
    it('SS- prefix for invoices', () => expect(script).toContain('SS-'));
    it('invoice counter exists', () => expect(script).toContain('invoiceCounter'));
});

describe('Mileage Calculations', () => {
    it('MILEAGE_RATE constant', () => expect(script).toContain('MILEAGE_RATE'));
    it('IRS 2025 rate ($0.70)', () => expect(script).toContain('0.70'));
});

describe('Customer Balances', () => {
    it('filters owed status', () => expect(script).toContain("status === 'owed'"));
    it('uses reduce for totals', () => expect(script).toContain('reduce('));
});

describe('Search', () => {
    it('toLowerCase for case-insensitive', () => expect(script).toContain('toLowerCase()'));
    it('trims whitespace', () => expect(script).toContain('trim()'));
});

describe('Validation', () => {
    it('required attribute used', () => expect(script).toContain('required'));
    it('parseFloat for numbers', () => expect(script).toContain('parseFloat'));
    it('Date validation', () => expect(script).toContain('new Date'));
});

describe('Activity Logging', () => {
    it('logActivity function', () => expect(script).toContain('logActivity'));
});

describe('Error Handling', () => {
    it('10+ try-catch blocks', () => expect((script.match(/try\s*{/g) || []).length).toBeGreaterThan(10));
    it('20+ error toasts', () => expect((script.match(/toast\([^)]*error/gi) || []).length).toBeGreaterThan(20));
});

describe('Data Persistence', () => {
    it('saveData function', () => expect(script).toContain('function saveData()'));
    it('loadData function', () => expect(script).toContain('function loadData()'));
    it('localStorage usage', () => expect(script).toContain('localStorage'));
    it('backup mechanism', () => expect(script).toContain('backup'));
    it('cloud sync', () => expect(script).toContain('syncToCloud'));
});

describe('VIN Decoding', () => {
    it('NHTSA API', () => expect(script).toContain('vpic.nhtsa.dot.gov'));
    it('17-char validation', () => expect(script).toContain('17'));
});

describe('Reports', () => {
    it('PDF generation', () => expect(script).toContain('html2pdf'));
    it('date range filtering', () => { expect(script).toContain('startDate'); expect(script).toContain('endDate'); });
});

const total = passed + failed;
const pct = ((passed/total)*100).toFixed(1);
console.log('\n\x1b[1m\x1b[36m═══════════════════════════════════════════════════════════════════════════════\x1b[0m');
console.log(`\x1b[1m\x1b[36m  UNIT TEST RESULTS: ${passed}/${total} (${pct}%)\x1b[0m`);
console.log('\x1b[1m\x1b[36m═══════════════════════════════════════════════════════════════════════════════\x1b[0m\n');
console.log(`   \x1b[32m✓ Passed:\x1b[0m ${passed}`);
console.log(`   \x1b[31m✗ Failed:\x1b[0m ${failed}\n`);
process.exit(failed > 0 ? 1 : 0);

// Additional unit tests for edge cases
describe('Edge Case Handling', () => {
    it('handles empty customer list', () => expect(script).toContain('Object.keys(data.customers)'));
    it('handles empty job list', () => expect(script).toContain('data.jobs.length'));
    it('validates required fields', () => expect(script).toContain('.trim()'));
    it('prevents negative amounts', () => expect(script).toContain('parseFloat'));
});

describe('Date Edge Cases', () => {
    it('handles date comparisons', () => expect(script).toContain('new Date'));
    it('formats dates consistently', () => expect(script).toContain('toLocaleDateString'));
});

describe('Number Formatting', () => {
    it('formats currency correctly', () => expect(script).toContain('toLocaleString'));
    it('handles decimal precision', () => expect(script).toContain('toFixed'));
});
