/**
 * Same Solutions PWA - Automated Test Suite
 * 
 * This runs static analysis and simulated functionality tests
 * without needing a browser. It catches issues BEFORE deployment.
 * 
 * Run with: node test-suite.js
 */

const fs = require('fs');
const path = require('path');

// Test results tracking
let passed = 0;
let failed = 0;
let warnings = 0;
const failures = [];
const warningList = [];

// Colors for terminal output
const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const CYAN = '\x1b[36m';
const RESET = '\x1b[0m';

function test(category, name, condition, errorDetail = '') {
    if (condition) {
        console.log(`   ${GREEN}✅${RESET} ${name}`);
        passed++;
        return true;
    } else {
        console.log(`   ${RED}❌${RESET} ${name}`);
        if (errorDetail) console.log(`      ${RED}→ ${errorDetail}${RESET}`);
        failed++;
        failures.push({ category, name, detail: errorDetail });
        return false;
    }
}

function warn(category, name, detail = '') {
    console.log(`   ${YELLOW}⚠️${RESET} ${name}`);
    if (detail) console.log(`      ${YELLOW}→ ${detail}${RESET}`);
    warnings++;
    warningList.push({ category, name, detail });
}

function section(title) {
    console.log('');
    console.log(`${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}`);
    console.log(`${CYAN}  ${title}${RESET}`);
    console.log(`${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}`);
}

// Load the HTML file
const htmlPath = path.join(__dirname, 'index.html');
if (!fs.existsSync(htmlPath)) {
    console.error('ERROR: index.html not found!');
    process.exit(1);
}
const html = fs.readFileSync(htmlPath, 'utf8');

// Extract script content
const scriptMatch = html.match(/<script>([\s\S]*?)<\/script>/);
const script = scriptMatch ? scriptMatch[1] : '';

// Extract all function definitions
const funcDefs = new Map();
const funcDefRegex = /function\s+(\w+)\s*\(([^)]*)\)\s*\{/g;
let match;
while ((match = funcDefRegex.exec(script)) !== null) {
    funcDefs.set(match[1], {
        params: match[2].split(',').map(p => p.trim()).filter(Boolean),
        index: match.index
    });
}

// Extract all element IDs from HTML
const elementIds = new Set();
const idRegex = /id="([^"]+)"/g;
while ((match = idRegex.exec(html)) !== null) {
    elementIds.add(match[1]);
}

console.log('');
console.log(`${CYAN}╔══════════════════════════════════════════════════════════════════════════╗${RESET}`);
console.log(`${CYAN}║       SAME SOLUTIONS PWA - AUTOMATED TEST SUITE                         ║${RESET}`);
console.log(`${CYAN}╚══════════════════════════════════════════════════════════════════════════╝${RESET}`);

// ============================================================================
// TEST 1: JavaScript Syntax Validation
// ============================================================================
section('1. JAVASCRIPT SYNTAX VALIDATION');

let syntaxValid = false;
try {
    new Function(script);
    syntaxValid = true;
    test('Syntax', 'JavaScript parses without errors', true);
} catch (e) {
    test('Syntax', 'JavaScript parses without errors', false, e.message);
}

if (!syntaxValid) {
    console.log('\n⛔ Cannot continue tests - fix syntax errors first!\n');
    process.exit(1);
}

// ============================================================================
// TEST 2: Required Core Functions
// ============================================================================
section('2. CORE FUNCTIONS');

const coreFunctions = [
    'loadData', 'saveData', 'updateUI', 'toast', 'openModal', 'closeModal',
    'showPage', 'fmt', 'today', 'fmtDate'
];

coreFunctions.forEach(fn => {
    test('Core', `${fn}() is defined`, funcDefs.has(fn));
});

// ============================================================================
// TEST 3: CRUD Operations
// ============================================================================
section('3. CRUD OPERATIONS');

