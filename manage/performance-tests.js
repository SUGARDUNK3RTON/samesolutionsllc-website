#!/usr/bin/env node
/**
 * Same Solutions PWA - Performance Tests
 * Measures code quality metrics
 */

const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, '..', 'src', 'index.html');
const html = fs.readFileSync(indexPath, 'utf8');
const script = html.match(/<script>([\s\S]*?)<\/script>/)[1];

let passed = 0, failed = 0;

function test(name, condition, threshold, actual) {
    if (condition) {
        passed++;
        console.log(`   \x1b[32m✓\x1b[0m ${name} (${actual})`);
    } else {
        failed++;
        console.log(`   \x1b[31m✗\x1b[0m ${name} (${actual}, threshold: ${threshold})`);
    }
}

console.log('\x1b[1m\x1b[33m═══════════════════════════════════════════════════════════════════════════════\x1b[0m');
console.log('\x1b[1m\x1b[33m  SAME SOLUTIONS PWA - PERFORMANCE TESTS\x1b[0m');
console.log('\x1b[1m\x1b[33m═══════════════════════════════════════════════════════════════════════════════\x1b[0m');

console.log('\n\x1b[33m━━━ Code Size Metrics ━━━\x1b[0m');

const totalLines = html.split('\n').length;
test('Total lines < 20,000', totalLines < 20000, '< 20,000', totalLines);

const fileSize = Buffer.byteLength(html, 'utf8') / 1024;
test('File size < 1.5 MB', fileSize < 1500, '< 1500 KB', `${fileSize.toFixed(0)} KB`);

const functionCount = (script.match(/function\s+\w+/g) || []).length;
test('Function count < 500', functionCount < 500, '< 500', functionCount);

console.log('\n\x1b[33m━━━ Code Quality Metrics ━━━\x1b[0m');

const consoleLogCount = (script.match(/console\.log/g) || []).length;
test('Console.log < 15', consoleLogCount < 15, '< 15', consoleLogCount);

const tryCount = (script.match(/try\s*\{/g) || []).length;
const catchCount = (script.match(/catch\s*\(/g) || []).length;
test('Try-catch balanced', catchCount >= tryCount * 0.9, '90% coverage', `${catchCount}/${tryCount}`);

const inlineStyles = (html.match(/style="/g) || []).length;
test('Inline styles < 2500', inlineStyles < 2500, '< 2500', inlineStyles);

console.log('\n\x1b[33m━━━ Accessibility Metrics ━━━\x1b[0m');

const totalImages = (html.match(/<img/g) || []).length;
const imagesWithAlt = (html.match(/<img[^>]*alt=/g) || []).length;
const altCoverage = totalImages > 0 ? (imagesWithAlt / totalImages * 100).toFixed(0) : 100;
test('Images have alt text (100%)', imagesWithAlt === totalImages, '100%', `${altCoverage}%`);

const hasSkipLink = html.includes('skip') && html.includes('main-content');
test('Skip link exists', hasSkipLink, 'required', hasSkipLink ? 'yes' : 'no');

const hasAriaLabels = (html.match(/aria-label/g) || []).length;
test('ARIA labels present (> 10)', hasAriaLabels > 10, '> 10', hasAriaLabels);

console.log('\n\x1b[33m━━━ Security Metrics ━━━\x1b[0m');

const evalCount = (script.match(/[^a-zA-Z]eval\s*\(/g) || []).length;
test('No eval() usage', evalCount === 0, '0', evalCount);

const httpLinks = (html.match(/http:\/\/(?!localhost)/g) || []).length;
test('No insecure HTTP links', httpLinks === 0, '0', httpLinks);

console.log('\n\x1b[33m━━━ User Experience Metrics ━━━\x1b[0m');

const totalToasts = (script.match(/toast\(/g) || []).length;
test('Feedback toasts (> 100)', totalToasts > 100, '> 100', totalToasts);

const successToasts = (script.match(/toast\([^)]*success/g) || []).length;
test('Success toasts (> 15)', successToasts > 15, '> 15', successToasts);

const errorToasts = (script.match(/toast\([^)]*error/g) || []).length;
test('Error toasts (> 50)', errorToasts > 50, '> 50', errorToasts);

// Results
const total = passed + failed;
const pct = ((passed/total)*100).toFixed(1);

console.log('\n\x1b[1m\x1b[33m═══════════════════════════════════════════════════════════════════════════════\x1b[0m');
console.log(`\x1b[1m\x1b[33m  PERFORMANCE TEST RESULTS: ${passed}/${total} (${pct}%)\x1b[0m`);
console.log('\x1b[1m\x1b[33m═══════════════════════════════════════════════════════════════════════════════\x1b[0m\n');

console.log(`   \x1b[32m✓ Passed:\x1b[0m ${passed}`);
console.log(`   \x1b[31m✗ Failed:\x1b[0m ${failed}\n`);

process.exit(failed > 0 ? 1 : 0);
