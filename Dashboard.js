
// Utility to get products from localStorage
function getProducts() {
    return JSON.parse(localStorage.getItem('products') || '[]');
}

// Utility to save products to localStorage
function saveProducts(products) {
    localStorage.setItem('products', JSON.stringify(products));
}

// Render the statistics
function renderStats() {
    const statsEl = document.getElementById('stats');
    const products = getProducts();
    if (products.length === 0) {
        statsEl.innerHTML = `<span class="stat">No products.</span>`;
        return;
    }
    const prices = products.map(p => parseFloat(p.price));
    const total = products.length;
    const avg = (prices.reduce((sum, v) => sum + v, 0) / total).toFixed(2);
    const max = Math.max(...prices).toFixed(2);
    const min = Math.min(...prices).toFixed(2);

    statsEl.innerHTML = `
        <span class="stat">Total: <strong>${total}</strong></span>
        <span class="stat">Avg Price: <strong>$${avg}</strong></span>
        <span class="stat">Highest: <strong>$${max}</strong></span>
        <span class="stat">Lowest: <strong>$${min}</strong></span>
    `;
}

// Render the products
function renderProducts() {
    const list = document.getElementById('productList')
    list.innerHTML = '';
    const products = getProducts();
    products.forEach((prod, idx) => {
        // Separate code from title if code at the end (e.g., AIK5066)
        let title = prod.title;
        let code = '';
        const divide = title.split(' ');
        if (divide.length > 1 && /\w\d+$/.test(divide[divide.length-1])) {
            code = divide.pop();
            title = divide.join(' ');
        }
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <img src="${prod.image}" alt="product image">
            <div class="product-title">${title}
                ${code ? `<span class="product-code">${code}</span>` : ''}
            </div>
            <div class="product-price">$${parseFloat(prod.price).toFixed(2)}</div>
            <button onclick="deleteProduct(${idx})">Delete</button>
        `;
        list.appendChild(card);
    });
    renderStats();
}

// Delete a product
function deleteProduct(index) {
    if (confirm("Are you sure to delete this product?")) {
        const products = getProducts();
        products.splice(index, 1);
        saveProducts(products);
        renderProducts();
    }
}

// Handle new product form submission
document.getElementById('productForm').addEventListener('submit', function(e){
    e.preventDefault();
    const file = document.getElementById('productImage').files[0];
    const title = document.getElementById('productTitle').value.trim();
    const price = document.getElementById('productPrice').value;
    if (!file || !title || !price) return alert('All fields required.');
    const reader = new FileReader();
    reader.onload = function(evt){
        const imageBase64 = evt.target.result;
        const products = getProducts();
        products.unshift({ image: imageBase64, title, price });
        saveProducts(products);
        renderProducts();
        document.getElementById('productForm').reset();
    }
    reader.readAsDataURL(file);
});

// Render on load
window.renderProducts = renderProducts;
window.deleteProduct = deleteProduct;
window.onload = renderProducts;