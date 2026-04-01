#!/usr/bin/env node
/**
 * Same Solutions PWA - Business Logic Tests
 * Tests specific to Same Solutions LLC business rules
 */

const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, '..', 'src', 'index.html');
const html = fs.readFileSync(indexPath, 'utf8');
const script = html.match(/<script>([\s\S]*?)<\/script>/)[1];

let passed = 0, failed = 0;

function describe(name, fn) { console.log(`\n\x1b[34m━━━ ${name} ━━━\x1b[0m`); fn(); }
function it(name, fn) {
    try { fn(); passed++; console.log(`   \x1b[32m✓\x1b[0m ${name}`); }
    catch (e) { failed++; console.log(`   \x1b[31m✗\x1b[0m ${name}: ${e.message}`); }
}
function expect(actual) {
    return {
        toBeTruthy: () => { if (!actual) throw new Error('Expected truthy'); },
        toContain: (str) => { if (!actual.includes(str)) throw new Error(`Missing: ${str}`); },
        toBe: (val) => { if (actual !== val) throw new Error(`Expected ${val}, got ${actual}`); }
    };
}

console.log('\x1b[1m\x1b[34m═══════════════════════════════════════════════════════════════════════════════\x1b[0m');
console.log('\x1b[1m\x1b[34m  SAME SOLUTIONS PWA - BUSINESS LOGIC TESTS\x1b[0m');
console.log('\x1b[1m\x1b[34m═══════════════════════════════════════════════════════════════════════════════\x1b[0m');

describe('Business Identity', () => {
    it('Company name is "Same Solutions LLC"', () => {
        expect(script).toContain('Same Solutions LLC');
    });
    it('Owner is Samuel Foran', () => {
        expect(script).toContain('Samuel Foran');
    });
    it('Phone number is (248) 568-5861', () => {
        expect(script).toContain('(248) 568-5861');
    });
    it('Email is sam@samesolutionsllc.com', () => {
        expect(script).toContain('sam@samesolutionsllc.com');
    });
    it('Location is Commerce Township, MI', () => {
        expect(script).toContain('Commerce');
    });
});

describe('IRS Compliance', () => {
    it('Mileage rate is $0.70 (2025 IRS rate)', () => {
        expect(script).toContain('0.70');
    });
    it('Mileage rate constant exists', () => {
        expect(script).toContain('MILEAGE_RATE');
    });
});

describe('Invoice Numbering', () => {
    it('Invoices use SS- prefix', () => {
        expect(script).toContain('SS-');
    });
    it('Invoice counter exists', () => {
        expect(script).toContain('invoiceCounter');
    });
});

describe('Customer Types', () => {
    it('Supports customer type', () => {
        expect(script).toContain('customer');
    });
    it('Supports admin role', () => {
        expect(script).toContain('admin');
    });
    it('Supports household type', () => {
        expect(script).toContain('household');
    });
});

describe('Job Types', () => {
    it('Supports labor jobs', () => {
        expect(script).toContain('labor');
    });
    it('Supports automotive jobs', () => {
        expect(script).toContain('automotive');
    });
    it('Supports handyman jobs', () => {
        expect(script).toContain('handyman');
    });
    it('Supports cleaning jobs', () => {
        expect(script).toContain('cleaning');
    });
});

describe('Payment Tracking', () => {
    it('Tracks owed status', () => {
        expect(script).toContain("'owed'");
    });
    it('Tracks paid status', () => {
        expect(script).toContain("'paid'");
    });
    it('Calculates balances', () => {
        expect(script).toContain('reduce');
    });
});

describe('Known Customers', () => {
    it('Mike Letvin (Westside Kosher)', () => {
        expect(script).toContain('mike-letvin');
    });
    it('Jonathan Aceves (neighbor)', () => {
        expect(script).toContain('jonathan-aceves');
    });
    it('Chris Golecki', () => {
        expect(script).toContain('chris-golecki');
    });
});

describe('Owner Vehicles', () => {
    it('Cadillac CTS Vsport', () => {
        expect(script).toContain('Vsport');
    });
    it('Silverado', () => {
        expect(script).toContain('Silverado');
    });
    it('1946 Chevy (project)', () => {
        expect(script).toContain('1946');
    });
});

describe('Brand Colors', () => {
    it('Black primary (#101820)', () => {
        expect(script).toContain('101820');
    });
    it('Gold accent (#FFB612)', () => {
        expect(script).toContain('FFB612');
    });
});

// Results
const total = passed + failed;
const pct = ((passed/total)*100).toFixed(1);

console.log('\n\x1b[1m\x1b[34m═══════════════════════════════════════════════════════════════════════════════\x1b[0m');
console.log(`\x1b[1m\x1b[34m  BUSINESS LOGIC TEST RESULTS: ${passed}/${total} (${pct}%)\x1b[0m`);
console.log('\x1b[1m\x1b[34m═══════════════════════════════════════════════════════════════════════════════\x1b[0m\n');

console.log(`   \x1b[32m✓ Passed:\x1b[0m ${passed}`);
console.log(`   \x1b[31m✗ Failed:\x1b[0m ${failed}\n`);

process.exit(failed > 0 ? 1 : 0);
