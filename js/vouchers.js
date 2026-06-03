// js/vouchers.js - Voucher management system

let selectedVoucherCode = null;
let selectedVoucherInfo = null;
let userVouchers = [];

/**
 * Load user vouchers from server
 */
export async function loadUserVouchers(uid) {
    try {
        // Placeholder: In production this would fetch from server
        userVouchers = [];
        renderVoucherList([]);
    } catch (error) {
        console.warn('⚠️ Could not load vouchers:', error);
        renderVoucherList([]);
    }
}

/**
 * Render voucher list into the DOM
 */
function renderVoucherList(vouchers) {
    const voucherListEl = document.getElementById('voucherList');
    if (!voucherListEl) return;

    if (!vouchers || vouchers.length === 0) {
        voucherListEl.innerHTML = '<div style="color: rgba(255,255,255,0.5); font-size: 0.85em; font-style: italic;">Tidak ada voucher tersedia</div>';
        return;
    }

    voucherListEl.innerHTML = vouchers.map(v => `
        <div class="voucher-item" data-code="${v.code}" style="
            padding: 8px 12px; 
            margin-bottom: 8px; 
            border: 1px solid rgba(255,255,255,0.2); 
            border-radius: 8px; 
            cursor: pointer; 
            background: rgba(255,255,255,0.05);
            transition: all 0.2s ease;
        ">
            <div style="font-weight: 600; color: #fff; font-size: 0.9em;">${v.code}</div>
            <div style="color: rgba(255,255,255,0.7); font-size: 0.8em;">${v.description || 'Diskon ' + v.discount}</div>
        </div>
    `).join('');

    // Add click listeners
    voucherListEl.querySelectorAll('.voucher-item').forEach(item => {
        item.addEventListener('click', () => {
            const code = item.dataset.code;
            selectVoucher(code, vouchers.find(v => v.code === code));
        });
    });
}

/**
 * Select a voucher
 */
function selectVoucher(code, voucherData) {
    selectedVoucherCode = code;
    selectedVoucherInfo = voucherData;
    updateVoucherResult();
}

/**
 * Update the voucher result display
 */
function updateVoucherResult() {
    const voucherResult = document.getElementById('voucherResult');
    if (!voucherResult) return;

    if (selectedVoucherCode && selectedVoucherInfo) {
        voucherResult.innerHTML = `✅ Voucher <strong>${selectedVoucherCode}</strong> diterapkan`;
        voucherResult.style.color = '#4ecdc4';
    } else {
        voucherResult.innerHTML = '';
    }
}

/**
 * Setup voucher listeners (called from sphere.js)
 */
export function setupVoucherListeners(updateCallback) {
    // Monitor voucher selections and call updateCallback when changed
    const observer = new MutationObserver(() => {
        if (updateCallback) updateCallback();
    });

    const voucherList = document.getElementById('voucherList');
    if (voucherList) {
        observer.observe(voucherList, { childList: true, subtree: true });
    }
}

/**
 * Get the final price after applying vouchers
 */
export function getFinalPrice(basePrice) {
    if (!selectedVoucherInfo) return basePrice;

    const discount = selectedVoucherInfo.discountPercent || 0;
    const discountAmount = selectedVoucherInfo.discountAmount || 0;

    let finalPrice = basePrice;
    if (discount > 0) {
        finalPrice = basePrice * (1 - discount / 100);
    } else if (discountAmount > 0) {
        finalPrice = Math.max(0, basePrice - discountAmount);
    }

    return Math.round(finalPrice);
}

/**
 * Update total price display
 */
export function updateTotalPrice(price) {
    const totalPriceEl = document.getElementById('totalPrice');
    if (totalPriceEl) {
        totalPriceEl.textContent = `Rp${price.toLocaleString('id-ID')}`;
    }
}

/**
 * Get selected voucher code
 */
export function getSelectedVoucherCode() {
    return selectedVoucherCode;
}

/**
 * Get selected voucher info
 */
export function getSelectedVoucherInfo() {
    return selectedVoucherInfo;
}
