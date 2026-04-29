// ===== STATE =====
let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
let categories = JSON.parse(localStorage.getItem('categories')) || ['Makanan', 'Transportasi', 'Hiburan'];
let budgetLimits = JSON.parse(localStorage.getItem('budgetLimits')) || {};
let expenseChart = null;

// ===== DOM ELEMENTS =====
const form = document.getElementById('transaction-form');
const itemName = document.getElementById('item-name');
const itemAmount = document.getElementById('item-amount');
const itemCategory = document.getElementById('item-category');
const transactionList = document.getElementById('transaction-list');
const balanceDisplay = document.getElementById('total-balance');
const sortSelect = document.getElementById('sort-select');
const toggleDark = document.getElementById('toggle-dark');
const customCategoryInput = document.getElementById('custom-category');
const addCategoryBtn = document.getElementById('add-category-btn');
const limitCategory = document.getElementById('limit-category');
const limitAmount = document.getElementById('limit-amount');
const setLimitBtn = document.getElementById('set-limit-btn');
const listEmpty = document.getElementById('list-empty');
const chartEmpty = document.getElementById('chart-empty');

// ===== DARK MODE =====
if (localStorage.getItem('darkMode') === 'true') {
    document.body.classList.add('dark');
    toggleDark.textContent = '☀️';
}

toggleDark.addEventListener('click', () => {
    document.body.classList.toggle('dark');
    const isDark = document.body.classList.contains('dark');
    toggleDark.textContent = isDark ? '☀️' : '🌙';
    localStorage.setItem('darkMode', isDark);
});

// ===== KATEGORI KHUSUS =====
function renderCategoryOptions() {
    // Update form select
    const currentVal = itemCategory.value;
    itemCategory.innerHTML = '<option value="">-- Pilih Kategori --</option>';
    categories.forEach(cat => {
        const opt = document.createElement('option');
        opt.value = cat;
        opt.textContent = cat;
        itemCategory.appendChild(opt);
    });
    itemCategory.value = currentVal;

    // Update limit select
    const currentLimit = limitCategory.value;
    limitCategory.innerHTML = '<option value="">-- Pilih Kategori --</option>';
    categories.forEach(cat => {
        const opt = document.createElement('option');
        opt.value = cat;
        opt.textContent = cat;
        limitCategory.appendChild(opt);
    });
    limitCategory.value = currentLimit;
}

addCategoryBtn.addEventListener('click', () => {
    const newCat = customCategoryInput.value.trim();
    if (!newCat) {
        showToast('Nama kategori tidak boleh kosong!');
        return;
    }
    if (categories.map(c => c.toLowerCase()).includes(newCat.toLowerCase())) {
        showToast('Kategori sudah ada!');
        return;
    }
    categories.push(newCat);
    localStorage.setItem('categories', JSON.stringify(categories));
    renderCategoryOptions();
    customCategoryInput.value = '';
    showToast(`Kategori "${newCat}" berhasil ditambahkan!`);
});

// ===== BATAS PENGELUARAN =====
function renderLimits() {
    const limitList = document.getElementById('limit-list');
    limitList.innerHTML = '';

    if (Object.keys(budgetLimits).length === 0) {
        limitList.innerHTML = '<p style="font-size:0.85rem;color:var(--text-muted)">Belum ada batas yang diset.</p>';
        return;
    }

    const categoryTotals = getCategoryTotals();

    Object.entries(budgetLimits).forEach(([cat, limit]) => {
        const spent = categoryTotals[cat] || 0;
        const isOver = spent > limit;

        const row = document.createElement('div');
        row.className = 'limit-row' + (isOver ? ' over-limit' : '');
        row.innerHTML = `
            <span>${cat}: Rp${spent.toLocaleString('id-ID')} / Rp${limit.toLocaleString('id-ID')} ${isOver ? '⚠️ Melebihi!' : ''}</span>
            <button class="remove-limit" data-cat="${cat}" title="Hapus batas">✕</button>
        `;
        limitList.appendChild(row);
    });

    limitList.querySelectorAll('.remove-limit').forEach(btn => {
        btn.addEventListener('click', () => {
            const cat = btn.dataset.cat;
            delete budgetLimits[cat];
            localStorage.setItem('budgetLimits', JSON.stringify(budgetLimits));
            renderLimits();
        });
    });
}

setLimitBtn.addEventListener('click', () => {
    const cat = limitCategory.value;
    const amount = parseFloat(limitAmount.value);

    if (!cat) {
        showToast('Pilih kategori terlebih dahulu!');
        return;
    }
    if (!amount || amount <= 0) {
        showToast('Masukkan jumlah batas yang valid!');
        return;
    }

    budgetLimits[cat] = amount;
    localStorage.setItem('budgetLimits', JSON.stringify(budgetLimits));
    limitAmount.value = '';
    limitCategory.value = '';
    renderLimits();
    showToast(`Batas untuk "${cat}" diset ke Rp${amount.toLocaleString('id-ID')}`);
});

// ===== HELPER: CATEGORY TOTALS =====
function getCategoryTotals() {
    const totals = {};
    transactions.forEach(t => {
        const amount = parseFloat(t.amount);
        totals[t.category] = (totals[t.category] || 0) + amount;
    });
    return totals;
}

