document.addEventListener('DOMContentLoaded', () => {
    // seletores de elementos do DOM
    const container = document.querySelector('.products-area');
    const detailsModal = document.getElementById('product-modal'); // modal de detalhes (será removido/ignorado)
    const editModal = document.getElementById('edit-product-modal');
    const editForm = document.getElementById('edit-product-form');
    const menuToggle = document.getElementById('menu-toggle');     // menu mobile
    const menuNav = document.getElementById('menu-nav');           // menu mobile

    // --- verificação de admin e adição do botão de cadastro ---
    const userDataString = localStorage.getItem('user'); // pega dados do usuário do localStorage

    if (userDataString) {
        try {
            const user = JSON.parse(userDataString);

            // verifica se o usuário é admin pela 'role' (mais seguro que verificar email)
            if (user && user.role === 'admin') {
                const adminButton = document.createElement('a');
                adminButton.href = '/cadastro-produtos.html'; // usa caminho relativo à raiz
                adminButton.textContent = '☑ Cadastrar Produtos';
                adminButton.classList.add('btn-admin'); // classe para estilização

                // adiciona o botão ao container do cabeçalho
                const headerContainer = document.querySelector('.header-area'); // container específico no header
                if (headerContainer) {
                    headerContainer.appendChild(adminButton);
                } else {
                    console.warn('container do cabeçalho (.header-area) não encontrado para adicionar o botão de admin.');
                }
            }
        } catch (e) {
            console.error('erro ao processar dados do usuário do localStorage:', e);
            // opcionalmente, limpar dados corrompidos: localStorage.removeItem('user');
        }
    }


    // verifica se elementos essenciais existem
    if (!container || !editModal || !editForm) {
        console.error('erro: elementos essenciais da página de produtos ou modal de edição não encontrados.');
        return; // interrompe se elementos cruciais faltarem
    }

    let allProducts = []; // cache local dos produtos buscados
    let toastTimer = null; // timer para a notificação

    // --- funções auxiliares ---

    // envia requisições à API anexando o token JWT
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

    // verifica se o usuário logado tem a role 'admin'
    function isAdmin() {
        const userDataString = localStorage.getItem('user');
        if (!userDataString) return false;
        try {
            const user = JSON.parse(userDataString);
            return user?.role === 'admin'; // usa optional chaining e verifica a role
        } catch (e) {
            console.error('erro ao ler dados do usuário:', e);
            return false;
        }
    }

    // formata um número como moeda brasileira (BRL)
    function formatCurrency(value) {
        const numericValue = Number(value);
        if (isNaN(numericValue)) return 'R$ --,--';
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(numericValue);
    }

    // exibe uma notificação (toast) na tela
    function showNotification(message, type = 'info') {
        const toastElement = document.getElementById('custom-toast');
        if (!toastElement) { // cria o elemento se não existir
            const newToast = document.createElement('div');
            newToast.id = 'custom-toast';
            document.body.appendChild(newToast);
            return showNotification(message, type); // chama novamente com o elemento criado
        }

        if (toastTimer) clearTimeout(toastTimer); // cancela timer anterior

        toastElement.textContent = message;
        toastElement.className = 'show'; // reseta e mostra

        let duration = 6000; // duração padrão (6s)

        // aplica classe e ajusta duração com base no tipo
        switch (type) {
            case 'cart':
                toastElement.classList.add('cart');
                toastElement.textContent = `${message} (clique para ver o carrinho)`;
                duration = 10000; // 10s
                break;
            case 'success':
                toastElement.classList.add('success');
                duration = 6000; // 6s
                break;
            case 'error':
                toastElement.classList.add('error');
                duration = 10000; // 10s
                break;
            default: // 'info'
                toastElement.classList.add('info');
        }

        // define timer para esconder a notificação
        toastTimer = setTimeout(() => {
            toastElement.classList.remove('show');
            toastTimer = null;
        }, duration);
    }

    // adiciona listener ao toast (se existir) para ação de clique (ir ao carrinho)
    function setupToastListener() {
        const toastElement = document.getElementById('custom-toast');
        if (toastElement) {
            toastElement.addEventListener('click', () => {
                if (toastElement.classList.contains('cart')) {
                    window.location.href = '/carrinho.html';
                    if (toastTimer) clearTimeout(toastTimer); // fecha ao clicar
                    toastElement.classList.remove('show');
                }
            });
        } else {
             console.warn('elemento #custom-toast não encontrado para adicionar listener.');
        }
    }

    // --- lógica principal de produtos ---

    // busca a lista de produtos da API
    async function fetchProducts() {
        // não precisa de autenticação para listar produtos
        const response = await fetch('/api/products');
        if (!response.ok) {
            let errorMsg = 'falha ao buscar os produtos da API.';
            try {
                const errorData = await response.json();
                errorMsg = errorData.message || errorMsg;
            } catch(e) {/* ignora */}
            throw new Error(errorMsg);
        }
        return await response.json();
    }

    // renderiza os cards de produto no container
    function renderProducts(products) {
        if (!container) return; // guarda de segurança
        container.innerHTML = ''; // limpa container
        const userIsAdmin = isAdmin(); // verifica permissão uma vez

        if (!products || products.length === 0) {
            container.innerHTML = '<p>nenhum produto encontrado.</p>';
            return;
        }

        products.forEach(product => {
            const card = document.createElement('div');
            card.className = 'products-card';
            card.dataset.productId = product.id; // armazena ID no elemento

            const imageUrl = product.image_url || 'https://via.placeholder.com/165x165?text=Sem+Imagem';
            const formattedPrice = formatCurrency(product.price);

            // botão de editar visível apenas para admin
            const adminButtonHTML = userIsAdmin ?
                `<button class="edit-btn" data-product-id="${product.id}" aria-label="editar produto">editar ✏️</button>` : '';

            // html interno do card
            card.innerHTML = `
                <div class="products-card--image">
                    <img src="${imageUrl}" alt="${product.title || 'produto sem título'}">
                </div>
                <div class="products-card--info">
                    <h4>${product.title || 'produto sem título'}</h4>
                    <p class="small-text">${(product.description || '').substring(0, 50)}...</p>
                </div>
                <div class="products-card--footer">
                    <h4 class="orange-text bold-text">${formattedPrice}</h4>
                    <div class="button-group">
                        ${adminButtonHTML}
                        <button class="add-to-cart-btn" data-product-id="${product.id}" aria-label="adicionar ao carrinho">adicionar 🛒</button>
                    </div>
                </div>
            `;
            container.appendChild(card);
        });
    }

    // adiciona um produto ao carrinho (localStorage)
    function addToCart(productId) {
        const productToAdd = allProducts.find(p => p.id === parseInt(productId));
        if (!productToAdd) {
            showNotification('erro: produto não encontrado para adicionar ao carrinho.', 'error');
            return;
        }

        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        const existingItemIndex = cart.findIndex(item => item.id === parseInt(productId));

        if (existingItemIndex > -1) {
            cart[existingItemIndex].quantity = (cart[existingItemIndex].quantity || 0) + 1; // incrementa quantidade
        } else {
            // adiciona novo item com dados essenciais
            cart.push({
                id: productToAdd.id,
                title: productToAdd.title,
                price: productToAdd.price,
                image_url: productToAdd.image_url,
                quantity: 1
            });
        }
        localStorage.setItem('cart', JSON.stringify(cart)); // salva carrinho
        showNotification(`"${productToAdd.title || 'produto'}" adicionado ao carrinho!`, 'cart'); // notifica usuário
    }

    // preenche e exibe o modal de edição
    function showEditModal(productId) {
        const productToEdit = allProducts.find(p => p.id === parseInt(productId));
        if (!productToEdit || !editForm) return;

        // preenche o formulário com dados atuais
        editForm.querySelector('#edit-product-id').value = productToEdit.id;
        editForm.querySelector('#edit-title').value = productToEdit.title || '';
        editForm.querySelector('#edit-description').value = productToEdit.description || '';
        editForm.querySelector('#edit-price').value = productToEdit.price || '';
        editForm.querySelector('#edit-image_url').value = productToEdit.image_url || '';

        if (editModal) editModal.classList.add('show'); // exibe modal
    }

    // esconde o modal de edição
    function hideEditModal() {
        if (editModal) editModal.classList.remove('show');
    }

    // --- inicialização e event listeners ---

    // inicializa a página buscando e renderizando produtos
    async function initializePage() {
        try {
            const products = await fetchProducts();
            allProducts = products; // armazena no cache local
            renderProducts(allProducts);
        } catch (error) {
            console.error('erro ao inicializar página de produtos:', error);
            if (container) container.innerHTML = `<p style="color: red;">${error.message}</p>`;
            showNotification('erro ao carregar produtos.', 'error');
        }
    }

    // listener principal no container de produtos (delegação)
    if (container) {
        container.addEventListener('click', function (event) {
            const card = event.target.closest('.products-card');
            if (!card) return; // ignora cliques fora de um card

            const productId = card.dataset.productId;
            const addToCartBtn = event.target.closest('.add-to-cart-btn');
            const editBtn = event.target.closest('.edit-btn');

            if (addToCartBtn) {
                event.stopPropagation(); // previne que o clique no botão abra a página de detalhes
                addToCart(productId);
            } else if (editBtn) {
                event.stopPropagation(); // previne que o clique no botão abra a página de detalhes
                showEditModal(productId);
            } else {
                // redireciona para a página de detalhes do produto
                window.location.href = `/produto-detalhe.html?id=${productId}`;
            }
        });
    }

    // listener para o formulário de edição de produto
    if (editForm) {
        editForm.addEventListener('submit', async function (event) {
            event.preventDefault();
            const id = editForm.querySelector('#edit-product-id').value;
            const submitButton = editForm.querySelector('button[type="submit"]');

            const updatedProduct = {
                title: editForm.querySelector('#edit-title').value,
                description: editForm.querySelector('#edit-description').value,
                price: parseFloat(editForm.querySelector('#edit-price').value),
                image_url: editForm.querySelector('#edit-image_url').value
            };

            submitButton.disabled = true;
            submitButton.textContent = 'salvando...';

            try {
                // envia dados atualizados via PUT autenticado
                const response = await fetchWithAuth(`/api/products/${id}`, {
                    method: 'PUT',
                    body: JSON.stringify(updatedProduct)
                });

                const data = await response.json();
                if (!response.ok) {
                    throw new Error(data.message || 'falha ao atualizar o produto.');
                }

                showNotification(data.message || 'produto atualizado com sucesso!', 'success');
                hideEditModal(); // fecha modal
                initializePage(); // recarrega a lista de produtos

            } catch (error) {
                console.error('erro ao atualizar produto:', error);
                showNotification(error.message, 'error');
            } finally {
                submitButton.disabled = false;
                submitButton.textContent = 'salvar alterações';
            }
        });

        // listener para o botão de cancelar no modal de edição
        const cancelEditBtn = document.getElementById('cancel-edit-btn');
        if (cancelEditBtn) {
            cancelEditBtn.addEventListener('click', hideEditModal);
        }
         // Adiciona listener para fechar clicando fora do modal-content
         if (editModal) {
            editModal.addEventListener('click', (e) => {
                if (e.target === editModal) { // Verifica se o clique foi no overlay
                    hideEditModal();
                }
            });
        }
    }

    // listener para o menu mobile
    if (menuToggle && menuNav) {
        menuToggle.addEventListener('click', () => {
            menuNav.classList.toggle('open');
        });
    }

    // inicializa o sistema de notificações e a página
    setupToastListener();
    initializePage();
});