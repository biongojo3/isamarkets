// Data produk
const products = [
    { id: 1, name: "Nasi Goreng", category: "makanan", price: 25000 },
    { id: 2, name: "Mie Goreng", category: "makanan", price: 20000 },
    { id: 3, name: "Ayam Geprek", category: "makanan", price: 18000 },
    { id: 4, name: "Sate Ayam", category: "makanan", price: 30000 },
    { id: 5, name: "Es Teh Manis", category: "minuman", price: 5000 },
    { id: 6, name: "Es Jeruk", category: "minuman", price: 8000 },
    { id: 7, name: "Kopi Hitam", category: "minuman", price: 10000 },
    { id: 8, name: "Jus Alpukat", category: "minuman", price: 15000 },
    { id: 9, name: "Keripik Kentang", category: "snack", price: 12000 },
    { id: 10, name: "Cokelat Batang", category: "snack", price: 8000 },
    { id: 11, name: "Permen Karet", category: "snack", price: 5000 },
    { id: 12, name: "Kacang Goreng", category: "snack", price: 7000 },
    { id: 13, name: "Bakso Malang", category: "makanan", price: 22000 },
    { id: 14, name: "Es Campur", category: "minuman", price: 12000 },
    { id: 15, name: "Donat Cokelat", category: "snack", price: 6000 }
];

// Data keranjang
let cart = [];
let discount = 0;
let transactionCount = 1;

// DOM Elements
const productListElement = document.getElementById('productList');
const cartItemsElement = document.getElementById('cartItems');
const totalItemsElement = document.getElementById('totalItems');
const subtotalElement = document.getElementById('subtotal');
const totalAmountElement = document.getElementById('totalAmount');
const discountInput = document.getElementById('discountInput');
const applyDiscountButton = document.getElementById('applyDiscount');
const amountPaidInput = document.getElementById('amountPaid');
const changeInput = document.getElementById('change');
const calculateChangeButton = document.getElementById('calculateChange');
const processPaymentButton = document.getElementById('processPayment');
const clearCartButton = document.getElementById('clearCart');
const searchProductInput = document.getElementById('searchProduct');
const categoryButtons = document.querySelectorAll('.category-btn');
const receiptModal = document.getElementById('receiptModal');
const closeModalButton = document.getElementById('closeModal');
const printReceiptButton = document.getElementById('printReceipt');
const newTransactionButton = document.getElementById('newTransaction');
const dateTimeElement = document.querySelector('#dateTime span');
const receiptNoElement = document.getElementById('receiptNo');
const receiptDateElement = document.getElementById('receiptDate');
const receiptItemsElement = document.getElementById('receiptItems');
const receiptSubtotalElement = document.getElementById('receiptSubtotal');
const receiptDiscountElement = document.getElementById('receiptDiscount');
const receiptTotalElement = document.getElementById('receiptTotal');
const receiptPaidElement = document.getElementById('receiptPaid');
const receiptChangeElement = document.getElementById('receiptChange');
const receiptPrintElement = document.getElementById('receiptPrint');

// Fungsi untuk menampilkan waktu dan tanggal
function updateDateTime() {
    const now = new Date();
    const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const timeOptions = { hour: '2-digit', minute: '2-digit', second: '2-digit' };
    
    const dateString = now.toLocaleDateString('id-ID', dateOptions);
    const timeString = now.toLocaleTimeString('id-ID', timeOptions);
    
    dateTimeElement.textContent = `${dateString} | ${timeString}`;
    
    // Update tanggal di struk
    const receiptDate = now.toLocaleDateString('id-ID');
    const receiptTime = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    receiptDateElement.textContent = `${receiptDate} ${receiptTime}`;
}

// Fungsi untuk menghasilkan nomor transaksi
function generateTransactionNo() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const count = String(transactionCount).padStart(3, '0');
    
    return `TRX-${year}${month}${day}-${count}`;
}

// Fungsi untuk menampilkan produk
function displayProducts(filterCategory = 'all', searchTerm = '') {
    productListElement.innerHTML = '';
    
    const filteredProducts = products.filter(product => {
        const matchesCategory = filterCategory === 'all' || product.category === filterCategory;
        const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            product.category.toLowerCase().includes(searchTerm.toLowerCase());
        
        return matchesCategory && matchesSearch;
    });
    
    if (filteredProducts.length === 0) {
        productListElement.innerHTML = '<div class="no-products">Tidak ada produk ditemukan</div>';
        return;
    }
    
    filteredProducts.forEach(product => {
        const productElement = document.createElement('div');
        productElement.className = `product-item ${product.category}`;
        productElement.setAttribute('data-id', product.id);
        productElement.innerHTML = `
            <div class="product-info">
                <h3>${product.name}</h3>
                <p>Kategori: ${product.category}</p>
            </div>
            <div class="product-price">Rp ${product.price.toLocaleString('id-ID')}</div>
        `;
        
        productElement.addEventListener('click', () => addToCart(product.id));
        productListElement.appendChild(productElement);
    });
}