// ===== RINGKASAN BULANAN =====
function renderMonthlySummary() {
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();

    const monthlyTransactions = transactions.filter(t => {
        const d = new Date(t.date);
        return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
    });

    const total = monthlyTransactions.reduce((sum, t) => sum + parseFloat(t.amount), 0);
    document.getElementById('monthly-total').textContent = 'Rp ' + total.toLocaleString('id-ID');

    const catTotals = {};
    monthlyTransactions.forEach(t => {
        catTotals[t.category] = (catTotals[t.category] || 0) + parseFloat(t.amount);
    });

    const container = document.getElementById('monthly-by-category');
    container.innerHTML = '';
    Object.entries(catTotals).forEach(([cat, amount]) => {
        const row = document.createElement('div');
        row.className = 'monthly-cat-row';
        row.innerHTML = `<span>${cat}</span><span>Rp ${amount.toLocaleString('id-ID')}</span>`;
        container.appendChild(row);
    });
}

// ===== CHART =====
function updateChart() {
    const categoryTotals = getCategoryTotals();
    const labels = Object.keys(categoryTotals);
    const data = Object.values(categoryTotals);

    if (labels.length === 0) {
        chartEmpty.style.display = 'block';
        if (expenseChart) {
            expenseChart.destroy();
            expenseChart = null;
        }
        return;
    }

    chartEmpty.style.display = 'none';
    const ctx = document.getElementById('expense-chart').getContext('2d');

    if (expenseChart) {
        expenseChart.destroy();
    }

    expenseChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                label: 'Pengeluaran per Kategori',
                data: data,
                backgroundColor: [
                    '#4f46e5', '#7c3aed', '#ec4899',
                    '#f59e0b', '#10b981', '#3b82f6',
                    '#ef4444', '#14b8a6', '#f97316'
                ]
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { position: 'bottom' },
                tooltip: {
                    callbacks: {
                        label: (ctx) => {
                            const val = ctx.parsed;
                            return ` Rp ${val.toLocaleString('id-ID')}`;
                        }
                    }
                }
            }
        }
    });
}

// ===== RENDER TRANSACTION LIST =====
function getSortedTransactions() {
    const sorted = [...transactions];
    const mode = sortSelect.value;
    if (mode === 'newest') sorted.sort((a, b) => new Date(b.date) - new Date(a.date));
    else if (mode === 'oldest') sorted.sort((a, b) => new Date(a.date) - new Date(b.date));
    else if (mode === 'highest') sorted.sort((a, b) => parseFloat(b.amount) - parseFloat(a.amount));
    else if (mode === 'lowest') sorted.sort((a, b) => parseFloat(a.amount) - parseFloat(b.amount));
    return sorted;
}

function renderTransactionList() {
    transactionList.innerHTML = '';
    const sorted = getSortedTransactions();

    if (sorted.length === 0) {
        listEmpty.style.display = 'block';
        return;
    }
    listEmpty.style.display = 'none';

    sorted.forEach(t => {
        const li = document.createElement('li');
        li.className = 'transaction-item';

        const date = new Date(t.date).toLocaleDateString('id-ID', {
            day: '2-digit', month: 'short', year: 'numeric'
        });

        li.innerHTML = `
            <div class="transaction-info">
                <span class="transaction-name">${t.name}</span>
                <span class="transaction-meta">${t.category} · ${date}</span>
            </div>
            <span class="transaction-amount">Rp ${parseFloat(t.amount).toLocaleString('id-ID')}</span>
            <button class="btn-delete" data-id="${t.id}" title="Hapus">🗑️</button>
        `;
        transactionList.appendChild(li);
    });

    transactionList.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', () => deleteTransaction(btn.dataset.id));
    });
}

// ===== UPDATE BALANCE =====
function updateBalance() {
    const total = transactions.reduce((sum, t) => sum + parseFloat(t.amount), 0);
    balanceDisplay.textContent = 'Rp ' + total.toLocaleString('id-ID');
}

// ===== CHECK BUDGET LIMITS =====
function checkBudgetLimits(category) {
    if (!budgetLimits[category]) return;
    const categoryTotals = getCategoryTotals();
    const spent = categoryTotals[category] || 0;
    const limit = budgetLimits[category];
    if (spent > limit) {
        showToast(`⚠️ Pengeluaran "${category}" melebihi batas! (Rp ${spent.toLocaleString('id-ID')} / Rp ${limit.toLocaleString('id-ID')})`);
    }
}

// ===== FULL UI UPDATE =====
function updateUI() {
    updateBalance();
    renderTransactionList();
    updateChart();
    renderMonthlySummary();
    renderLimits();
    localStorage.setItem('transactions', JSON.stringify(transactions));
}

// ===== ADD TRANSACTION =====
form.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = itemName.value.trim();
    const amount = parseFloat(itemAmount.value);
    const category = itemCategory.value;

    if (!name) { showToast('Nama barang tidak boleh kosong!'); return; }
    if (!amount || amount <= 0) { showToast('Jumlah harus lebih dari 0!'); return; }
    if (!category) { showToast('Pilih kategori terlebih dahulu!'); return; }

    const newTransaction = {
        id: Date.now().toString(),
        name,
        amount,
        category,
        date: new Date().toISOString()
    };

    transactions.push(newTransaction);
    form.reset();
    updateUI();
    checkBudgetLimits(category);
});

// ===== DELETE TRANSACTION =====
function deleteTransaction(id) {
    transactions = transactions.filter(t => t.id !== id);
    updateUI();
}

// ===== SORT =====
sortSelect.addEventListener('change', renderTransactionList);

// ===== TOAST NOTIFICATION =====
function showToast(message) {
    let toast = document.querySelector('.toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.className = 'toast';
        document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
}

// ===== INIT =====
renderCategoryOptions();
updateUI();