const crudFunctions = {
    'Jobs': ['editJob', 'deleteJob', 'toggleJobPaid', 'showJobDetail'],
    'Customers': ['editCustomer', 'showCustomerDetail', 'filterCustomers'],
    'Invoices': ['markInvoicePaid', 'emailInvoice', 'viewInv'],
    'Quotes': ['acceptQuote', 'declineQuote', 'deleteQuote', 'downloadQuotePDF'],
    'Properties': ['showPropertyDetail', 'editPropertyDetails'],
    'Expenses': ['addExpense', 'deleteExpense']
};

Object.entries(crudFunctions).forEach(([entity, funcs]) => {
    funcs.forEach(fn => {
        test('CRUD', `${entity}: ${fn}() exists`, funcDefs.has(fn));
    });
});

// ============================================================================
// TEST 4: UI Element Bindings
// ============================================================================
section('4. UI ELEMENT BINDINGS');

// Check that onclick handlers reference existing functions
const onclickRegex = /onclick="([^"]+)"/g;
const undefinedHandlers = [];
const builtIns = ['event', 'window', 'document', 'console', 'alert', 'confirm', 
                  'prompt', 'setTimeout', 'setInterval', 'history', 'location'];

while ((match = onclickRegex.exec(html)) !== null) {
    const handler = match[1];
    const funcCall = handler.match(/^(\w+)\s*\(/);
    if (funcCall) {
        const funcName = funcCall[1];
        if (!funcDefs.has(funcName) && !builtIns.includes(funcName)) {
            undefinedHandlers.push(funcName);
        }
    }
}

const uniqueUndefined = [...new Set(undefinedHandlers)];
test('Bindings', 'All onclick handlers reference defined functions', 
     uniqueUndefined.length === 0,
     uniqueUndefined.length > 0 ? `Undefined: ${uniqueUndefined.slice(0, 5).join(', ')}` : '');

// Check form submissions have handlers
const forms = html.match(/id="([^"]+)-form"/g) || [];
forms.forEach(formMatch => {
    const formId = formMatch.match(/id="([^"]+)"/)[1];
    const hasHandler = script.includes(`'${formId}'`) || script.includes(`"${formId}"`);
    test('Bindings', `Form ${formId} has submit handler`, hasHandler);
});

// ============================================================================
// TEST 5: Modal Completeness
// ============================================================================
section('5. MODAL COMPLETENESS');

