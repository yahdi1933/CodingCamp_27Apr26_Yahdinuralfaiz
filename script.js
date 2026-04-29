// Mengambil data dari LocalStorage saat load
let transactions = JSON.parse(localStorage.getItem('transactions')) || [];

const form = document.getElementById('transaction-form');
const list = document.getElementById('transaction-list');
const balanceDisplay = document.getElementById('total-balance');

let expenseChart = null;

function updateUI() {
    list.innerHTML = '';
    let total = 0;

    transactions.forEach((t, index) => {
        total += parseFloat(t.amount);

        // Buat elemen daftar dengan tombol hapus
        const li = document.createElement('li');
        li.innerHTML = `${t.name} - Rp${t.amount} (${t.category}) 
                        <button onclick="deleteTransaction(${index})">Hapus</button>`;
        list.appendChild(li);
    });

    balanceDisplay.innerText = total.toLocaleString('id-ID');
    updateChart(); // Update grafik otomatis
    localStorage.setItem('transactions', JSON.stringify(transactions));
}

function addTransaction(e) {
    e.preventDefault();

    const newTransaction = {
        name: document.getElementById('item-name').value,
        amount: document.getElementById('item-amount').value,
        category: document.getElementById('item-category').value
    };

    transactions.push(newTransaction);
    form.reset();
    updateUI();
}

function deleteTransaction(index) {
    transactions.splice(index, 1);
    updateUI();
}

form.addEventListener('submit', addTransaction);
updateUI();

// Chart.js - Grafik lingkaran per kategori
function updateChart() {
    const categoryTotals = {};

    transactions.forEach((t) => {
        const amount = parseFloat(t.amount);
        if (categoryTotals[t.category]) {
            categoryTotals[t.category] += amount;
        } else {
            categoryTotals[t.category] = amount;
        }
    });

    const labels = Object.keys(categoryTotals);
    const data = Object.values(categoryTotals);

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
                    '#FF6384',
                    '#36A2EB',
                    '#FFCE56',
                    '#4BC0C0',
                    '#9966FF'
                ]
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}
