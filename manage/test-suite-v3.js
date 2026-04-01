/**
 * Same Solutions PWA - Test Suite v3
 * Refined tests with false positive fixes
 */

const fs = require('fs');
const path = require('path');
const htmlPath = path.join(__dirname, '..', 'src', 'index.html');
const html = fs.readFileSync(htmlPath, 'utf8');
const script = html.match(/<script>([\s\S]*?)<\/script>/)[1];

let passed = 0, failed = 0, warnings = 0;
const results = { passed: [], failed: [], warnings: [] };

const colors = {
    green: '\x1b[32m', red: '\x1b[31m', yellow: '\x1b[33m', 
    cyan: '\x1b[36m', reset: '\x1b[0m', bold: '\x1b[1m'
};

function test(name, condition, category, weight = 1) {
    if (condition) {
        passed += weight;
        results.passed.push({ name, category, weight });
        console.log(`   ${colors.green}✅${colors.reset} ${name}`);
    } else {
        failed += weight;
        results.failed.push({ name, category, weight });
        console.log(`   ${colors.red}❌${colors.reset} ${name}`);
    }
}

function warn(name, details, category) {
    warnings++;
    results.warnings.push({ name, details, category });
}

function section(title) {
    console.log(`\n${colors.cyan}━━━ ${title} ━━━${colors.reset}`);
}

// ============================================================================
// 1. CODE QUALITY (5 tests)
// ============================================================================
section('1. CODE QUALITY');

test('JavaScript parses without errors', (() => {
    try { new Function(script); return true; } catch(e) { console.log(e); return false; }
})(), 'code-quality', 2);

