document.addEventListener('DOMContentLoaded', function () {
    const cartItemsContainer = document.getElementById('cart-items');
    const summarySubtotal = document.getElementById('summary-subtotal');
    const summaryTotal = document.getElementById('summary-total');
    const checkoutBtn = document.getElementById('checkout-btn');
    const checkoutModal = document.getElementById('checkout-modal');
    const modalContent = document.getElementById('checkout-modal-content');

    let cart = [];
    let currentStep = 1;

    async function fetchWithAuth(url, options = {}) {
        const token = localStorage.getItem('token');
        const headers = { 'Content-Type': 'application/json', ...options.headers };
        if (token) headers['Authorization'] = `Bearer ${token}`;
        return fetch(url, { ...options, headers });
    }

    function renderCart() {
        cart = JSON.parse(localStorage.getItem('cart')) || [];
        cartItemsContainer.innerHTML = '';
        let total = 0;

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<h2 class="cart-empty-message">Seu carrinho está vazio.</h2>';
            if (checkoutBtn) document.getElementById('cart-summary').style.display = 'none';
            return;
        }

        if (checkoutBtn) document.getElementById('cart-summary').style.display = 'block';

        cart.forEach(item => {
            const itemSubtotal = item.price * item.quantity;
            total += itemSubtotal;
            const cartItemHTML = `
                <div class="cart-item" data-id="${item.id}">
                    <img src="${item.image_url || 'https://via.placeholder.com/90x90'}" alt="${item.title}" class="cart-item-image">
                    <div class="cart-item-details">
                        <h4>${item.title}</h4>
                        <p class="item-price">Preço Unitário: ${formatCurrency(item.price)}</p>
                    </div>
                    <div class="quantity-controls">
                        <button class="quantity-change" data-change="-1">-</button>
                        <span>${item.quantity}</span>
                        <button class="quantity-change" data-change="1">+</button>
                    </div>
                    <p class="item-subtotal">${formatCurrency(itemSubtotal)}</p>
                    <button class="remove-item-btn">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16"><path d="M6.5 1h3a.5.5 0 0 1 .5.5v1H6v-1a.5.5 0 0 1 .5-.5ZM11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3A1.5 1.5 0 0 0 5 1.5v1H2.506a.58.58 0 0 0-.01 0H1.5a.5.5 0 0 0 0 1h.538l.853 10.66A2 2 0 0 0 4.885 16h6.23a2 2 0 0 0 1.994-1.84l.853-10.66h.538a.5.5 0 0 0 0-1h-.995a.59.59 0 0 0-.01 0H11Zm1.958 1-.846 10.58a1 1 0 0 1-.997.92h-6.23a1 1 0 0 1-.997-.92L3.042 3.5h9.916Zm-7.487 1a.5.5 0 0 1 .528.47l.5 8.5a.5.5 0 0 1-.998.06L5 5.03a.5.5 0 0 1 .47-.53Zm5.058 0a.5.5 0 0 1 .47.53l-.5 8.5a.5.5 0 1 1-.998-.06l.5-8.5a.5.5 0 0 1 .528-.47ZM8 4.5a.5.5 0 0 1 .5.5v8.5a.5.5 0 0 1-1 0V5a.5.5 0 0 1 .5-.5Z"/></svg>
                    </button>
                </div>`;
            cartItemsContainer.innerHTML += cartItemHTML;
        });

        summarySubtotal.innerText = formatCurrency(total);
        summaryTotal.innerText = formatCurrency(total);
    }

    function updateQuantity(productId, change) {
        const item = cart.find(i => i.id === productId);
        if (item) {
            item.quantity += change;
            if (item.quantity <= 0) removeItem(productId);
            else saveCartAndRerender();
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

    // --- LÓGICA DO MODAL DE CHECKOUT (RESTAURADA) ---
    function showModal() {
        currentStep = 1;
        renderStep(currentStep);
        checkoutModal.classList.add('show');
    }

    function hideModal() {
        checkoutModal.classList.remove('show');
    }

    async function navigateToStep(step) {
        if (step === 2) {
            const requiredFields = ['cep', 'rua', 'numero', 'bairro', 'cidade', 'estado'];
            const isValid = requiredFields.every(id => document.getElementById(id).value.trim() !== '');
            if (!isValid) {
                alert('Por favor, preencha todos os campos do endereço.');
                return;
            }
        }
        if (step === 3) {
            const localCart = JSON.parse(localStorage.getItem('cart'));
            if (!localStorage.getItem('token') || !localCart || localCart.length === 0) {
                alert('Erro: Você precisa estar logado e seu carrinho não pode estar vazio.');
                return;
            }
            try {
                const response = await fetchWithAuth('http://localhost:3030/api/orders', {
                    method: 'POST',
                    body: JSON.stringify({ cart: localCart })
                });
                const result = await response.json();
                if (!response.ok) throw new Error(result.message || 'Falha ao registrar o pedido.');
                console.log(result.message);
            } catch (error) {
                alert(`Ocorreu um erro ao finalizar o pedido: ${error.message}`);
                return;
            }
        }
        currentStep = step;
        renderStep(currentStep);
    }

    function renderStep(step) {
        if (step === 1) {
            modalContent.innerHTML = `
                <div class="modal-header"><h3>1. Endereço de Entrega</h3></div>
                <div class="modal-body">
                    <form id="address-form">
                        <div class="form-group"><label for="cep">CEP</label><input type="text" id="cep" required></div>
                        <div class="form-group"><label for="rua">Rua</label><input type="text" id="rua" required></div>
                        <div class="form-group"><label for="numero">Número</label><input type="text" id="numero" required></div>
                        <div class="form-group"><label for="bairro">Bairro</label><input type="text" id="bairro" required></div>
                        <div class="form-group"><label for="cidade">Cidade</label><input type="text" id="cidade" required></div>
                        <div class="form-group"><label for="estado">Estado</label><input type="text" id="estado" required></div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button class="btn-secondary" id="close-modal-btn">Cancelar</button>
                    <button class="btn-primary" id="next-step-btn">Próximo</button>
                </div>`;
        } else if (step === 2) {
            modalContent.innerHTML = `
                <div class="modal-header"><h3>2. Método de Pagamento</h3></div>
                <div class="modal-body">
                    <div class="payment-options">
                        <div class="payment-option" data-method="pix">PIX</div>
                        <div class="payment-option" data-method="boleto">Boleto Bancário</div>
                        <div class="payment-option" data-method="credito">Cartão de Crédito</div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn-secondary" id="prev-step-btn">Voltar</button>
                    <button class="btn-primary" id="finish-btn">Finalizar Pedido</button>
                </div>`;
        } else if (step === 3) {
            modalContent.innerHTML = `
                <div class="modal-body confirmation-screen">
                    <h3 style="color: #28a745;">✅ Pedido Realizado!</h3>
                    <p>Estamos aguardando a confirmação do pagamento. Mais informações serão enviadas para o seu e-mail.</p>
                    <button class="btn-primary" id="close-modal-final-btn">Fechar</button>
                </div>`;
            localStorage.removeItem('cart');
            renderCart();
        }
    }

    // --- EVENT LISTENERS ---
    cartItemsContainer.addEventListener('click', function (e) {
        const itemElement = e.target.closest('.cart-item');
        if (!itemElement) return;
        const productId = parseInt(itemElement.dataset.id);
        if (e.target.closest('.quantity-change')) {
            const button = e.target.closest('.quantity-change');
            const change = parseInt(button.dataset.change);
            updateQuantity(productId, change);
        }
        if (e.target.closest('.remove-item-btn')) {
            if (confirm('Tem certeza que deseja remover este item?')) {
                removeItem(productId);
            }
        }
    });

    if (checkoutBtn) checkoutBtn.addEventListener('click', showModal);

    modalContent.addEventListener('click', function (e) {
        const target = e.target;
        if (target.id === 'close-modal-btn' || target.id === 'close-modal-final-btn') hideModal();
        if (target.id === 'next-step-btn') navigateToStep(2);
        if (target.id === 'prev-step-btn') navigateToStep(1);
        if (target.id === 'finish-btn') navigateToStep(3);
        if (target.closest('.payment-option')) {
            document.querySelectorAll('.payment-option').forEach(el => el.classList.remove('selected'));
            target.closest('.payment-option').classList.add('selected');
        }
    });

    renderCart();
});