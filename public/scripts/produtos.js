document.addEventListener('DOMContentLoaded', () => {
    const menuToggle = document.getElementById('menu-toggle');
    const menuNav = document.getElementById('menu-nav');

    if (menuToggle && menuNav) {
        menuToggle.addEventListener('click', () => {
            menuNav.classList.toggle('open');
        });
    }

    // --- INÍCIO DO SISTEMA DE NOTIFICAÇÃO ---

    const toastElement = document.createElement('div');
    toastElement.id = 'custom-toast';
    document.body.appendChild(toastElement);
    let toastTimer = null;

    function showNotification(message, type = 'info') {
        if (toastTimer) {
            clearTimeout(toastTimer);
        }

        toastElement.textContent = message;
        toastElement.className = ''; // Reseta classes

        // === DURAÇÕES AUMENTADAS AQUI ===
        let duration = 6000; // 6 segundos para info e success (era 4000)

        if (type === 'cart') {
            toastElement.classList.add('cart');
            toastElement.textContent = `${message} (Clique para ver o carrinho)`;
            duration = 10000; // 10 segundos para carrinho (era 7000)
        } else if (type === 'success') {
            toastElement.classList.add('success');
        } else if (type === 'error') {
            toastElement.classList.add('error');
            duration = 10000; // 10 segundos para erro (era 7000)
        } else {
            toastElement.classList.add('info'); // Classe 'info' adicionada para estilização opcional
        }

        toastElement.classList.add('show');

        toastTimer = setTimeout(() => {
            toastElement.classList.remove('show');
            toastTimer = null;
        }, duration);
    }

    toastElement.addEventListener('click', () => {
        if (toastElement.classList.contains('cart')) {
            window.location.href = 'carrinho.html';
            if (toastTimer) clearTimeout(toastTimer);
            toastElement.classList.remove('show');
        }
    });
    // --- FIM DO SISTEMA DE NOTIFICAÇÃO ---


    // --- LÓGICA EXISTENTE DOS PRODUTOS ---
    const container = document.querySelector('.products-area');
    const detailsModal = document.getElementById('product-modal');
    const editModal = document.getElementById('edit-product-modal');
    const editForm = document.getElementById('edit-product-form');

    if (!container || !detailsModal || !editModal || !editForm) {
        console.error('Um ou mais elementos DOM essenciais não foram encontrados.');
        return;
    }

    let allProducts = [];

    async function fetchWithAuth(url, options = {}) {
        const token = localStorage.getItem('token');
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers,
        };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        return fetch(url, { ...options, headers });
    }

    function isAdmin() {
        const userDataString = localStorage.getItem('user');
        if (!userDataString) return false;
        try {
            const user = JSON.parse(userDataString);
            return user && user.role === 'admin';
        } catch (e) {
            return false;
        }
    }

    async function init() {
        try {
            const products = await fetchProducts();
            allProducts = products;
            renderProducts(allProducts);
        } catch (error) {
            console.error('Erro ao inicializar:', error);
            container.innerHTML = `<p style="color: red;">${error.message}</p>`;
        }
    }

    async function fetchProducts() {
        const response = await fetch('http://localhost:3030/api/products');
        if (!response.ok) {
            throw new Error('Falha ao buscar os produtos da API.');
        }
        return await response.json();
    }

    function renderProducts(products) {
        container.innerHTML = '';
        const userIsAdmin = isAdmin();

        products.forEach(product => {
            const card = document.createElement('div');
            card.className = 'products-card';
            card.dataset.productId = product.id;

            const imageUrl = product.image_url || 'https://via.placeholder.com/165x165?text=Sem+Imagem';
            const formattedPrice = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.price);

            const adminButtonHTML = userIsAdmin ?
                `<button class="edit-btn" data-product-id="${product.id}">Editar ✏️</button>` : '';

            card.innerHTML = `
                <div class="products-card--image">
                    <img src="${imageUrl}" alt="${product.title}">
                </div>
                <div class="products-card--info">
                    <h4>${product.title}</h4>
                    <p class="small-text">${product.description.substring(0, 50)}...</p>
                </div>
                <div class="products-card--footer">
                    <h4 class="orange-text bold-text">${formattedPrice}</h4>
                    <div class="button-group">
                        ${adminButtonHTML}
                        <button class="add-to-cart-btn" data-product-id="${product.id}">Adicionar 🛒</button>
                    </div>
                </div>
            `;
            container.appendChild(card);
        });
    }

    function addToCart(productId) {
        const productToAdd = allProducts.find(p => p.id === parseInt(productId));
        if (!productToAdd) return;
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        const existingItem = cart.find(item => item.id === parseInt(productId));
        if (existingItem) {
            existingItem.quantity++;
        } else {
            cart.push({ ...productToAdd, quantity: 1 });
        }
        localStorage.setItem('cart', JSON.stringify(cart));
        
        showNotification(`"${productToAdd.title}" foi adicionado ao carrinho!`, 'cart');
    }

    function showDetailsModal(productId) {
        const product = allProducts.find(p => p.id === parseInt(productId));
        if (!product) return;
        const imageUrl = product.image_url || 'https://via.placeholder.com/300x300?text=Sem+Imagem';
        const formattedPrice = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.price);

        detailsModal.innerHTML = `
            <div class="modal-content">
                <span class="close-modal">&times;</span>
                <img src="${imageUrl}" alt="${product.title}" class="modal-image">
                <div class="modal-info">
                    <h2>${product.title}</h2>
                    <h4>${product.description}</h4>
                    <h2 class="modal-price">${formattedPrice}</h2>
                    <button class="add-to-cart-btn-modal" data-product-id="${product.id}"><h5>Adicionar ao Carrinho 🛒</h5></button>
                </div>
            </div>
        `;
        detailsModal.classList.add('show');
    }

    function hideDetailsModal() {
        detailsModal.classList.remove('show');
    }

    function showEditModal(productId) {
        const productToEdit = allProducts.find(p => p.id === parseInt(productId));
        if (!productToEdit) return;

        document.getElementById('edit-product-id').value = productToEdit.id;
        document.getElementById('edit-title').value = productToEdit.title;
        document.getElementById('edit-description').value = productToEdit.description;
        document.getElementById('edit-price').value = productToEdit.price;
        document.getElementById('edit-image_url').value = productToEdit.image_url || '';

        editModal.classList.add('show');
    }

    function hideEditModal() {
        editModal.classList.remove('show');
    }

    container.addEventListener('click', function (event) {
        const target = event.target;
        const card = target.closest('.products-card');
        if (!card) return;

        const productId = card.dataset.productId;
        const addToCartBtn = target.closest('.add-to-cart-btn');
        const editBtn = target.closest('.edit-btn');

        if (addToCartBtn) {
            event.stopPropagation();
            addToCart(productId);
        } else if (editBtn) {
            event.stopPropagation();
            showEditModal(productId);
        } else {
            showDetailsModal(productId);
        }
    });

    detailsModal.addEventListener('click', function (event) {
        const target = event.target;
        if (target.classList.contains('close-modal') || target === detailsModal) {
            hideDetailsModal();
        }
        if (target.closest('.add-to-cart-btn-modal')) {
            const productId = target.closest('.add-to-cart-btn-modal').dataset.productId;
            addToCart(productId);
            hideDetailsModal();
        }
    });

    editForm.addEventListener('submit', async function (event) {
        event.preventDefault();
        const id = document.getElementById('edit-product-id').value;
        const updatedProduct = {
            title: document.getElementById('edit-title').value,
            description: document.getElementById('edit-description').value,
            price: parseFloat(document.getElementById('edit-price').value),
            image_url: document.getElementById('edit-image_url').value
        };

        try {
            const response = await fetchWithAuth(`http://localhost:3030/api/products/${id}`, {
                method: 'PUT',
                body: JSON.stringify(updatedProduct)
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Falha ao atualizar o produto.');
            }

            showNotification(data.message || 'Produto atualizado com sucesso!', 'success');
            
            hideEditModal();
            init();
        } catch (error) {
            console.error('Erro ao atualizar produto:', error);
            showNotification(error.message, 'error');
        }
    });

    document.getElementById('cancel-edit-btn').addEventListener('click', hideEditModal);

    init();
});