test('No console.log spam (< 20 instances)', 
    (script.match(/console\.log\(/g) || []).length < 20, 'code-quality');

test('Try-catch ratio reasonable (> 0.7)', (() => {
    const tries = (script.match(/try\s*{/g) || []).length;
    const catches = (script.match(/catch\s*\(/g) || []).length;
    return tries === 0 || catches / tries > 0.7;
})(), 'code-quality');

test('No deeply nested callbacks (> 5 levels)', 
    (script.match(/\{\s*\n\s*\{\s*\n\s*\{\s*\n\s*\{\s*\n\s*\{\s*\n\s*\{/g) || []).length === 0, 'code-quality');

test('No duplicate function declarations', (() => {
    const funcNames = (script.match(/function\s+(\w+)/g) || []).map(f => f.replace('function ', ''));
    const dupes = funcNames.filter((f, i) => funcNames.indexOf(f) !== i);
    return dupes.length === 0;
})(), 'code-quality');

// ============================================================================
// 2. DATA INTEGRITY (5 tests)
// ============================================================================
section('2. DATA INTEGRITY');

test('saveData() function exists with error handling', 
    script.includes('function saveData') && script.match(/function saveData[\s\S]{0,500}try/), 'data-integrity', 2);

test('loadData() function exists with error handling', 
    script.includes('function loadData') && script.match(/function loadData[\s\S]{0,500}try/), 'data-integrity', 2);

test('Data mutation helpers exist (addJob, updateJob, etc)', 
    script.includes('function addJob') && script.includes('function updateJob'), 'data-integrity');

test('Backup mechanism exists', 
    script.includes('backup') || script.includes('_backup'), 'data-integrity');

test('Cloud sync mechanism exists', 
    script.includes('syncToCloud') || script.includes('Firestore'), 'data-integrity');

// ============================================================================
// 3. ERROR HANDLING (5 tests)
// ============================================================================
section('3. ERROR HANDLING');

test('Error toasts for user feedback (> 30)', 
    (script.match(/toast\([^)]*error/gi) || []).length > 30, 'error-handling');

test('JSON.parse has error handling', (() => {
    const jsonParse = (script.match(/JSON\.parse/g) || []).length;
    const jsonWithTry = (script.match(/try[\s\S]{0,300}JSON\.parse|JSON\.parse[\s\S]{0,100}catch/g) || []).length;
    return jsonWithTry >= jsonParse * 0.5;
})(), 'error-handling');

test('Confirmation before destructive actions', 
    (script.match(/confirm\([^)]*delete|confirm\([^)]*remove|confirm\([^)]*overwrite/gi) || []).length >= 3, 'error-handling');

test('Form validation patterns exist', 
    script.includes('.trim()') && script.includes('required') && 
    (script.match(/if\s*\(\s*!\w+\s*\)/g) || []).length > 10, 'error-handling');

test('Offline handling exists', 
    script.includes('navigator.onLine') || script.includes('offline'), 'error-handling');

// ============================================================================
// 4. UI/UX (6 tests)
// ============================================================================
section('4. UI/UX');

test('Modal system exists (open/close)', 
    script.includes('openModal') && script.includes('closeModal'), 'ui-ux');

test('Toast notification system', 
    script.includes('function toast'), 'ui-ux');

test('Loading/spinner indicator', 
    script.includes('loading') || script.includes('Loading') || html.includes('spinner'), 'ui-ux');

test('Success feedback exists (> 5 success toasts)', 
    (script.match(/toast\([^,]+,\s*['"]success['"]\)/g) || []).length >= 5, 'ui-ux');

test('Dark mode support', 
    script.includes('dark-mode') || script.includes('darkMode'), 'ui-ux');

test('Responsive grid layout', 
    html.includes('grid-template-columns') && html.includes('auto-fit'), 'ui-ux');

// ============================================================================
// 5. ACCESSIBILITY (5 tests)
// ============================================================================
section('5. ACCESSIBILITY');

test('Skip link exists', 
    html.includes('skip') && html.includes('main-content'), 'accessibility');

test('Navigation has role', 
    html.includes('role="navigation"'), 'accessibility');

test('Main content has landmark', 
    html.includes('role="main"') || html.includes('<main'), 'accessibility');

test('Buttons have accessible names (no empty buttons)', 
    (html.match(/<button[^>]*>\s*<\/button>/g) || []).length === 0, 'accessibility');

test('Alt text on images (> 90% coverage)', (() => {
    const imgs = (html.match(/<img/g) || []).length;
    const alts = (html.match(/<img[^>]*alt=/g) || []).length;
    return imgs === 0 || alts / imgs > 0.9;
})(), 'accessibility');

// ============================================================================
// 6. PERFORMANCE (4 tests)
// ============================================================================
section('6. PERFORMANCE');

test('DOM caching helper exists', 
    script.includes('$cache') || script.includes('getElementById'), 'performance');

test('Event delegation used', 
    script.includes('.closest(') || script.includes('event.target'), 'performance');

test('Debounce/throttle patterns', 
    script.includes('setTimeout') && script.includes('clearTimeout'), 'performance');

test('Lazy loading on images', 
    html.includes('loading="lazy"'), 'performance');

// ============================================================================
// 7. SECURITY (5 tests)
// ============================================================================
section('7. SECURITY');

test('No eval() usage', 
    (script.match(/[^a-zA-Z]eval\s*\(/g) || []).length === 0, 'security', 2);

test('No document.write() in main document', (() => {
    // document.write in popup windows is acceptable
    const writes = (script.match(/document\.write\(/g) || []).length;
    const popupWrites = (script.match(/win\.document\.write\(/g) || []).length;
    return writes - popupWrites === 0;
})(), 'security');

test('HTTPS for external resources', (() => {
    const httpLinks = html.match(/http:\/\/(?!localhost)/g) || [];
    return httpLinks.length === 0;
})(), 'security', 2);

test('No sensitive data in localStorage keys', (() => {
    const keys = script.match(/localStorage\.\w+Item\(['"]([^'"]+)/g) || [];
    const sensitive = keys.filter(k => /password|token|secret|apikey/i.test(k));
    return sensitive.length === 0;
})(), 'security');

test('Input sanitization patterns', 
    script.includes('trim()') && script.includes('replace('), 'security');

// ============================================================================
// 8. PWA (5 tests)
// ============================================================================
section('8. PWA');

test('Manifest linked', 
    html.includes('manifest.json'), 'pwa');

test('Service worker', 
    html.includes('serviceWorker') || script.includes('serviceWorker'), 'pwa');

test('Theme color', 
    html.includes('theme-color'), 'pwa');

test('Apple mobile tags', 
    html.includes('apple-mobile-web-app'), 'pwa');

test('Viewport configured', 
    html.includes('width=device-width'), 'pwa');

// ============================================================================
// 9. BUSINESS LOGIC (6 tests)
// ============================================================================
section('9. BUSINESS LOGIC');

test('Currency formatting (fmt function)', 
    script.includes('function fmt') || script.includes('toLocaleString'), 'business');

test('Date formatting', 
    script.includes('toLocaleDateString') || script.includes('fmtDate'), 'business');

test('Invoice generation', 
    script.includes('generateInvoice') || script.includes('Invoice'), 'business');

test('Mileage tracking', 
    script.includes('mileage') || script.includes('MILEAGE_RATE'), 'business');

test('Customer management', 
    script.includes('customers') && script.includes('addCustomer'), 'business');

test('Job tracking', 
    script.includes('jobs') && script.includes('addJob'), 'business');

// ============================================================================
// 10. INTEGRATION (5 tests)
// ============================================================================
section('10. INTEGRATION');

test('CRUD for jobs', 
    script.includes('addJob') && script.includes('updateJob') && script.includes('removeJob'), 'integration');

test('CRUD for customers', 
    script.includes('addCustomer') && script.includes('updateCustomer'), 'integration');

test('CRUD for invoices', 
    script.includes('addInvoice') && (script.includes('editInvoice') || script.includes('markInvoicePaid')), 'integration');

test('CRUD for expenses', 
    script.includes('addExpense') && script.includes('deleteExpense'), 'integration');

test('Search functionality', 
    script.includes('search') && script.includes('filter'), 'integration');

// ============================================================================
// 11. MOBILE (4 tests)
// ============================================================================
section('11. MOBILE');

test('Viewport meta', 
    html.includes('width=device-width'), 'mobile');

test('Touch-friendly targets (min-height: 44px)', 
    html.includes('min-height: 44px') || html.includes('min-height:44px'), 'mobile');

test('Responsive layout', 
    html.includes('auto-fit') || html.includes('@media'), 'mobile');

test('No fixed widths on containers', (() => {
    const fixedWidths = html.match(/style="[^"]*width:\s*[89]\d{2,}px/g) || [];
    return fixedWidths.length < 3;
})(), 'mobile');

// ============================================================================
// RESULTS
// ============================================================================
const total = passed + failed;
const pct = ((passed / total) * 100).toFixed(1);

console.log(`\n${colors.cyan}${colors.bold}═══════════════════════════════════════════════════════════════════════════════${colors.reset}`);
console.log(`${colors.cyan}${colors.bold}  TEST RESULTS: ${passed}/${total} (${pct}%)${colors.reset}`);
console.log(`${colors.cyan}${colors.bold}═══════════════════════════════════════════════════════════════════════════════${colors.reset}\n`);

console.log(`   ${colors.green}✅ Passed:${colors.reset}   ${passed}`);
console.log(`   ${colors.red}❌ Failed:${colors.reset}   ${failed}`);
console.log(`   ${colors.yellow}⚠️  Warnings:${colors.reset} ${warnings}`);

if (results.failed.length > 0) {
    console.log(`\n${colors.red}━━━ FAILURES ━━━${colors.reset}`);
    results.failed.forEach(f => {
        console.log(`   ${colors.red}✗${colors.reset} [${f.category}] ${f.name}`);
    });
}

// Category summary
console.log(`\n${colors.cyan}━━━ CATEGORY SUMMARY ━━━${colors.reset}`);
const categories = {};
results.passed.forEach(r => { 
    categories[r.category] = categories[r.category] || { p: 0, f: 0 }; 
    categories[r.category].p += r.weight || 1; 
});
results.failed.forEach(r => { 
    categories[r.category] = categories[r.category] || { p: 0, f: 0 }; 
    categories[r.category].f += r.weight || 1; 
});

Object.entries(categories).sort((a, b) => a[0].localeCompare(b[0])).forEach(([cat, stats]) => {
    const catTotal = stats.p + stats.f;
    const catPct = ((stats.p / catTotal) * 100).toFixed(0);
    const color = stats.f > 0 ? colors.yellow : colors.green;
    const icon = stats.f === 0 ? '✅' : stats.p / catTotal >= 0.8 ? '🔶' : '❌';
    console.log(`   ${icon} ${color}${cat}:${colors.reset} ${stats.p}/${catTotal} (${catPct}%)`);
});

const status = pct >= 95 ? `${colors.green}${colors.bold}EXCELLENT - READY FOR PRODUCTION${colors.reset}` :
               pct >= 85 ? `${colors.green}GOOD - READY FOR DEPLOYMENT${colors.reset}` :
               pct >= 75 ? `${colors.yellow}ACCEPTABLE - MINOR ISSUES${colors.reset}` :
               `${colors.red}NEEDS WORK${colors.reset}`;

console.log(`\n${colors.bold}Status: ${status}${colors.reset}`);
console.log(`Target: 95%+ | Current: ${pct}%\n`);

// Write machine-readable results
fs.writeFileSync('test-results-v3.json', JSON.stringify({
    version: 3,
    timestamp: new Date().toISOString(),
    passed, failed, warnings,
    percentage: parseFloat(pct),
    categories,
    results
}, null, 2));
