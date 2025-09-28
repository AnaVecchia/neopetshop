document.addEventListener('DOMContentLoaded', function() {
    // --- SELETORES DE ELEMENTOS ---
    const container = document.querySelector('.products-area');
    const detailsModal = document.getElementById('product-modal');
    const editModal = document.getElementById('edit-product-modal'); // NOVO: Seletor do modal de edição
    const editForm = document.getElementById('edit-product-form');   // NOVO: Seletor do formulário de edição

    if (!container || !detailsModal || !editModal || !editForm) {
        console.error('Erro: Um ou mais elementos essenciais (products-area, product-modal, edit-product-modal, edit-product-form) não foram encontrados no HTML.');
        return;
    }

    let allProducts = [];

    // --- FUNÇÃO DE VERIFICAÇÃO DE ADMIN (NOVO) ---
    function isAdmin() {
        const userDataString = localStorage.getItem('user');
        if (!userDataString) return false;
        const user = JSON.parse(userDataString);
        return user && user.email && user.email.includes('admin');
    }

    // --- FUNÇÕES DE INICIALIZAÇÃO E BUSCA DE DADOS ---
    async function init() {
        try {
            const products = await fetchProducts();
            allProducts = products;
            renderProducts(allProducts);
        } catch (error) {
            console.error('Erro ao inicializar:', error);
            container.innerHTML = '<p style="color: red;">Falha ao carregar produtos.</p>';
        }
    }

    async function fetchProducts() {
        const response = await fetch('http://localhost:3030/produtos');
        if (!response.ok) throw new Error('A resposta da rede não foi bem-sucedida.');
        return await response.json();
    }

    // --- RENDERIZAÇÃO DE PRODUTOS (MODIFICADO) ---
    function renderProducts(products) {
        container.innerHTML = '';
        const userIsAdmin = isAdmin(); // Verifica se o usuário é admin

        products.forEach(product => {
            const card = document.createElement('div');
            card.className = 'products-card';
            card.dataset.productId = product.id;

            const imageUrl = product.image_url || 'https://via.placeholder.com/165x165?text=Sem+Imagem';
            const formattedPrice = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.price);

            // ORGANIZAR AQUI NO CSS
            const adminButtonHTML = userIsAdmin ?
                `<button class="edit-btn" data-product-id="${product.id}">Editar ✏️</button>` : '';

            card.innerHTML = `
                <div class="products-card--image">
                    <img src="${imageUrl}" alt="${product.title}">
                </div>
                <div class="products-card--info">
                    <h4>${product.title}</h4>
                    <p class="small-text">${product.description.substring(0, 50)}</p>
                </div>
                <div class="products-card--footer">
                    <h4 class="orange-text bold-text">${formattedPrice}</h4>
                    <div class="button-group">
                        ${adminButtonHTML} <button class="add-to-cart-btn" data-product-id="${product.id}">Adicionar 🛒</button>
                    </div>
                </div>
            `;
            container.appendChild(card);
        });
    }

    // --- LÓGICA DO CARRINHO (SEM MUDANÇAS) ---
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
        alert(`"${productToAdd.title}" foi adicionado ao carrinho!`);
    }

    // --- LÓGICA DOS MODAIS (VISUALIZAÇÃO E EDIÇÃO) ---

    // Modal de Visualização (seu código original, funcionando)
    function showDetailsModal(productId) {
        const product = allProducts.find(p => p.id === parseInt(productId));
        if (!product) return;
        const imageUrl = product.image_url || 'https://via.placeholder.com/300x300?text=Sem+Imagem';
        const formattedPrice = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.price);
        
        // MODIFICADO: Usa as tags que você gosta para manter o design
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

    // NOVO: Modal de Edição (com as fontes/tags corrigidas)
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


    // --- GERENCIAMENTO DE EVENTOS (MODIFICADO PARA FUNCIONAR TUDO) ---

    // Listener para a área de produtos
    container.addEventListener('click', function(event) {
        const target = event.target;
        const card = target.closest('.products-card');
        if (!card) return;

        const productId = card.dataset.productId;

        if (target.classList.contains('add-to-cart-btn')) {
            // Ação 1: Clique no botão ADICIONAR
            addToCart(productId);
        } else if (target.classList.contains('edit-btn')) {
            // Ação 2: Clique no botão EDITAR
            showEditModal(productId);
        } else {
            // Ação 3: Clique em qualquer outra parte do card para VISUALIZAR
            showDetailsModal(productId);
        }
    });

    // Listener para o modal de VISUALIZAÇÃO
    detailsModal.addEventListener('click', function(event) {
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

    // NOVO: Listener para o formulário de EDIÇÃO
    editForm.addEventListener('submit', function(event) {
        event.preventDefault();
        const id = document.getElementById('edit-product-id').value;
        const updatedProduct = {
            title: document.getElementById('edit-title').value,
            description: document.getElementById('edit-description').value,
            price: parseFloat(document.getElementById('edit-price').value),
            image_url: document.getElementById('edit-image_url').value
        };

        fetch(`http://localhost:3030/produto/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedProduct)
        })
        .then(response => response.json())
        .then(data => {
            alert(data.message);
            hideEditModal();
            init(); // Re-carrega a lista de produtos
        })
        .catch(error => {
            console.error('Erro ao atualizar produto:', error);
            alert('Falha ao atualizar o produto.');
        });
    });
    
    // NOVO: Listener para o botão de cancelar do modal de edição
    document.getElementById('cancel-edit-btn').addEventListener('click', hideEditModal);


    // Inicia todo o processo
    init();
});