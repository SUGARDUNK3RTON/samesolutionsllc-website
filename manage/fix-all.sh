#!/bin/bash
# Same Solutions PWA - Automated Fix Script
# Applies all standard fixes in one pass

FILE="$1"
if [ -z "$FILE" ]; then
    echo "Usage: ./fix-all.sh <path-to-index.html>"
    exit 1
fi

echo "═══════════════════════════════════════════════════════════════════════════════"
echo "  AUTOMATED FIX SCRIPT - Applying all fixes"
echo "═══════════════════════════════════════════════════════════════════════════════"

# Count changes
CHANGES=0

# ============================================================================
# FIX 1: Add success parameter to toast calls
# ============================================================================
echo -n "Adding success toasts... "
BEFORE=$(grep -c "toast('" "$FILE")
sed -i \
    -e "s/toast('Job added!'/toast('Job added!', 'success'/g" \
    -e "s/toast('Customer added'/toast('Customer added', 'success'/g" \
    -e "s/toast('Expense added'/toast('Expense added', 'success'/g" \
    -e "s/toast('Invoice generated'/toast('Invoice generated', 'success'/g" \
    -e "s/toast('Quote saved'/toast('Quote saved', 'success'/g" \
    -e "s/toast('Data imported'/toast('Data imported', 'success'/g" \
    -e "s/toast('Backup created'/toast('Backup created', 'success'/g" \
    -e "s/toast('Settings saved'/toast('Settings saved', 'success'/g" \
    -e "s/toast('Mileage added'/toast('Mileage added', 'success'/g" \
    -e "s/toast('Part added'/toast('Part added', 'success'/g" \
    -e "s/toast('System saved'/toast('System saved', 'success'/g" \
    -e "s/toast('Issue saved'/toast('Issue saved', 'success'/g" \
    -e "s/toast('Photo saved'/toast('Photo saved', 'success'/g" \
    -e "s/toast('Appliance saved'/toast('Appliance saved', 'success'/g" \
    "$FILE"
AFTER=$(grep -c "toast.*success" "$FILE")
echo "done (+$((AFTER - 8)) success toasts)"
((CHANGES++))

# ============================================================================
# FIX 2: Add aria-labels to icon-only buttons  
# ============================================================================
echo -n "Adding ARIA labels... "
sed -i \
    -e 's/onclick="editJob(/aria-label="Edit job" onclick="editJob(/g' \
    -e 's/onclick="deleteJob(/aria-label="Delete job" onclick="deleteJob(/g' \
    -e 's/onclick="viewJob(/aria-label="View job" onclick="viewJob(/g' \
    -e 's/onclick="editCustomer(/aria-label="Edit customer" onclick="editCustomer(/g' \
    -e 's/onclick="editExpense(/aria-label="Edit expense" onclick="editExpense(/g' \
    -e 's/onclick="deleteExpense(/aria-label="Delete expense" onclick="deleteExpense(/g' \
    -e 's/onclick="editQuote(/aria-label="Edit quote" onclick="editQuote(/g' \
    -e 's/onclick="deleteQuote(/aria-label="Delete quote" onclick="deleteQuote(/g' \
    "$FILE"
echo "done"
((CHANGES++))

# ============================================================================
# FIX 3: Add alt attributes to remaining images
# ============================================================================
echo -n "Adding image alt attributes... "
sed -i \
    -e 's/<img src="\${/<img alt="Image" src="${/g' \
    -e 's/alt="Image" src="\${p\.image}"/alt="Property photo" src="${p.image}"/g' \
    -e 's/alt="Image" src="\${photo/alt="Photo" src="${photo/g' \
    "$FILE"
echo "done"
((CHANGES++))

# ============================================================================
# FIX 4: Add FileReader error handlers
# ============================================================================
echo -n "Adding FileReader error handlers... "
# This is complex - needs manual review
echo "skipped (requires manual)"

# ============================================================================
# FIX 5: Empty states for lists
# ============================================================================
echo -n "Improving empty states... "
sed -i \
    -e "s/No jobs found/No jobs yet. Click '➕ Add Job' to get started!/g" \
    -e "s/No customers found/No customers yet. Add your first customer!/g" \
    -e "s/No invoices/No invoices yet/g" \
    -e "s/No expenses/No expenses yet/g" \
    -e "s/No quotes/No quotes yet/g" \
    "$FILE"
echo "done"
((CHANGES++))

echo ""
echo "═══════════════════════════════════════════════════════════════════════════════"
echo "  COMPLETE: $CHANGES fix categories applied"
echo "═══════════════════════════════════════════════════════════════════════════════"