// Fungsi untuk menambahkan produk ke keranjang
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            category: product.category,
            price: product.price,
            quantity: 1
        });
    }
    
    updateCartDisplay();
    updateReceiptPreview();
}

// Fungsi untuk menghapus item dari keranjang
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    updateCartDisplay();
    updateReceiptPreview();
}

// Fungsi untuk mengupdate jumlah item di keranjang
function updateQuantity(productId, newQuantity) {
    if (newQuantity < 1) {
        removeFromCart(productId);
        return;
    }
    
    const item = cart.find(item => item.id === productId);
    if (item) {
        item.quantity = newQuantity;
        updateCartDisplay();
        updateReceiptPreview();
    }
}

// Fungsi untuk mengupdate tampilan keranjang
function updateCartDisplay() {
    cartItemsElement.innerHTML = '';
    
    if (cart.length === 0) {
        cartItemsElement.innerHTML = `
            <tr class="empty-cart-message">
                <td colspan="5">Keranjang belanja kosong. Tambahkan produk dari daftar di samping.</td>
            </tr>
        `;
    } else {
        cart.forEach(item => {
            const subtotal = item.price * item.quantity;
            const row = document.createElement('tr');
            row.className = 'cart-item-row';
            row.innerHTML = `
                <td>
                    <div class="cart-item-info">
                        <div class="cart-item-image">
                            <i class="fas fa-${getProductIcon(item.category)}"></i>
                        </div>
                        <div class="cart-item-details">
                            <h4>${item.name}</h4>
                            <p>Kategori: ${item.category}</p>
                        </div>
                    </div>
                </td>
                <td>Rp ${item.price.toLocaleString('id-ID')}</td>
                <td>
                    <div class="qty-control">
                        <button class="qty-btn decrease" data-id="${item.id}">-</button>
                        <span class="qty-value">${item.quantity}</span>
                        <button class="qty-btn increase" data-id="${item.id}">+</button>
                    </div>
                </td>
                <td>Rp ${subtotal.toLocaleString('id-ID')}</td>
                <td>
                    <button class="remove-btn" data-id="${item.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            
            cartItemsElement.appendChild(row);
        });
        
        // Tambahkan event listeners untuk tombol kuantitas dan hapus
        document.querySelectorAll('.decrease').forEach(button => {
            button.addEventListener('click', (e) => {
                const productId = parseInt(e.target.closest('button').getAttribute('data-id'));
                const item = cart.find(item => item.id === productId);
                if (item) {
                    updateQuantity(productId, item.quantity - 1);
                }
            });
        });
        
        document.querySelectorAll('.increase').forEach(button => {
            button.addEventListener('click', (e) => {
                const productId = parseInt(e.target.closest('button').getAttribute('data-id'));
                const item = cart.find(item => item.id === productId);
                if (item) {
                    updateQuantity(productId, item.quantity + 1);
                }
            });
        });
        
        document.querySelectorAll('.remove-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const productId = parseInt(e.target.closest('button').getAttribute('data-id'));
                removeFromCart(productId);
            });
        });
    }
    
    // Update ringkasan keranjang
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    const discountAmount = subtotal * (discount / 100);
    const total = subtotal - discountAmount;
    
    totalItemsElement.textContent = totalItems;
    subtotalElement.textContent = `Rp ${subtotal.toLocaleString('id-ID')}`;
    totalAmountElement.textContent = `Rp ${total.toLocaleString('id-ID')}`;
}

// Fungsi untuk mendapatkan ikon berdasarkan kategori produk
function getProductIcon(category) {
    switch(category) {
        case 'makanan': return 'utensils';
        case 'minuman': return 'glass-whiskey';
        case 'snack': return 'cookie-bite';
        default: return 'box';
    }
}

// Fungsi untuk mengupdate preview struk
function updateReceiptPreview() {
    receiptItemsElement.innerHTML = '';
    
    if (cart.length === 0) {
        receiptItemsElement.innerHTML = '<p class="empty-receipt">Tidak ada item</p>';
        receiptSubtotalElement.textContent = 'Rp 0';
        receiptDiscountElement.textContent = '0%';
        receiptTotalElement.textContent = 'Rp 0';
        receiptPaidElement.textContent = 'Rp 0';
        receiptChangeElement.textContent = 'Rp 0';
        return;
    }
    
    const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    const discountAmount = subtotal * (discount / 100);
    const total = subtotal - discountAmount;
    
    cart.forEach(item => {
        const itemSubtotal = item.price * item.quantity;
        const itemElement = document.createElement('div');
        itemElement.className = 'receipt-item';
        itemElement.innerHTML = `
            <span>${item.name} x${item.quantity}</span>
            <span>Rp ${itemSubtotal.toLocaleString('id-ID')}</span>
        `;
        receiptItemsElement.appendChild(itemElement);
    });
    
    receiptSubtotalElement.textContent = `Rp ${subtotal.toLocaleString('id-ID')}`;
    receiptDiscountElement.textContent = `${discount}%`;
    receiptTotalElement.textContent = `Rp ${total.toLocaleString('id-ID')}`;
}

// Fungsi untuk menghitung kembalian
function calculateChange() {
    const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    const discountAmount = subtotal * (discount / 100);
    const total = subtotal - discountAmount;
    
    const amountPaid = parseFloat(amountPaidInput.value) || 0;
    const change = amountPaid - total;
    
    if (change < 0) {
        changeInput.value = `Kurang: Rp ${Math.abs(change).toLocaleString('id-ID')}`;
        changeInput.style.color = '#e74c3c';
    } else {
        changeInput.value = `Rp ${change.toLocaleString('id-ID')}`;
        changeInput.style.color = '#2ecc71';
    }
    
    // Update preview struk
    receiptPaidElement.textContent = `Rp ${amountPaid.toLocaleString('id-ID')}`;
    receiptChangeElement.textContent = `Rp ${Math.max(change, 0).toLocaleString('id-ID')}`;
}

// Fungsi untuk memproses pembayaran
function processPayment() {
    const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    const discountAmount = subtotal * (discount / 100);
    const total = subtotal - discountAmount;
    
    const amountPaid = parseFloat(amountPaidInput.value) || 0;
    
    if (cart.length === 0) {
        alert('Keranjang belanja kosong. Tambahkan produk terlebih dahulu.');
        return;
    }
    
    if (amountPaid < total) {
        alert('Jumlah pembayaran kurang. Silahkan masukkan jumlah yang cukup.');
        return;
    }
    
    // Update struk untuk modal
    updateReceiptForModal(amountPaid, total);
    
    // Tampilkan modal
    receiptModal.classList.add('active');
}

// Fungsi untuk mengupdate struk di modal
function updateReceiptForModal(amountPaid, total) {
    const change = amountPaid - total;
    
    receiptNoElement.textContent = generateTransactionNo();
    
    let receiptHTML = `
        <div class="receipt-header">
            <h4>KASIR MODERN</h4>
            <p>Jl. Contoh No. 123, Kota Anda</p>
            <p>Telp: (021) 123-4567</p>
            <p>===============================</p>
        </div>
        <div class="receipt-body">
            <div class="receipt-info">
                <p>No. Transaksi: ${generateTransactionNo()}</p>
                <p>Tanggal: ${new Date().toLocaleDateString('id-ID')} ${new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</p>
                <p>Kasir: Kasir 01</p>
                <p>Metode: ${document.querySelector('input[name="payment"]:checked').value}</p>
                <p>===============================</p>
            </div>
            <div class="receipt-items">
    `;
    
    cart.forEach(item => {
        const itemSubtotal = item.price * item.quantity;
        receiptHTML += `
            <div class="receipt-item">
                <p>${item.name} x${item.quantity}</p>
                <p>Rp ${itemSubtotal.toLocaleString('id-ID')}</p>
            </div>
        `;
    });
    
    receiptHTML += `
                <p>===============================</p>
            </div>
            <div class="receipt-summary">
                <p>Subtotal: Rp ${subtotal.toLocaleString('id-ID')}</p>
                <p>Diskon: ${discount}%</p>
                <p class="total">TOTAL: Rp ${total.toLocaleString('id-ID')}</p>
                <p>Bayar: Rp ${amountPaid.toLocaleString('id-ID')}</p>
                <p>Kembali: Rp ${change.toLocaleString('id-ID')}</p>
                <p>===============================</p>
            </div>
        </div>
        <div class="receipt-footer">
            <p>Terima kasih telah berbelanja!</p>
            <p>Barang yang sudah dibeli tidak dapat dikembalikan</p>
        </div>
    `;
    
    receiptPrintElement.innerHTML = receiptHTML;
}

// Fungsi untuk transaksi baru
function newTransaction() {
    cart = [];
    discount = 0;
    discountInput.value = '';
    amountPaidInput.value = '';
    changeInput.value = '';
    
    // Reset radio button pembayaran ke tunai
    document.querySelector('input[name="payment"][value="cash"]').checked = true;
    document.querySelectorAll('.method-option').forEach(option => {
        option.classList.remove('active');
    });
    document.querySelector('input[name="payment"][value="cash"]').closest('.method-option').classList.add('active');
    
    updateCartDisplay();
    updateReceiptPreview();
    
    // Tutup modal
    receiptModal.classList.remove('active');
    
    // Increment transaction counter
    transactionCount++;
}

// Fungsi untuk mencetak struk
function printReceipt() {
    const printWindow = window.open('', '_blank');
    const receiptContent = receiptPrintElement.innerHTML;
    
    printWindow.document.write(`
        <html>
            <head>
                <title>Struk Pembayaran</title>
                <style>
                    body {
                        font-family: 'Courier New', monospace;
                        font-size: 12px;
                        padding: 10px;
                    }
                    .receipt-header {
                        text-align: center;
                        margin-bottom: 10px;
                    }
                    .receipt-header h4 {
                        font-size: 16px;
                        font-weight: bold;
                        margin: 5px 0;
                    }
                    .receipt-info, .receipt-summary {
                        margin: 10px 0;
                    }
                    .receipt-item {
                        display: flex;
                        justify-content: space-between;
                        margin-bottom: 3px;
                    }
                    .receipt-summary .total {
                        font-weight: bold;
                        border-top: 1px dashed #000;
                        border-bottom: 1px dashed #000;
                        padding: 5px 0;
                        margin: 5px 0;
                    }
                    .receipt-footer {
                        text-align: center;
                        margin-top: 15px;
                        font-size: 10px;
                    }
                    hr {
                        border: none;
                        border-top: 1px dashed #000;
                        margin: 10px 0;
                    }
                </style>
            </head>
            <body>
                ${receiptContent}
                <script>
                    window.onload = function() {
                        window.print();
                        setTimeout(function() {
                            window.close();
                        }, 500);
                    }
                </script>
            </body>
        </html>
    `);
    printWindow.document.close();
}

// Inisialisasi aplikasi
function initApp() {
    // Tampilkan produk
    displayProducts();
    
    // Update waktu dan tanggal
    updateDateTime();
    setInterval(updateDateTime, 1000);
    
    // Event listeners untuk filter kategori
    categoryButtons.forEach(button => {
        button.addEventListener('click', () => {
            categoryButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            const category = button.getAttribute('data-category');
            const searchTerm = searchProductInput.value;
            displayProducts(category, searchTerm);
        });
    });
    
    // Event listener untuk pencarian produk
    searchProductInput.addEventListener('input', () => {
        const searchTerm = searchProductInput.value;
        const activeCategory = document.querySelector('.category-btn.active').getAttribute('data-category');
        displayProducts(activeCategory, searchTerm);
    });
    
    // Event listener untuk tombol diskon
    applyDiscountButton.addEventListener('click', () => {
        discount = 5;
        discountInput.value = discount;
        updateCartDisplay();
        updateReceiptPreview();
    });
    
    // Event listener untuk input diskon
    discountInput.addEventListener('change', () => {
        discount = parseFloat(discountInput.value) || 0;
        if (discount > 100) discount = 100;
        if (discount < 0) discount = 0;
        discountInput.value = discount;
        updateCartDisplay();
        updateReceiptPreview();
    });
    
    // Event listener untuk tombol hitung kembalian
    calculateChangeButton.addEventListener('click', calculateChange);
    
    // Event listener untuk input jumlah bayar (hitung otomatis saat enter)
    amountPaidInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            calculateChange();
        }
    });
    
    // Event listener untuk tombol proses pembayaran
    processPaymentButton.addEventListener('click', processPayment);
    
    // Event listener untuk tombol kosongkan keranjang
    clearCartButton.addEventListener('click', () => {
        if (cart.length > 0 && confirm('Apakah Anda yakin ingin mengosongkan keranjang?')) {
            newTransaction();
        }
    });
    
    // Event listener untuk metode pembayaran
    document.querySelectorAll('.method-option').forEach(option => {
        option.addEventListener('click', () => {
            document.querySelectorAll('.method-option').forEach(opt => {
                opt.classList.remove('active');
            });
            option.classList.add('active');
        });
    });
    
    // Event listener untuk tombol tutup modal
    closeModalButton.addEventListener('click', () => {
        receiptModal.classList.remove('active');
    });
    
    // Event listener untuk tombol cetak struk
    printReceiptButton.addEventListener('click', printReceipt);
    
    // Event listener untuk tombol transaksi baru
    newTransactionButton.addEventListener('click', newTransaction);
    
    // Event listener untuk klik di luar modal untuk menutup
    window.addEventListener('click', (e) => {
        if (e.target === receiptModal) {
            receiptModal.classList.remove('active');
        }
    });
}

// Inisialisasi aplikasi saat halaman dimuat
document.addEventListener('DOMContentLoaded', initApp);