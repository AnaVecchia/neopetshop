document.addEventListener('DOMContentLoaded', function() {
    // --- SELETORES DE ELEMENTOS PRINCIPAIS ---
    const container = document.querySelector('.products-area');
    const modal = document.getElementById('product-modal');

    // Verifica se os elementos essenciais existem
    if (!container || !modal) {
        console.error('Erro: Container de produtos (.products-area) ou modal (product-modal) não encontrado no HTML.');
        return;
    }

    let allProducts = []; // Array para armazenar os produtos buscados

    // --- FUNÇÃO PRINCIPAL PARA INICIAR ---
    async function init() {
        try {
            const products = await fetchProducts();
            allProducts = products; // Salva os produtos para uso posterior
            renderProducts(allProducts);
        } catch (error) {
            console.error('Erro ao inicializar:', error);
            container.innerHTML = '<p style="color: red;">Falha ao carregar produtos.</p>';
        }
    }

    // --- BUSCA OS PRODUTOS DA API ---
    async function fetchProducts() {
        const response = await fetch('http://localhost:3030/produtos');
        if (!response.ok) {
            throw new Error('A resposta da rede não foi bem-sucedida.');
        }
        return await response.json();
    }

    // --- RENDERIZA OS CARDS DE PRODUTOS NA TELA ---
    function renderProducts(products) {
        container.innerHTML = ''; // Limpa o container
        if (!products || products.length === 0) {
            container.innerHTML = '<p>Nenhum produto cadastrado ainda.</p>';
            return;
        }

        products.forEach(product => {
            const card = document.createElement('div');
            card.className = 'products-card';
            card.dataset.productId = product.id; // Adiciona o ID ao card

            const imageUrl = product.image_url || 'https://via.placeholder.com/165x165?text=Sem+Imagem';
            const formattedPrice = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.price);

            // Este é o HTML que você já tinha, com o botão "Adicionar"
            card.innerHTML = `
                <div class="products-card--image">
                    <img src="${imageUrl}" alt="${product.title}">
                </div>
                <div class="products-card--info">
                    <h4>${product.title}</h4>
                    <p class="small-text">${product.description}</p>
                </div>
                <div class="products-card--footer">
                     <h4 class="orange-text bold-text">${formattedPrice}</h4>
                     <button class="add-to-cart-btn" data-product-id="${product.id}">Adicionar 🛒</button>
                </div>
            `;
            container.appendChild(card);
        });
    }

    // --- LÓGICA DO CARRINHO ---
    function addToCart(productId) {
        const productToAdd = allProducts.find(p => p.id === productId);
        if (!productToAdd) return;

        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        const existingItem = cart.find(item => item.id === productId);

        if (existingItem) {
            existingItem.quantity++;
        } else {
            cart.push({ ...productToAdd, quantity: 1 });
        }

        localStorage.setItem('cart', JSON.stringify(cart));
        alert(`"${productToAdd.title}" foi adicionado ao carrinho!`);
    }

    // --- LÓGICA DO MODAL ---
    function showProductModal(productId) {
        const product = allProducts.find(p => p.id === productId);
        if (!product) return;

        const imageUrl = product.image_url || 'https://via.placeholder.com/300x300?text=Sem+Imagem';
        const formattedPrice = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.price);
        
        // Popula o conteúdo do modal dinamicamente
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close-modal">&times;</span>
                <img src="${imageUrl}" alt="${product.title}" class="modal-image">
                <div class="modal-info">
                    <h2>${product.title}</h2>
                    <p>${product.description}</p>
                    <div class="modal-price">${formattedPrice}</div>
                    <button class="add-to-cart-btn-modal" data-product-id="${product.id}"><h5>Adicionar ao Carrinho 🛒</h5></button>
                </div>
            </div>
        `;
        
        modal.classList.add('show'); // Mostra o modal
    }

    function hideProductModal() {
        modal.classList.remove('show');
    }

    // --- GERENCIAMENTO DE EVENTOS ---

    // Listener para cliques na área de produtos (abre modal ou adiciona ao carrinho)
    container.addEventListener('click', function(event) {
        const target = event.target;
        const card = target.closest('.products-card');
        if (!card) return; // Se o clique não foi dentro de um card, ignora

        const productId = parseInt(card.dataset.productId);

        if (target.classList.contains('add-to-cart-btn')) {
            // Se o clique foi no botão de adicionar
            addToCart(productId);
        } else {
            // Se o clique foi em qualquer outra parte do card
            showProductModal(productId);
        }
    });

    // Listener para fechar o modal ou adicionar ao carrinho DE DENTRO do modal
    modal.addEventListener('click', function(event) {
        const target = event.target;

        // Fecha se clicar no botão 'X' ou fora da caixa de conteúdo
        if (target.classList.contains('close-modal') || target.classList.contains('modal-overlay')) {
            hideProductModal();
        }

        // Adiciona ao carrinho se clicar no botão de dentro do modal
        if (target.classList.contains('add-to-cart-btn-modal')) {
             const productId = parseInt(target.dataset.productId);
             addToCart(productId);
             hideProductModal(); // Fecha o modal após adicionar
        }
    });

    // Inicia todo o processo
    init();
});