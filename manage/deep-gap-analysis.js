#!/usr/bin/env node
/**
 * DEEP GAP ANALYSIS - Finding issues the first analysis missed
 * This runs after the initial feature tests to find second-order problems
 */

const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, '..', 'src', 'index.html');
const html = fs.readFileSync(indexPath, 'utf8');
const script = html.match(/<script>([\s\S]*?)<\/script>/)[1];

const gaps = { critical: [], important: [], minor: [], analysis: [] };

function gap(severity, category, issue, evidence, recommendation) {
    gaps[severity].push({ category, issue, evidence, recommendation });
}

function analysisFinding(finding, data) {
    gaps.analysis.push({ finding, data });
}

console.log('\x1b[1m\x1b[43m═══════════════════════════════════════════════════════════════════════════════\x1b[0m');
console.log('\x1b[1m\x1b[43m  DEEP GAP ANALYSIS - Finding What We Missed                                  \x1b[0m');
console.log('\x1b[1m\x1b[43m═══════════════════════════════════════════════════════════════════════════════\x1b[0m');

// ============================================================================
// SECTION 1: DATA CONSISTENCY GAPS
// ============================================================================
console.log('\n\x1b[1m━━━ DATA CONSISTENCY ANALYSIS ━━━\x1b[0m');

// Check if all CRUD operations exist for each entity
const entities = ['customer', 'job', 'invoice', 'quote', 'expense', 'mileage', 'appliance', 'vehicle'];
const operations = ['add', 'edit', 'delete', 'view'];

entities.forEach(entity => {
    const hasAdd = script.includes(`add${entity.charAt(0).toUpperCase() + entity.slice(1)}`) || 
                   script.includes(`save${entity.charAt(0).toUpperCase() + entity.slice(1)}`);
    const hasEdit = script.includes(`edit${entity.charAt(0).toUpperCase() + entity.slice(1)}`) ||
                    script.includes(`update${entity.charAt(0).toUpperCase() + entity.slice(1)}`);
    const hasDelete = script.includes(`delete${entity.charAt(0).toUpperCase() + entity.slice(1)}`) ||
                      script.includes(`remove${entity.charAt(0).toUpperCase() + entity.slice(1)}`);
    
    if (!hasAdd) gap('important', 'CRUD', `Missing ADD for ${entity}`, 'No add function found', `Add add${entity.charAt(0).toUpperCase() + entity.slice(1)}()`);
    if (!hasEdit) gap('minor', 'CRUD', `Missing EDIT for ${entity}`, 'No edit function found', `Add edit${entity.charAt(0).toUpperCase() + entity.slice(1)}()`);
    if (!hasDelete) gap('minor', 'CRUD', `Missing DELETE for ${entity}`, 'No delete function found', `Add delete${entity.charAt(0).toUpperCase() + entity.slice(1)}()`);
    
    const complete = hasAdd && hasEdit && hasDelete;
    console.log(`   ${complete ? '✅' : '⚠️'} ${entity}: Add=${hasAdd?'✓':'✗'} Edit=${hasEdit?'✓':'✗'} Delete=${hasDelete?'✓':'✗'}`);
});

// ============================================================================
// SECTION 2: UI/UX GAPS
// ============================================================================
console.log('\n\x1b[1m━━━ UI/UX ANALYSIS ━━━\x1b[0m');

// Check for loading states
const hasLoadingStates = script.includes('loading') && (script.includes('spinner') || script.includes('Loading'));
console.log(`   ${hasLoadingStates ? '✅' : '⚠️'} Loading states for async operations`);
if (!hasLoadingStates) gap('important', 'UX', 'No loading indicators', 'Users don\'t know when operations are processing', 'Add loading spinners for API calls');

// Check for empty states
const hasEmptyStates = script.includes('No ') && script.includes(' yet');
console.log(`   ${hasEmptyStates ? '✅' : '⚠️'} Empty state messages`);

// Check for confirmation dialogs
const hasConfirmations = script.includes('confirm(') || script.includes('confirmDelete');
console.log(`   ${hasConfirmations ? '✅' : '⚠️'} Confirmation dialogs for destructive actions`);

// Check for form validation feedback
const hasValidationFeedback = script.includes('required') && script.includes('toast(');
console.log(`   ${hasValidationFeedback ? '✅' : '✓'} Form validation feedback`);

// Check for keyboard navigation
const hasKeyboardNav = html.includes('tabindex') || html.includes('onkeypress') || html.includes('onkeydown');
console.log(`   ${hasKeyboardNav ? '✅' : '⚠️'} Keyboard navigation support`);
if (!hasKeyboardNav) gap('minor', 'Accessibility', 'Limited keyboard navigation', 'Users can\'t navigate with keyboard alone', 'Add tabindex and key handlers');

// ============================================================================
// SECTION 3: DATA VALIDATION GAPS
// ============================================================================
console.log('\n\x1b[1m━━━ DATA VALIDATION ANALYSIS ━━━\x1b[0m');

