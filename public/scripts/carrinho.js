document.addEventListener('DOMContentLoaded', function () {
    // seletores de elementos do DOM
    const cartItemsContainer = document.getElementById('cart-items');
    const summarySubtotal = document.getElementById('summary-subtotal');
    const summaryTotal = document.getElementById('summary-total');
    const checkoutBtn = document.getElementById('checkout-btn');
    const checkoutModal = document.getElementById('checkout-modal');
    const modalContent = document.getElementById('checkout-modal-content');
    const cartSummaryElement = document.getElementById('cart-summary');

    // estado local do carrinho e etapa do checkout
    let cart = [];
    let currentStep = 1;

    // função auxiliar para requisições autenticadas
    async function fetchWithAuth(url, options = {}) {
        const token = localStorage.getItem('token');
        const headers = { 'Content-Type': 'application/json', ...options.headers };
        if (token) headers['Authorization'] = `Bearer ${token}`;
        return fetch(url, { ...options, headers });
    }

    // renderiza os itens do carrinho e atualiza o resumo
    function renderCart() {
        cart = JSON.parse(localStorage.getItem('cart')) || []; // carrega carrinho do localStorage
        cartItemsContainer.innerHTML = ''; // limpa a lista atual
        let total = 0;

        // exibe mensagem se o carrinho estiver vazio e esconde o resumo
        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<h2 class="cart-empty-message">seu carrinho está vazio.</h2>';
            if (cartSummaryElement) cartSummaryElement.style.display = 'none';
            return;
        }

        // exibe o resumo se o carrinho tiver itens
        if (cartSummaryElement) cartSummaryElement.style.display = 'block';

        // itera sobre os itens do carrinho para criar o HTML
        cart.forEach(item => {
            const itemSubtotal = (item.price || 0) * (item.quantity || 0); // calcula subtotal do item
            total += itemSubtotal; // adiciona ao total geral

            const cartItemHTML = `
                <div class="cart-item" data-id="${item.id}">
                    <img src="${item.image_url || 'https://via.placeholder.com/90x90?text=IMG'}" alt="${item.title || 'Produto sem título'}" class="cart-item-image">
                    <div class="cart-item-details">
                        <h4>${item.title || 'Produto sem título'}</h4>
                        <p class="item-price">preço unitário: ${formatCurrency(item.price)}</p>
                    </div>
                    <div class="quantity-controls">
                        <button class="quantity-change" data-change="-1" aria-label="diminuir quantidade">-</button>
                        <span>${item.quantity || 0}</span>
                        <button class="quantity-change" data-change="1" aria-label="aumentar quantidade">+</button>
                    </div>
                    <p class="item-subtotal">${formatCurrency(itemSubtotal)}</p>
                    <button class="remove-item-btn" aria-label="remover item">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16"><path d="M6.5 1h3a.5.5 0 0 1 .5.5v1H6v-1a.5.5 0 0 1 .5-.5ZM11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3A1.5 1.5 0 0 0 5 1.5v1H2.506a.58.58 0 0 0-.01 0H1.5a.5.5 0 0 0 0 1h.538l.853 10.66A2 2 0 0 0 4.885 16h6.23a2 2 0 0 0 1.994-1.84l.853-10.66h.538a.5.5 0 0 0 0-1h-.995a.59.59 0 0 0-.01 0H11Zm1.958 1-.846 10.58a1 1 0 0 1-.997.92h-6.23a1 1 0 0 1-.997-.92L3.042 3.5h9.916Zm-7.487 1a.5.5 0 0 1 .528.47l.5 8.5a.5.5 0 0 1-.998.06L5 5.03a.5.5 0 0 1 .47-.53Zm5.058 0a.5.5 0 0 1 .47.53l-.5 8.5a.5.5 0 1 1-.998-.06l.5-8.5a.5.5 0 0 1 .528-.47ZM8 4.5a.5.5 0 0 1 .5.5v8.5a.5.5 0 0 1-1 0V5a.5.5 0 0 1 .5-.5Z"/></svg>
                    </button>
                </div>`;
            cartItemsContainer.innerHTML += cartItemHTML;
        });

        // atualiza os valores no resumo do carrinho
        summarySubtotal.innerText = formatCurrency(total);
        summaryTotal.innerText = formatCurrency(total); // total = subtotal neste caso
    }

    // atualiza a quantidade de um item no carrinho
    function updateQuantity(productId, change) {
        const itemIndex = cart.findIndex(i => i.id === productId);
        if (itemIndex > -1) {
            cart[itemIndex].quantity += change;
            if (cart[itemIndex].quantity <= 0) {
                cart.splice(itemIndex, 1); // remove o item se quantidade for zero ou menor
            }
            saveCartAndRerender();
        }
    }

    // remove um item do carrinho pelo ID
    function removeItem(productId) {
        cart = cart.filter(i => i.id !== productId);
        saveCartAndRerender();
    }

    // salva o estado atual do carrinho no localStorage e re-renderiza a UI
    function saveCartAndRerender() {
        localStorage.setItem('cart', JSON.stringify(cart));
        renderCart();
    }

    // formata um número como moeda brasileira (BRL)
    function formatCurrency(value) {
        const numericValue = Number(value);
        if (isNaN(numericValue)) {
            console.warn("tentativa de formatar valor não numérico:", value);
            return 'R$ --,--'; // fallback para valores inválidos
        }
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(numericValue);
    }

    // exibe o modal de checkout
    function showModal() {
        currentStep = 1; // sempre começa na primeira etapa
        renderStep(currentStep);
        if (checkoutModal) checkoutModal.classList.add('show');
    }

    // esconde o modal de checkout
    function hideModal() {
        if (checkoutModal) checkoutModal.classList.remove('show');
    }

    // navega entre as etapas do modal de checkout, com validações
    async function navigateToStep(step) {
        // validação da etapa 1 (endereço) antes de ir para a etapa 2
        if (step === 2) {
            const requiredFields = ['cep', 'rua', 'numero', 'bairro', 'cidade', 'estado'];
            const formIsValid = requiredFields.every(id => {
                const element = document.getElementById(id);
                return element && element.value.trim() !== '';
            });
            if (!formIsValid) {
                alert('por favor, preencha todos os campos do endereço.');
                return; // impede a navegação
            }
        }

        // lógica de envio do pedido ao finalizar (etapa 3)
        if (step === 3) {
            const localCart = JSON.parse(localStorage.getItem('cart'));
            if (!localStorage.getItem('token') || !localCart || localCart.length === 0) {
                alert('erro: você precisa estar logado e seu carrinho não pode estar vazio para finalizar o pedido.');
                return; // impede a navegação
            }
            try {
                // envia o pedido para a API
                const response = await fetchWithAuth('http://localhost:3030/api/orders', {
                    method: 'POST',
                    body: JSON.stringify({ cart: localCart })
                });
                const result = await response.json();
                if (!response.ok) throw new Error(result.message || 'falha ao registrar o pedido.');

                console.log('pedido enviado com sucesso:', result.message);
                // avança visualmente para a etapa 3 apenas após sucesso da API
                currentStep = step;
                renderStep(currentStep);
                return; // evita renderização dupla
            } catch (error) {
                // exibe erro e permanece na etapa 2
                alert(`ocorreu um erro ao finalizar o pedido: ${error.message}`);
                return;
            }
        }

        // navega para etapas 1, 2 ou após sucesso da etapa 3
        currentStep = step;
        renderStep(currentStep);
    }

    // renderiza o conteúdo HTML de cada etapa do modal
    function renderStep(step) {
        if (!modalContent) return; // proteção caso o elemento não exista

        // etapa 1: formulário de endereço
        if (step === 1) {
            modalContent.innerHTML = `
                <div class="modal-header"><h3>1. Endereço de Entrega</h3><button class="close-modal-btn" id="close-modal-btn-header" aria-label="Fechar modal">&times;</button></div>
                <div class="modal-body">
                    <form id="address-form">
                        <div class="form-group"><label for="cep">CEP</label><input type="text" id="cep" name="cep" required></div>
                        <div class="form-group"><label for="rua">Rua</label><input type="text" id="rua" name="rua" required></div>
                        <div class="form-group"><label for="numero">Número</label><input type="text" id="numero" name="numero" required></div>
                        <div class="form-group"><label for="bairro">Bairro</label><input type="text" id="bairro" name="bairro" required></div>
                        <div class="form-group"><label for="cidade">Cidade</label><input type="text" id="cidade" name="cidade" required></div>
                        <div class="form-group"><label for="estado">Estado</label><input type="text" id="estado" name="estado" required></div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" id="close-modal-btn">Cancelar</button>
                    <button class="btn btn-primary" id="next-step-btn">Próximo</button>
                </div>`;
        // etapa 2: seleção de pagamento
        } else if (step === 2) {
            modalContent.innerHTML = `
                <div class="modal-header"><h3>2. Método de Pagamento</h3><button class="close-modal-btn" id="close-modal-btn-header" aria-label="Fechar modal">&times;</button></div>
                <div class="modal-body">
                    <div class="payment-options">
                        <div class="payment-option" data-method="pix">PIX</div>
                        <div class="payment-option" data-method="boleto">Boleto Bancário</div>
                        <div class="payment-option" data-method="credito">Cartão de Crédito</div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" id="prev-step-btn">Voltar</button>
                    <button class="btn btn-primary" id="finish-btn">Finalizar Pedido</button>
                </div>`;
        // etapa 3: confirmação do pedido
        } else if (step === 3) {
            modalContent.innerHTML = `
                <div class="modal-body confirmation-screen">
                    <h3 style="color: #28a745;">✅ Pedido Realizado!</h3>
                    <p>estamos aguardando a confirmação do pagamento. mais informações serão enviadas para o seu e-mail.</p>
                    <button class="btn btn-primary" id="close-modal-final-btn">Fechar</button>
                </div>`;
            localStorage.removeItem('cart'); // limpa o carrinho do localStorage
            renderCart(); // atualiza a exibição do carrinho (vazio)
        }
    }

    // configuração dos event listeners

    // listener para interações dentro da lista de itens do carrinho (delegação)
    if (cartItemsContainer) {
        cartItemsContainer.addEventListener('click', function (e) {
            const itemElement = e.target.closest('.cart-item');
            if (!itemElement) return; // ignora cliques fora de um item
            const productId = parseInt(itemElement.dataset.id);

            // verifica clique no botão de quantidade
            const quantityButton = e.target.closest('.quantity-change');
            if (quantityButton) {
                const change = parseInt(quantityButton.dataset.change);
                updateQuantity(productId, change);
                return; // evita acionar a remoção se os botões estiverem próximos
            }

            // verifica clique no botão de remover
            const removeButton = e.target.closest('.remove-item-btn');
            if (removeButton) {
                if (confirm('tem certeza que deseja remover este item?')) {
                    removeItem(productId);
                }
            }
        });
    }

    // listener para o botão principal de checkout
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            // verifica se o usuário está logado antes de abrir o modal
            if (!localStorage.getItem('token')) {
                alert('você precisa estar logado para finalizar a compra.');
                // opcional: redirecionar para login
                // window.location.href = '/index.html';
                return;
            }
            showModal(); // abre o modal se logado
        });
    } else {
        console.warn('botão de checkout (id="checkout-btn") não encontrado.');
    }

    // listener para interações dentro do modal de checkout (delegação)
    if (modalContent) {
        modalContent.addEventListener('click', function (e) {
            const target = e.target;
            // botões de fechar/cancelar
            if (target.id === 'close-modal-btn' || target.id === 'close-modal-final-btn' || target.closest('.close-modal-btn')) {
                 hideModal();
            }
            // navegação entre etapas
            else if (target.id === 'next-step-btn') navigateToStep(2);
            else if (target.id === 'prev-step-btn') navigateToStep(1);
            else if (target.id === 'finish-btn') navigateToStep(3);
            // seleção de opção de pagamento
            else if (target.closest('.payment-option')) {
                document.querySelectorAll('.payment-option').forEach(el => el.classList.remove('selected'));
                target.closest('.payment-option').classList.add('selected');
            }
        });
    } else {
         console.warn('elemento do conteúdo do modal (id="checkout-modal-content") não encontrado.');
    }

    // renderização inicial do carrinho ao carregar a página
    renderCart();
});