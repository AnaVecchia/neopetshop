document.addEventListener('DOMContentLoaded', function () {
    // --- SELETORES DOS ELEMENTOS DO CARRINHO ---
    const cartItemsContainer = document.getElementById('cart-items');
    const cartTotalElement = document.getElementById('cart-total');

    // --- SELETORES DOS ELEMENTOS DO MODAL ---
    const checkoutBtn = document.getElementById('checkout-btn');
    const checkoutModal = document.getElementById('checkout-modal');
    const modalContent = document.getElementById('checkout-modal-content');

    let cart = [];
    let currentStep = 1;

    // --- CÓDIGO DO CARRINHO ---

    function renderCart() {
        cart = JSON.parse(localStorage.getItem('cart')) || [];
        cartItemsContainer.innerHTML = '';
        let total = 0;

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<h2>Seu carrinho está vazio.</h2>';
            cartTotalElement.innerText = 'Total: R$ 0,00';
            if (checkoutBtn) checkoutBtn.style.display = 'none';
            return;
        }

        if (checkoutBtn) checkoutBtn.style.display = 'block';

        cart.forEach(item => {
            const itemSubtotal = item.price * item.quantity;
            total += itemSubtotal;
            const cartItemHTML = `
                <div class="cart-item">
                    <img src="${item.image_url || 'https://via.placeholder.com/80x80'}" alt="${item.title}" class="cart-item-image">
                    <div class="cart-item-details">
                        <h2>${item.title}</h2>
                        <span class="item-price">Preço: ${formatCurrency(item.price)}</span>
                    </div>
                    <div class="quantity-controls">
                        <a><button class="quantity-change" data-id="${item.id}" data-change="-1">-</button></a>
                        <h3>${item.quantity}</h3>
                        <a><button class="quantity-change" data-id="${item.id}" data-change="1">+</button></a>
                    </div>
                    <div class="item-subtotal"><h3>Subtotal: ${formatCurrency(itemSubtotal)}</h3></div>
                    <button class="remove-item-btn" data-id="${item.id}">&times;</button>
                </div>
            `;
            cartItemsContainer.innerHTML += cartItemHTML;
        });

        cartTotalElement.innerText = `Total: ${formatCurrency(total)}`;
    }

    function updateQuantity(productId, change) {
        const item = cart.find(i => i.id === productId);
        if (item) {
            item.quantity += change;
            if (item.quantity <= 0) {
                removeItem(productId);
            } else {
                saveCartAndRerender();
            }
        }
    }

    function removeItem(productId) {
        cart = cart.filter(i => i.id !== productId);
        saveCartAndRerender();
    }

    function saveCartAndRerender() {
        localStorage.setItem('cart', JSON.stringify(cart));
        renderCart();
    }

    function formatCurrency(value) {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    }

    // --- FUNÇÕES DO MODAL DE CHECKOUT (COM TAGS AJUSTADAS) ---

    function showModal() {
        currentStep = 1;
        renderStep(currentStep);
        checkoutModal.classList.add('show');
    }

    function hideModal() {
        checkoutModal.classList.remove('show');
    }

    // No seu carrinho.js, substitua a função navigateToStep por esta:
    async function navigateToStep(step) {
        // Validação do formulário de endereço
        if (step === 2) {
            const requiredFields = ['cep', 'rua', 'numero', 'bairro', 'cidade', 'estado'];
            const isValid = requiredFields.every(id => document.getElementById(id).value.trim() !== '');
            if (!isValid) {
                alert('Por favor, preencha todos os campos do endereço.');
                return;
            }
        }

        // Lógica para finalizar o pedido
        if (step === 3) {
            const user = JSON.parse(localStorage.getItem('user'));
            const cart = JSON.parse(localStorage.getItem('cart'));

            if (!user || !cart) {
                alert('Erro: Usuário não logado ou carrinho vazio.');
                return;
            }

            try {
                const response = await fetch('http://localhost:3030/pedidos', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId: user.id, cart: cart })
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Falha ao registrar o pedido.');
                }

                const result = await response.json();
                console.log(result.message); // Ex: "Pedido realizado com sucesso!"

            } catch (error) {
                alert(`Ocorreu um erro: ${error.message}`);
                return; // Impede de avançar para a tela de confirmação se houver erro
            }
        }

        currentStep = step;
        renderStep(currentStep); // Avança para a próxima etapa (seja 2 ou 3)
    }
    // AQUI ESTÁ A MUDANÇA PRINCIPAL
    function renderStep(step) {
        if (step === 1) { // Etapa 1: Endereço
            modalContent.innerHTML = `
                <div id="step1" class="checkout-step active">
                    <h2>1. Endereço de Entrega</h2>
                    <form id="address-form">
                        <div class="form-group"><h4>CEP</h4><input type="text" id="cep" required></div>
                        <div class="form-group"><h4>Rua</h4><input type="text" id="rua" required></div>
                        <div class="form-group"><h4>Número</h4><input type="text" id="numero" required></div>
                        <div class="form-group"><h4>Bairro</h4><input type="text" id="bairro" required></div>
                        <div class="form-group"><h4>Cidade</h4><input type="text" id="cidade" required></div>
                        <div class="form-group"><h4>Estado</h4><input type="text" id="estado" required></div>
                    </form>
                    <div class="step-navigation">
                        <button class="btn btn-secondary" id="close-modal-btn">Cancelar</button>
                        <button class="btn btn-primary" id="next-step-btn">Próximo</button>
                    </div>
                </div>
            `;
        } else if (step === 2) { // Etapa 2: Pagamento
            modalContent.innerHTML = `
                <div id="step2" class="checkout-step active">
                    <h2>2. Método de Pagamento</h2>
                    <div class="payment-options">
                        <div class="payment-option" data-method="pix"><h4>PIX</h4></div>
                        <div class="payment-option" data-method="boleto"><h4>Boleto Bancário</h4></div>
                        <div class="payment-option" data-method="credito"><h4>Cartão de Crédito</h4></div>
                    </div>
                    <div class="step-navigation">
                        <button class="btn btn-secondary" id="prev-step-btn">Voltar</button>
                        <button class="btn btn-primary" id="finish-btn">Finalizar Pedido</button>
                    </div>
                </div>
            `;
        } else if (step === 3) { // Etapa 3: Confirmação
            modalContent.innerHTML = `
                <div id="step3" class="checkout-step active confirmation-screen">
                    <h2 style="color: #28a745;">✅ Pedido Realizado!</h2>
                    <h4>Estamos aguardando a confirmação do pagamento. Mais informações serão enviadas para o seu e-mail.</h4>
                    <button class="btn btn-primary" id="close-modal-final-btn">Fechar</button>
                </div>
            `;
            localStorage.removeItem('cart');
            renderCart();
        }
    }

    // --- EVENT LISTENERS ---

    cartItemsContainer.addEventListener('click', function (e) {
        const target = e.target;
        if (target.classList.contains('quantity-change')) {
            const productId = parseInt(target.dataset.id);
            const change = parseInt(target.dataset.change);
            updateQuantity(productId, change);
        }
        if (target.classList.contains('remove-item-btn')) {
            const productId = parseInt(target.dataset.id);
            if (confirm('Tem certeza que deseja remover este item?')) {
                removeItem(productId);
            }
        }
    });

    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', showModal);
    } else {
        console.warn('Botão de checkout com id="checkout-btn" não foi encontrado.');
    }

    modalContent.addEventListener('click', function (e) {
        const target = e.target;
        if (target.id === 'close-modal-btn' || target.id === 'close-modal-final-btn') {
            hideModal();
        }
        if (target.id === 'next-step-btn') {
            navigateToStep(2);
        }
        if (target.id === 'prev-step-btn') {
            navigateToStep(1);
        }
        if (target.id === 'finish-btn') {
            navigateToStep(3);
        }
        if (target.closest('.payment-option')) {
            document.querySelectorAll('.payment-option').forEach(el => el.classList.remove('selected'));
            target.closest('.payment-option').classList.add('selected');
        }
    });

    renderCart();
});