// Check for email validation
const hasEmailValidation = script.includes('@') && (script.includes('email') && (script.includes('.includes') || script.includes('match')));
console.log(`   ${hasEmailValidation ? '✅' : '⚠️'} Email format validation`);
if (!hasEmailValidation) gap('important', 'Validation', 'No email format validation', 'Invalid emails could be saved', 'Add email regex validation');

// Check for phone validation
const hasPhoneValidation = script.includes('phone') && script.includes('replace');
console.log(`   ${hasPhoneValidation ? '✅' : '⚠️'} Phone number formatting`);

// Check for date validation
const hasDateValidation = script.includes('new Date') && script.includes('Invalid');
console.log(`   ${hasDateValidation ? '✅' : '⚠️'} Date validation`);

// Check for amount validation
const hasAmountValidation = script.includes('parseFloat') && (script.includes('isNaN') || script.includes('> 0'));
console.log(`   ${hasAmountValidation ? '✅' : '⚠️'} Amount/number validation`);

// ============================================================================
// SECTION 4: ERROR RECOVERY GAPS
// ============================================================================
console.log('\n\x1b[1m━━━ ERROR RECOVERY ANALYSIS ━━━\x1b[0m');

// Check for retry mechanisms
const hasRetry = script.includes('retry') || script.includes('Retry');
console.log(`   ${hasRetry ? '✅' : '⚠️'} Retry mechanism for failed operations`);
if (!hasRetry) gap('minor', 'Reliability', 'No retry mechanism', 'Failed operations require manual retry', 'Add automatic retry for network failures');

// Check for data recovery
const hasDataRecovery = script.includes('backup') && script.includes('restore');
console.log(`   ${hasDataRecovery ? '✅' : '⚠️'} Data backup/restore capability`);

// Check for undo functionality
const hasUndo = script.includes('undo') || script.includes('Undo');
console.log(`   ${hasUndo ? '✅' : '⚠️'} Undo functionality`);
if (!hasUndo) gap('minor', 'UX', 'No undo functionality', 'Mistakes require manual correction', 'Consider adding undo for recent actions');

// ============================================================================
// SECTION 5: BUSINESS LOGIC GAPS
// ============================================================================
console.log('\n\x1b[1m━━━ BUSINESS LOGIC ANALYSIS ━━━\x1b[0m');

// Check for duplicate prevention
const hasDuplicateCheck = script.includes('already exists') || script.includes('duplicate');
console.log(`   ${hasDuplicateCheck ? '✅' : '⚠️'} Duplicate entry prevention`);
if (!hasDuplicateCheck) gap('important', 'Data Quality', 'No duplicate checking', 'Same customer/job could be entered twice', 'Add duplicate detection');

// Check for invoice sequence integrity
const hasInvoiceSequence = script.includes('invoiceCounter') && script.includes('getNextInvoiceNumber');
console.log(`   ${hasInvoiceSequence ? '✅' : '⚠️'} Invoice number sequence integrity`);

// Check for balance calculations
const hasBalanceCalc = script.includes('getContactBalance') || script.includes('balance');
console.log(`   ${hasBalanceCalc ? '✅' : '⚠️'} Customer balance calculations`);

// Check for payment reconciliation
const hasReconciliation = script.includes('reconcile') || (script.includes('paid') && script.includes('owed'));
console.log(`   ${hasReconciliation ? '✅' : '⚠️'} Payment status tracking`);

// ============================================================================
// SECTION 6: DOCUMENTATION AUTO-LOOKUP GAPS
// ============================================================================
console.log('\n\x1b[1m━━━ DOCUMENTATION LOOKUP ANALYSIS ━━━\x1b[0m');

// Check what types have auto-lookup
const hasApplianceLookup = script.includes('lookupItemManuals') || script.includes('performComprehensiveLookup');
const hasVehicleLookup = script.includes('vpic.nhtsa.dot.gov') || script.includes('decodeVIN');
const hasRecLookup = script.includes('lookupRecreational') || script.includes('recreational') && script.includes('manual');

console.log(`   ${hasApplianceLookup ? '✅' : '❌'} Appliance manual auto-lookup`);
console.log(`   ${hasVehicleLookup ? '✅' : '❌'} Vehicle VIN decode`);
console.log(`   ${hasRecLookup ? '✅' : '⚠️'} Recreational equipment lookup`);

if (!hasRecLookup) gap('important', 'Feature', 'No auto-lookup for recreational equipment', 'Boats/jetskis don\'t auto-find manuals', 'Add manual lookup for rec equipment like appliances');

// ============================================================================
// SECTION 7: REPORT/EXPORT GAPS
// ============================================================================
console.log('\n\x1b[1m━━━ REPORTING ANALYSIS ━━━\x1b[0m');

const hasInvoicePDF = script.includes('html2pdf') || script.includes('generatePDF');
const hasDataExport = script.includes('exportData') || script.includes('download');
const hasPrintView = script.includes('print') || html.includes('@media print');
const hasReports = script.includes('report') || script.includes('Report');

console.log(`   ${hasInvoicePDF ? '✅' : '⚠️'} Invoice PDF generation`);
console.log(`   ${hasDataExport ? '✅' : '⚠️'} Data export functionality`);
console.log(`   ${hasPrintView ? '✅' : '⚠️'} Print-friendly views`);
console.log(`   ${hasReports ? '✅' : '⚠️'} Business reports (revenue, etc.)`);

