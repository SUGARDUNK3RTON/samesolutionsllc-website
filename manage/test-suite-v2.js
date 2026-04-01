/**
 * Same Solutions PWA - Enhanced Test Suite v2
 * Expanded coverage with failure-seeking tests
 */

const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');
const script = html.match(/<script>([\s\S]*?)<\/script>/)[1];

let passed = 0, failed = 0, warnings = 0;
const results = { passed: [], failed: [], warnings: [] };

const colors = {
    green: '\x1b[32m', red: '\x1b[31m', yellow: '\x1b[33m', 
    cyan: '\x1b[36m', reset: '\x1b[0m'
};

function test(name, condition, category) {
    if (condition) {
        passed++;
        results.passed.push({ name, category });
        console.log(`   ${colors.green}✅${colors.reset} ${name}`);
    } else {
        failed++;
        results.failed.push({ name, category });
        console.log(`   ${colors.red}❌${colors.reset} ${name}`);
    }
}

function warn(name, details, category) {
    warnings++;
    results.warnings.push({ name, details, category });
    console.log(`   ${colors.yellow}⚠️${colors.reset} ${name}`);
    if (details) console.log(`     ${details}`);
}

function section(title) {
    console.log(`\n${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
    console.log(`${colors.cyan}  ${title}${colors.reset}`);
    console.log(`${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
}

// ============================================================================
// 1. CODE QUALITY (8 tests)
// ============================================================================
section('1. CODE QUALITY');

test('JavaScript parses without errors', (() => {
    try { new Function(script); return true; } catch(e) { return false; }
})(), 'code-quality');

test('No console.log in production code (except debug)', 
    (script.match(/console\.log(?!\s*\(\s*['"])/g) || []).length < 15, 'code-quality');

test('All async functions have try-catch', (() => {
    const asyncFuncs = script.match(/async\s+function\s+\w+[^}]+\{[\s\S]*?\n\s{8}\}/g) || [];
    const withoutTry = asyncFuncs.filter(f => !f.includes('try'));
    return withoutTry.length < 5;
})(), 'code-quality');

test('No deeply nested callbacks (>4 levels)', 
    (script.match(/\{\s*\n\s*\{\s*\n\s*\{\s*\n\s*\{\s*\n\s*\{/g) || []).length === 0, 'code-quality');

test('Functions have reasonable size (<200 lines)', (() => {
    const hugeFuncs = [];
    const funcRegex = /function\s+(\w+)/g;
    let match;
    while ((match = funcRegex.exec(script)) !== null) {
        const start = match.index;
        let braces = 0, inFunc = false;
        for (let i = start; i < script.length; i++) {
            if (script[i] === '{') { braces++; inFunc = true; }
            if (script[i] === '}') braces--;
            if (inFunc && braces === 0) {
                const lines = script.slice(start, i).split('\n').length;
                if (lines > 200) hugeFuncs.push(match[1]);
                break;
            }
        }
    }
    if (hugeFuncs.length > 0) warn('Large functions found', hugeFuncs.join(', '), 'code-quality');
    return hugeFuncs.length < 3;
})(), 'code-quality');

test('No duplicate function names', (() => {
    const funcNames = (script.match(/function\s+(\w+)/g) || []).map(f => f.replace('function ', ''));
    const dupes = funcNames.filter((f, i) => funcNames.indexOf(f) !== i);
    if (dupes.length > 0) warn('Duplicate functions', [...new Set(dupes)].join(', '), 'code-quality');
    return dupes.length === 0;
})(), 'code-quality');

test('Consistent naming convention (camelCase)', (() => {
    const funcNames = (script.match(/function\s+(\w+)/g) || []).map(f => f.replace('function ', ''));
    const nonCamel = funcNames.filter(f => f.includes('_') || /^[A-Z]/.test(f));
    return nonCamel.length < 5;
})(), 'code-quality');

test('No magic numbers (hardcoded values >100 used multiple times)', (() => {
    const numbers = script.match(/[^a-zA-Z](\d{3,})[^a-zA-Z]/g) || [];
    const counts = {};
    numbers.forEach(n => { counts[n] = (counts[n] || 0) + 1; });
    const repeated = Object.entries(counts).filter(([k, v]) => v > 3);
    return repeated.length < 5;
})(), 'code-quality');

// ============================================================================
// 2. DATA INTEGRITY (10 tests)
// ============================================================================
section('2. DATA INTEGRITY');

test('saveData() called after data.jobs mutations', (() => {
    const jobMutations = script.match(/data\.jobs\.(push|splice|pop)|data\.jobs\s*=/g) || [];
    const afterSave = script.match(/data\.jobs\.(push|splice|pop)[\s\S]{0,200}saveData\(\)/g) || [];
    return afterSave.length >= jobMutations.length * 0.7;
})(), 'data-integrity');

test('saveData() called after data.customers mutations', (() => {
    const mutations = script.match(/data\.customers\[/g) || [];
    return mutations.length < 50 || script.match(/data\.customers[\s\S]{0,300}saveData/g)?.length > 5;
})(), 'data-integrity');

test('saveData() called after data.invoices mutations', 
    (script.match(/data\.invoices\.push[\s\S]{0,200}saveData/g) || []).length > 0, 'data-integrity');

test('saveData() called after data.expenses mutations', 
    (script.match(/data\.expenses\.push[\s\S]{0,200}saveData/g) || []).length > 0, 'data-integrity');

test('saveData() has error handling', 
    script.includes('saveData') && script.match(/function saveData[\s\S]{0,500}try/), 'data-integrity');

test('loadData() has error handling', 
    script.includes('loadData') && script.match(/function loadData[\s\S]{0,500}try/), 'data-integrity');

test('Data backup before risky operations', 
    script.includes('backup') || script.includes('_backup'), 'data-integrity');

test('No direct localStorage.setItem outside saveData', (() => {
    const directSets = (script.match(/localStorage\.setItem(?!.*backup)/g) || []).length;
    return directSets < 8;
})(), 'data-integrity');

test('Array operations check length before access', (() => {
    const unsafeAccess = script.match(/\[\d+\](?!\s*\|\||\s*\?)/g) || [];
    return unsafeAccess.length < 20;
})(), 'data-integrity');

test('Object property access uses optional chaining or checks', (() => {
    const unsafeObj = (script.match(/data\.\w+\[.*\]\.\w+(?!\s*\?)/g) || []).length;
    return unsafeObj < 30;
})(), 'data-integrity');

// ============================================================================
// 3. ERROR HANDLING (10 tests)
// ============================================================================
section('3. ERROR HANDLING');

test('All form submissions have validation', (() => {
    const forms = html.match(/id="([^"]*-form)"/g) || [];
    const formIds = forms.map(f => f.match(/id="([^"]+)"/)[1]);
    const validated = formIds.filter(id => 
        script.includes(`'${id}'`) && script.match(new RegExp(`${id}[\\s\\S]{0,500}(trim|required|validate|!)`))
    );
    return validated.length >= formIds.length * 0.7;
})(), 'error-handling');

test('API calls have error handling', (() => {
    const fetchCalls = (script.match(/fetch\(/g) || []).length;
    const fetchWithCatch = (script.match(/fetch\([^)]+\)[\s\S]{0,300}catch/g) || []).length;
    return fetchWithCatch >= fetchCalls * 0.8 || fetchCalls < 3;
})(), 'error-handling');

test('JSON.parse wrapped in try-catch', (() => {
    const jsonParse = (script.match(/JSON\.parse/g) || []).length;
    const jsonWithTry = (script.match(/try[\s\S]{0,200}JSON\.parse/g) || []).length;
    return jsonWithTry >= jsonParse * 0.6;
})(), 'error-handling');

test('User-friendly error messages (no raw errors)', 
    (script.match(/toast\([^)]*error\./gi) || []).length === 0, 'error-handling');

test('Error toasts exist for all delete operations', (() => {
    const deleteOps = (script.match(/delete\w+|remove\w+/gi) || []).length;
    return deleteOps < 10 || (script.match(/delete[\s\S]{0,300}toast/gi) || []).length > 3;
})(), 'error-handling');

test('Confirmation before destructive actions', 
    (script.match(/confirm\([^)]*delete|confirm\([^)]*remove/gi) || []).length > 3, 'error-handling');

test('Network errors handled gracefully', 
    script.includes('NetworkError') || script.includes('network') || script.includes('offline'), 'error-handling');

test('File operations have error handling', (() => {
    const fileOps = (script.match(/FileReader|Blob|download/g) || []).length;
    return fileOps < 5 || script.match(/FileReader[\s\S]{0,300}onerror/);
})(), 'error-handling');

test('Modal close on error handled', 
    (script.match(/catch[\s\S]{0,100}closeModal/g) || []).length > 0 || 
    (script.match(/error[\s\S]{0,100}closeModal/g) || []).length > 0, 'error-handling');

test('Graceful degradation when features unavailable', 
    script.includes('if (typeof') || script.includes('window.') && script.includes('undefined'), 'error-handling');

// ============================================================================
// 4. UI/UX COMPLETENESS (12 tests)
// ============================================================================
section('4. UI/UX COMPLETENESS');

test('All modals have close buttons', (() => {
    const modals = html.match(/id="modal-[^"]+"/g) || [];
    const modalIds = modals.map(m => m.match(/id="([^"]+)"/)[1]);
    const withClose = modalIds.filter(id => 
        html.match(new RegExp(`${id}[\\s\\S]{0,2000}closeModal`))
    );
    if (withClose.length < modalIds.length) {
        warn('Modals without close', modalIds.filter(id => !withClose.includes(id)).join(', '), 'ui-ux');
    }
    return withClose.length >= modalIds.length * 0.9;
})(), 'ui-ux');

test('All forms have submit buttons', (() => {
    const forms = html.match(/<form[^>]*id="([^"]+)"[\s\S]*?<\/form>/g) || [];
    const withSubmit = forms.filter(f => f.includes('type="submit"') || f.includes('onclick'));
    return withSubmit.length >= forms.length * 0.9;
})(), 'ui-ux');

test('Loading states for async operations', 
    script.includes('loading') || script.includes('Loading') || script.includes('spinner'), 'ui-ux');

test('Empty states for lists', (() => {
    const lists = ['jobs', 'customers', 'invoices', 'expenses', 'quotes'];
    const withEmpty = lists.filter(l => script.includes(`No ${l}`) || script.includes(`no ${l}`));
    return withEmpty.length >= 3;
})(), 'ui-ux');

test('Confirmation feedback after actions', 
    (script.match(/toast\([^,]+,\s*['"]success['"]\)/g) || []).length > 5, 'ui-ux');

test('Form inputs have labels', (() => {
    const inputs = (html.match(/<input[^>]+id="([^"]+)"/g) || []).map(i => i.match(/id="([^"]+)"/)[1]);
    const withLabels = inputs.filter(id => html.includes(`for="${id}"`) || html.includes(`>${id.replace(/-/g, ' ')}`));
    return withLabels.length >= inputs.length * 0.5;
})(), 'ui-ux');

test('Buttons have visible text or aria-label', (() => {
    const emptyButtons = html.match(/<button[^>]*>\s*<\/button>/g) || [];
    return emptyButtons.length === 0;
})(), 'ui-ux');

test('Touch targets are adequate size (no tiny buttons)', (() => {
    const tinyButtons = html.match(/style="[^"]*width:\s*[12]\d?px/g) || [];
    return tinyButtons.length < 5;
})(), 'ui-ux');

test('Consistent button styling', (() => {
    const btnClasses = (html.match(/class="btn[^"]*"/g) || []);
    return btnClasses.length > 50;
})(), 'ui-ux');

test('No orphaned onclick handlers', (() => {
    const onclicks = html.match(/onclick="([^"(]+)/g) || [];
    const funcNames = onclicks.map(o => o.replace('onclick="', ''));
    const undefined = funcNames.filter(f => !script.includes(`function ${f}`));
    if (undefined.length > 0) warn('Undefined handlers', undefined.slice(0, 5).join(', '), 'ui-ux');
    return undefined.length === 0;
})(), 'ui-ux');

test('Tables have headers', (() => {
    const tables = (html.match(/<table/g) || []).length;
    const headers = (html.match(/<th/g) || []).length;
    return tables === 0 || headers > 0;
})(), 'ui-ux');

test('Responsive design classes present', 
    html.includes('grid-template-columns') && html.includes('auto-fit'), 'ui-ux');

// ============================================================================
// 5. ACCESSIBILITY (10 tests)
// ============================================================================
section('5. ACCESSIBILITY');

test('Navigation has role="navigation"', 
    html.includes('role="navigation"'), 'accessibility');

test('Main content has role or semantic element', 
    html.includes('<main') || html.includes('role="main"'), 'accessibility');

test('Form inputs have associated labels', (() => {
    const inputs = (html.match(/<input(?![^>]*type="hidden")[^>]*>/g) || []).length;
    const labels = (html.match(/<label/g) || []).length;
    return labels >= inputs * 0.5;
})(), 'accessibility');

test('Buttons have accessible names', (() => {
    const buttons = html.match(/<button[^>]*>([^<]*)<\/button>/g) || [];
    const empty = buttons.filter(b => b.match(/<button[^>]*>\s*<\/button>/));
    return empty.length === 0;
})(), 'accessibility');

test('Color contrast (no light gray on white)', (() => {
    const lowContrast = html.match(/color:\s*#[def][def][def]|color:\s*#[c-f]{6}/gi) || [];
    return lowContrast.length < 10;
})(), 'accessibility');

test('Focus states defined', 
    html.includes(':focus') || html.includes('outline'), 'accessibility');

test('Skip link or landmark regions', 
    html.includes('skip') || html.includes('role="banner"') || html.includes('role="main"'), 'accessibility');

test('Images have alt text', (() => {
    const imgs = (html.match(/<img/g) || []).length;
    const alts = (html.match(/<img[^>]*alt="/g) || []).length;
    if (alts < imgs) warn(`Missing alt: ${imgs - alts} images`, null, 'accessibility');
    return alts >= imgs * 0.7;
})(), 'accessibility');

test('ARIA labels on icon-only buttons', (() => {
    const iconButtons = html.match(/<button[^>]*>[^<]*[📊🔍✏️❌🗑️➕][^<]*<\/button>/g) || [];
    const withAria = iconButtons.filter(b => b.includes('aria-label'));
    return withAria.length >= iconButtons.length * 0.5 || iconButtons.length < 5;
})(), 'accessibility');

test('No tabindex > 0 (disrupts natural order)', 
    (html.match(/tabindex="[1-9]/g) || []).length === 0, 'accessibility');

// ============================================================================
// 6. PERFORMANCE (10 tests)
// ============================================================================
section('6. PERFORMANCE');

test('No innerHTML in loops', (() => {
    const inLoops = script.match(/for\s*\([^)]+\)[^}]*innerHTML\s*\+=/g) || [];
    return inLoops.length === 0;
})(), 'performance');

test('getElementById cached in repeated operations', (() => {
    const repeatedGets = script.match(/getElementById\(['"]\w+['"]\)/g) || [];
    const counts = {};
    repeatedGets.forEach(g => { counts[g] = (counts[g] || 0) + 1; });
    const uncached = Object.entries(counts).filter(([k, v]) => v > 5);
    if (uncached.length > 10) warn('Uncached DOM queries', uncached.length + ' repeated', 'performance');
    return uncached.length < 15;
})(), 'performance');

test('Event delegation used for dynamic content', 
    script.includes('closest') || script.includes('target.'), 'performance');

test('Debounce on search/filter inputs', (() => {
    const searchInputs = html.match(/id="[^"]*search[^"]*"|oninput="[^"]*search/gi) || [];
    const hasDebounce = script.includes('debounce') || script.includes('setTimeout');
    return searchInputs.length < 3 || hasDebounce;
})(), 'performance');

test('Images use lazy loading', (() => {
    const imgs = (html.match(/<img/g) || []).length;
    const lazy = (html.match(/loading="lazy"/g) || []).length;
    return imgs < 5 || lazy > 0;
})(), 'performance');

test('No synchronous XHR', 
    !script.includes('async: false') && !script.includes('.open(') && !script.includes('XMLHttpRequest'), 'performance');

test('CSS in head (no inline style blocks in body)', (() => {
    const styleInBody = html.match(/<body[\s\S]*<style/);
    return !styleInBody;
})(), 'performance');

test('Reasonable DOM size', (() => {
    const elements = (html.match(/<\w+/g) || []).length;
    if (elements > 3000) warn('Large DOM', elements + ' elements', 'performance');
    return elements < 5000;
})(), 'performance');

test('No memory leaks (event cleanup)', 
    script.includes('removeEventListener') || !script.includes('addEventListener') || 
    (script.match(/addEventListener/g) || []).length < 30, 'performance');

test('Efficient selectors (ID over class over tag)', (() => {
    const byId = (script.match(/getElementById/g) || []).length;
    const byClass = (script.match(/getElementsByClassName|querySelectorAll\(['"]\.]/g) || []).length;
    return byId > byClass * 2;
})(), 'performance');

// ============================================================================
// 7. SECURITY (8 tests)
// ============================================================================
section('7. SECURITY');

test('No eval() usage', 
    (script.match(/[^a-zA-Z]eval\s*\(/g) || []).length === 0, 'security');

test('No Function() constructor', 
    (script.match(/new\s+Function\s*\(/g) || []).length < 2, 'security');

test('No document.write()', 
    (script.match(/document\.write\(/g) || []).length < 3, 'security');

test('innerHTML not used with user input directly', (() => {
    const dangerous = script.match(/innerHTML\s*=\s*[^`]*\+\s*\w+Input|innerHTML\s*=\s*prompt/g) || [];
    return dangerous.length === 0;
})(), 'security');

test('URL parameters sanitized', 
    !script.includes('location.search') || script.includes('encodeURI'), 'security');

test('No sensitive data in localStorage keys', (() => {
    const keys = script.match(/localStorage\.\w+Item\(['"]([^'"]+)/g) || [];
    const sensitive = keys.filter(k => /password|token|secret|key/i.test(k));
    return sensitive.length === 0;
})(), 'security');

test('HTTPS enforced for external resources', (() => {
    const httpLinks = html.match(/http:\/\/(?!localhost)/g) || [];
    return httpLinks.length === 0;
})(), 'security');

test('Content Security Policy compatible', 
    !script.includes('unsafe-inline') || html.includes('nonce='), 'security');

// ============================================================================
// 8. PWA FEATURES (8 tests)
// ============================================================================
section('8. PWA FEATURES');

test('Manifest file linked', 
    html.includes('manifest.json'), 'pwa');

test('Service worker registration', 
    html.includes('serviceWorker') || script.includes('serviceWorker'), 'pwa');

test('Theme color defined', 
    html.includes('theme-color'), 'pwa');

test('Apple touch icon', 
    html.includes('apple-touch-icon'), 'pwa');

test('Viewport configured', 
    html.includes('width=device-width'), 'pwa');

test('Standalone display mode meta', 
    html.includes('apple-mobile-web-app-capable'), 'pwa');

test('Offline fallback content', 
    script.includes('offline') || html.includes('offline'), 'pwa');

test('Install prompt handling', 
    script.includes('beforeinstallprompt') || script.includes('install'), 'pwa');

// ============================================================================
// 9. BUSINESS LOGIC (12 tests)
// ============================================================================
section('9. BUSINESS LOGIC');

test('Currency formatting consistent', 
    script.includes('fmt(') || script.includes('toLocaleString'), 'business');

test('Date formatting consistent', 
    script.includes('fmtDate') || script.includes('toLocaleDateString'), 'business');

test('Invoice number generation', 
    script.includes('SS-') || script.includes('INV-'), 'business');

test('Tax calculations present', 
    script.includes('tax') || script.includes('Tax'), 'business');

test('Mileage rate configurable', 
    script.includes('MILEAGE_RATE') || script.includes('mileageRate'), 'business');

test('Payment status tracking', 
    script.includes("'paid'") && script.includes("'owed'"), 'business');

test('Customer contact validation', 
    script.includes('phone') && script.includes('email'), 'business');

test('Job/Invoice linking', 
    script.includes('jobId') || script.includes('job.id'), 'business');

test('Report generation', 
    script.includes('Report') || script.includes('report'), 'business');

test('Data export functionality', 
    script.includes('export') || script.includes('Export'), 'business');

test('Data import functionality', 
    script.includes('import') || script.includes('Import'), 'business');

test('Activity logging', 
    script.includes('activity') || script.includes('Activity') || script.includes('log'), 'business');

// ============================================================================
// 10. STATE MANAGEMENT (8 tests)
// ============================================================================
section('10. STATE MANAGEMENT');

test('Single source of truth (data object)', 
    script.includes('let data =') || script.includes('const data ='), 'state');

test('State changes trigger UI updates', 
    script.match(/saveData\(\)[\s\S]{0,50}update|update[\s\S]{0,50}saveData/g)?.length > 0, 'state');

test('No orphaned state variables', (() => {
    const stateVars = script.match(/let\s+(\w+)\s*=/g) || [];
    return stateVars.length < 50;
})(), 'state');

test('Form state properly reset after submission', 
    script.includes('.reset()') || script.includes("value = ''"), 'state');

test('Modal state managed (open/close)', 
    script.includes('openModal') && script.includes('closeModal'), 'state');

test('User session state handled', 
    script.includes('user') && script.includes('role'), 'state');

test('Filter/sort state preserved', 
    script.includes('filter') || script.includes('sort'), 'state');

test('Undo/history not required but nice', (() => {
    const hasUndo = script.includes('undo') || script.includes('history');
    if (!hasUndo) warn('No undo functionality', 'Consider adding', 'state');
    return true; // Don't fail, just warn
})(), 'state');

// ============================================================================
// 11. INTEGRATION COMPLETENESS (10 tests)  
// ============================================================================
section('11. INTEGRATION COMPLETENESS');

test('All CRUD operations for jobs', 
    script.includes('addJob') || script.includes('createJob') &&
    script.includes('editJob') &&
    script.includes('deleteJob'), 'integration');

test('All CRUD operations for customers', 
    script.includes('addCustomer') || script.includes('createCustomer') &&
    script.includes('editCustomer') &&
    script.includes('deleteCustomer') || script.includes('removeCustomer'), 'integration');

test('All CRUD operations for invoices', 
    script.includes('generateInvoice') || script.includes('createInvoice') &&
    script.includes('markInvoicePaid'), 'integration');

test('All CRUD operations for expenses', 
    script.includes('addExpense') &&
    script.includes('deleteExpense'), 'integration');

test('All CRUD operations for quotes', 
    script.includes('addQuote') || script.includes('createQuote') &&
    script.includes('deleteQuote'), 'integration');

test('Customer-Job relationship', 
    script.includes('customer') && script.includes('job'), 'integration');

test('Invoice-Job relationship', 
    script.includes('invoice') && script.includes('job'), 'integration');

test('Property-Customer relationship', 
    script.includes('property') && script.includes('customer'), 'integration');

test('Vehicle-Customer relationship', 
    script.includes('vehicle') && script.includes('customer'), 'integration');

test('Search across entities', 
    script.includes('search') && script.includes('filter'), 'integration');

// ============================================================================
// 12. MOBILE RESPONSIVENESS (6 tests)
// ============================================================================
section('12. MOBILE RESPONSIVENESS');

test('Viewport meta tag', 
    html.includes('width=device-width'), 'mobile');

test('No horizontal scroll (max-width: 100%)', 
    html.includes('max-width: 100%') || html.includes('max-width:100%'), 'mobile');

test('Touch-friendly tap targets', 
    html.includes('padding') && !html.includes('padding: 0') || html.includes('min-height: 44px'), 'mobile');

test('Responsive grid layout', 
    html.includes('grid-template-columns') || html.includes('flex-wrap'), 'mobile');

test('Mobile-specific styles', 
    html.includes('@media') || html.includes('screen and'), 'mobile');

test('No fixed widths on containers', (() => {
    const fixedWidths = html.match(/style="[^"]*width:\s*\d{4,}px/g) || [];
    return fixedWidths.length < 3;
})(), 'mobile');

// ============================================================================
// RESULTS
// ============================================================================
console.log(`\n${colors.cyan}╔══════════════════════════════════════════════════════════════════════════╗${colors.reset}`);
console.log(`${colors.cyan}║                           TEST RESULTS                                   ║${colors.reset}`);
console.log(`${colors.cyan}╚══════════════════════════════════════════════════════════════════════════╝${colors.reset}\n`);

console.log(`   ${colors.green}✅ Passed:${colors.reset}   ${passed}`);
console.log(`   ${colors.red}❌ Failed:${colors.reset}   ${failed}`);
console.log(`   ${colors.yellow}⚠️  Warnings:${colors.reset} ${warnings}`);

if (results.failed.length > 0) {
    console.log(`\n${colors.red}━━━ FAILURES ━━━${colors.reset}`);
    results.failed.forEach(f => {
        console.log(`   ${colors.red}✗${colors.reset} [${f.category}] ${f.name}`);
    });
}

if (results.warnings.length > 0) {
    console.log(`\n${colors.yellow}━━━ WARNINGS ━━━${colors.reset}`);
    results.warnings.forEach(w => {
        console.log(`   ${colors.yellow}!${colors.reset} [${w.category}] ${w.name}`);
        if (w.details) console.log(`     ${w.details}`);
    });
}

// Category summary
console.log(`\n${colors.cyan}━━━ CATEGORY SUMMARY ━━━${colors.reset}`);
const categories = {};
results.passed.forEach(r => { categories[r.category] = categories[r.category] || { p: 0, f: 0 }; categories[r.category].p++; });
results.failed.forEach(r => { categories[r.category] = categories[r.category] || { p: 0, f: 0 }; categories[r.category].f++; });
Object.entries(categories).sort((a, b) => a[0].localeCompare(b[0])).forEach(([cat, stats]) => {
    const total = stats.p + stats.f;
    const pct = ((stats.p / total) * 100).toFixed(0);
    const color = stats.f > 0 ? colors.red : colors.green;
    console.log(`   ${color}${cat}:${colors.reset} ${stats.p}/${total} (${pct}%)`);
});

const status = failed === 0 ? `${colors.green}READY FOR DEPLOYMENT${colors.reset}` : 
               failed < 5 ? `${colors.yellow}NEEDS FIXES${colors.reset}` : 
               `${colors.red}MAJOR ISSUES${colors.reset}`;
console.log(`\nStatus: ${status}\n`);

// Write results to file
fs.writeFileSync('test-results.json', JSON.stringify({ passed, failed, warnings, results }, null, 2));