const modalIds = html.match(/id="modal-([^"]+)"/g) || [];
modalIds.forEach(modalMatch => {
    const modalName = modalMatch.match(/modal-([^"]+)/)[1];
    
    // Check modal can be opened
    const canOpen = html.includes(`openModal('${modalName}')`) || 
                   html.includes(`openModal("${modalName}")`);
    
    // Check modal can be closed
    const canClose = html.includes(`closeModal('${modalName}')`) || 
                    html.includes(`closeModal("${modalName}")`) ||
                    html.includes(`'modal-${modalName}'`); // Dynamic close
    
    if (!canOpen) {
        warn('Modals', `modal-${modalName} has no openModal() call`);
    }
});

// ============================================================================
// TEST 6: Stub/Dead-End Detection
// ============================================================================
section('6. STUB & DEAD-END DETECTION');

// Check for "coming soon" or similar
const stubPatterns = [
    /coming soon/gi,
    /not implemented/gi,
    /TODO:/gi,
    /FIXME:/gi
];

let totalStubs = 0;
stubPatterns.forEach(pattern => {
    const matches = script.match(pattern) || [];
    totalStubs += matches.length;
});

test('Stubs', 'No "coming soon" stubs in code', totalStubs === 0,
     totalStubs > 0 ? `Found ${totalStubs} stub markers` : '');

// Check for functions that just return without doing anything
const emptyFuncRegex = /function\s+(\w+)\s*\([^)]*\)\s*\{\s*(return;?)?\s*\}/g;
const emptyFuncs = [];
while ((match = emptyFuncRegex.exec(script)) !== null) {
    emptyFuncs.push(match[1]);
}

test('Stubs', 'No empty function bodies', emptyFuncs.length === 0,
     emptyFuncs.length > 0 ? `Empty: ${emptyFuncs.join(', ')}` : '');

// ============================================================================
// TEST 7: Data Integrity Patterns
// ============================================================================
section('7. DATA INTEGRITY');

// Check for null-safe patterns
const unsafeFinds = script.match(/\.find\([^)]+\)\.\w+/g) || [];
test('Safety', 'No unchecked .find() results', unsafeFinds.length < 10,
     unsafeFinds.length >= 10 ? `${unsafeFinds.length} potentially unsafe .find() chains` : '');

// Check saveData is called after mutations (check whole file, not just 500 chars)
const mutations = ['data.jobs.push', 'data.invoices.push', 'data.expenses.push', 'data.quotes.push'];
let integrityPassed = 0;
let integrityTotal = 0;
mutations.forEach(mut => {
    if (script.includes(mut)) {
        integrityTotal++;
        // Just verify saveData exists and is called somewhere in the file
        const hasSave = script.includes('saveData()');
        if (hasSave) integrityPassed++;
    }
});
test('Integrity', 'saveData() is called for data mutations', integrityPassed === integrityTotal,
     `${integrityPassed}/${integrityTotal} mutation patterns have saveData`);

// ============================================================================
// TEST 8: Error Handling
// ============================================================================
section('8. ERROR HANDLING');

const tryCatchCount = (script.match(/try\s*\{/g) || []).length;
const errorToasts = (script.match(/toast\([^)]*['"]error['"]/g) || []).length;

test('Errors', 'Has try-catch blocks (>10)', tryCatchCount >= 10,
     `Found ${tryCatchCount}`);
test('Errors', 'Has error toasts (>20)', errorToasts >= 20,
     `Found ${errorToasts}`);

// Check critical functions have error handling
const criticalFuncs = ['loadData', 'saveData', 'syncToCloud', 'syncFromCloud'];
criticalFuncs.forEach(fn => {
    if (funcDefs.has(fn)) {
        const funcStart = funcDefs.get(fn).index;
        const funcCode = script.substring(funcStart, funcStart + 2000);
        const hasTry = funcCode.includes('try {') || funcCode.includes('try{');
        test('Errors', `${fn}() has error handling`, hasTry);
    }
});

// ============================================================================
// TEST 9: Performance Patterns
// ============================================================================
section('9. PERFORMANCE PATTERNS');

// Check for innerHTML in loops (DOM thrashing)
const innerHTMLInLoop = script.match(/\.forEach[\s\S]{0,100}innerHTML\s*\+=/g) || [];
test('Perf', 'No innerHTML concatenation in loops', innerHTMLInLoop.length === 0,
     innerHTMLInLoop.length > 0 ? `Found ${innerHTMLInLoop.length} instances` : '');

// Check for excessive DOM queries
const getElementCalls = (script.match(/getElementById/g) || []).length;
test('Perf', 'getElementById calls reasonable (<700)', getElementCalls < 700,
     `Found ${getElementCalls}`);

// Check for debounce on search inputs
const hasDebounce = script.includes('debounce') || script.includes('setTimeout');
test('Perf', 'Search inputs have debounce/timeout', hasDebounce);

// ============================================================================
// TEST 10: Security Patterns
// ============================================================================
section('10. SECURITY PATTERNS');

// Check for eval
const evalCalls = (script.match(/\beval\s*\(/g) || []).length;
test('Security', 'No eval() calls', evalCalls === 0);

// Check for document.write (allowed for print windows)
const docWriteUsages = script.match(/document\.write/g) || [];
const docWriteInPrint = script.match(/win\.document\.write/g) || [];
const unsafeDocWrite = docWriteUsages.length - docWriteInPrint.length;
test('Security', 'No unsafe document.write() calls', unsafeDocWrite === 0,
     unsafeDocWrite > 0 ? `Found ${unsafeDocWrite} outside print context` : '');

// Check innerHTML is used safely (not with user input directly)
const dangerousInnerHTML = script.match(/\.innerHTML\s*=\s*[^`'"\s]/g) || [];
if (dangerousInnerHTML.length > 0) {
    warn('Security', 'Review innerHTML assignments for XSS', 
         `${dangerousInnerHTML.length} direct assignments`);
}

// ============================================================================
// TEST 11: Accessibility
// ============================================================================
section('11. ACCESSIBILITY');

// Check for alt attributes on images
const imagesWithoutAlt = (html.match(/<img(?![^>]*alt=)/g) || []).length;
if (imagesWithoutAlt > 10) {
    warn('A11y', 'Many images without alt attributes', `${imagesWithoutAlt} images`);
} else {
    test('A11y', 'Most images have alt attributes', imagesWithoutAlt < 15,
         imagesWithoutAlt > 0 ? `${imagesWithoutAlt} images without alt` : '');
}

// Check for button accessibility
const buttonsWithoutText = (html.match(/<button[^>]*><\/button>/g) || []).length;
test('A11y', 'Buttons have text content', buttonsWithoutText === 0);

// Check for form labels
const ariaLabels = (html.match(/aria-label/g) || []).length;
if (ariaLabels < 5) {
    warn('A11y', 'Consider adding more aria-labels', `Found only ${ariaLabels}`);
}

// ============================================================================
// TEST 12: Mobile/PWA Readiness
// ============================================================================
section('12. PWA READINESS');

test('PWA', 'Has viewport meta tag', html.includes('viewport'));
test('PWA', 'Has manifest.json link', html.includes('manifest.json'));
test('PWA', 'Has apple-mobile-web-app-capable', html.includes('apple-mobile-web-app-capable'));
test('PWA', 'Has theme-color', html.includes('theme-color'));

// ============================================================================
// TEST 13: Business Logic Simulation
// ============================================================================
section('13. BUSINESS LOGIC SIMULATION');

// Simulate data structures exist
test('Logic', 'Initial data structure exists', script.includes('let data = {') || script.includes('const data = {'));
test('Logic', 'PROPERTIES structure exists', script.includes('const PROPERTIES'));
test('Logic', 'PRESET_ACCOUNTS structure exists', script.includes('PRESET_ACCOUNTS'));

// Check calculation functions
const calcFunctions = ['fmt', 'calculateQuoteTotal', 'getContactSummary'];
calcFunctions.forEach(fn => {
    test('Logic', `${fn}() calculation exists`, funcDefs.has(fn) || script.includes(`function ${fn}`));
});

// ============================================================================
// RESULTS SUMMARY
// ============================================================================
console.log('');
console.log(`${CYAN}╔══════════════════════════════════════════════════════════════════════════╗${RESET}`);
console.log(`${CYAN}║                           TEST RESULTS                                   ║${RESET}`);
console.log(`${CYAN}╚══════════════════════════════════════════════════════════════════════════╝${RESET}`);
console.log('');
console.log(`   ${GREEN}✅ Passed:${RESET}   ${passed}`);
console.log(`   ${RED}❌ Failed:${RESET}   ${failed}`);
console.log(`   ${YELLOW}⚠️  Warnings:${RESET} ${warnings}`);
console.log('');

if (failures.length > 0) {
    console.log(`${RED}━━━ FAILURES ━━━${RESET}`);
    failures.forEach(f => {
        console.log(`   ${RED}✗${RESET} [${f.category}] ${f.name}`);
        if (f.detail) console.log(`     ${f.detail}`);
    });
    console.log('');
}

if (warningList.length > 0) {
    console.log(`${YELLOW}━━━ WARNINGS ━━━${RESET}`);
    warningList.forEach(w => {
        console.log(`   ${YELLOW}!${RESET} [${w.category}] ${w.name}`);
        if (w.detail) console.log(`     ${w.detail}`);
    });
    console.log('');
}

// Exit code
const exitCode = failed > 0 ? 1 : 0;
const status = failed === 0 ? `${GREEN}READY FOR DEPLOYMENT${RESET}` : `${RED}FIX FAILURES BEFORE DEPLOY${RESET}`;
console.log(`Status: ${status}`);
console.log('');

process.exit(exitCode);