// ============================================================================
// SECTION 8: MOBILE/RESPONSIVE GAPS
// ============================================================================
console.log('\n\x1b[1m━━━ MOBILE/RESPONSIVE ANALYSIS ━━━\x1b[0m');

const hasViewport = html.includes('viewport');
const hasMediaQueries = html.includes('@media');
const hasTouchTargets = html.includes('min-height: 44px') || html.includes('min-height:44px');
const hasSwipe = script.includes('touch') || script.includes('swipe');

console.log(`   ${hasViewport ? '✅' : '❌'} Viewport meta tag`);
console.log(`   ${hasMediaQueries ? '✅' : '⚠️'} Responsive media queries`);
console.log(`   ${hasTouchTargets ? '✅' : '⚠️'} Touch-friendly targets (44px min)`);
console.log(`   ${hasSwipe ? '✅' : '⚠️'} Touch/swipe gestures`);

// ============================================================================
// SECTION 9: SECURITY GAPS
// ============================================================================
console.log('\n\x1b[1m━━━ SECURITY ANALYSIS ━━━\x1b[0m');

const hasInputSanitization = script.includes('trim()') && script.includes('replace');
const hasXSSPrevention = !script.includes('innerHTML = ') || script.includes('textContent');
const hasCSRF = script.includes('csrf') || script.includes('token');
const hasRateLimit = script.includes('rateLimit') || script.includes('throttle');

console.log(`   ${hasInputSanitization ? '✅' : '⚠️'} Input sanitization`);
console.log(`   ${!script.includes('eval(') ? '✅' : '❌'} No eval() usage`);
console.log(`   ${hasRateLimit ? '✅' : '⚠️'} Rate limiting`);

if (!hasRateLimit) gap('minor', 'Security', 'No rate limiting', 'Potential for API abuse', 'Add throttling for repeated actions');

// ============================================================================
// SECTION 10: SYNC/OFFLINE GAPS
// ============================================================================
console.log('\n\x1b[1m━━━ SYNC/OFFLINE ANALYSIS ━━━\x1b[0m');

const hasOfflineIndicator = script.includes('navigator.onLine') || script.includes('offline');
const hasQueuedSync = script.includes('queue') && script.includes('sync');
const hasConflictResolution = script.includes('conflict') || script.includes('merge');
const hasLastSync = script.includes('lastSync') || script.includes('syncTime');

console.log(`   ${hasOfflineIndicator ? '✅' : '⚠️'} Offline status indicator`);
console.log(`   ${hasQueuedSync ? '✅' : '⚠️'} Queued sync for offline changes`);
console.log(`   ${hasConflictResolution ? '✅' : '⚠️'} Sync conflict resolution`);
console.log(`   ${hasLastSync ? '✅' : '⚠️'} Last sync timestamp display`);

if (!hasConflictResolution) gap('important', 'Sync', 'No conflict resolution', 'Changes from multiple devices could overwrite each other', 'Add merge strategy for concurrent edits');

// ============================================================================
// ANALYSIS SUMMARY
// ============================================================================
console.log('\n\x1b[1m═══════════════════════════════════════════════════════════════════════════════\x1b[0m');
console.log('\x1b[1m  DEEP GAP ANALYSIS RESULTS\x1b[0m');
console.log('\x1b[1m═══════════════════════════════════════════════════════════════════════════════\x1b[0m\n');

console.log(`   \x1b[31m🔴 Critical Gaps:\x1b[0m    ${gaps.critical.length}`);
console.log(`   \x1b[33m🟡 Important Gaps:\x1b[0m   ${gaps.important.length}`);
console.log(`   \x1b[36m🔵 Minor Gaps:\x1b[0m       ${gaps.minor.length}`);
console.log(`   \x1b[90m   Total:\x1b[0m            ${gaps.critical.length + gaps.important.length + gaps.minor.length}`);

if (gaps.critical.length > 0) {
    console.log('\n\x1b[31m   CRITICAL GAPS (must fix):\x1b[0m');
    gaps.critical.forEach(g => console.log(`   → ${g.category}: ${g.issue}`));
}

if (gaps.important.length > 0) {
    console.log('\n\x1b[33m   IMPORTANT GAPS (should fix):\x1b[0m');
    gaps.important.forEach(g => console.log(`   → ${g.category}: ${g.issue}`));
}

if (gaps.minor.length > 0) {
    console.log('\n\x1b[36m   MINOR GAPS (nice to have):\x1b[0m');
    gaps.minor.forEach(g => console.log(`   → ${g.category}: ${g.issue}`));
}

// Save results
fs.writeFileSync(path.join(__dirname, 'deep-gap-analysis.json'), JSON.stringify({
    timestamp: new Date().toISOString(),
    critical: gaps.critical,
    important: gaps.important,
    minor: gaps.minor,
    totals: {
        critical: gaps.critical.length,
        important: gaps.important.length,
        minor: gaps.minor.length
    }
}, null, 2));

console.log('\n');
