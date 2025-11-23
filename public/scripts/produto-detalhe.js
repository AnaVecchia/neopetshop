document.addEventListener('DOMContentLoaded', function() {
    // seletores de elementos do DOM
    const productImage = document.getElementById('product-image');
    const productTitle = document.getElementById('product-title');
    const productDescription = document.getElementById('product-description');
    const productPrice = document.getElementById('product-price');
    const addToCartBtn = document.getElementById('add-to-cart-detail-btn');
    const container = document.querySelector('.product-detail-container'); // cache do container principal

    let currentProduct = null; // armazena os dados do produto carregado

    // verifica se todos os elementos essenciais foram encontrados
    if (!productImage || !productTitle || !productDescription || !productPrice || !addToCartBtn || !container) {
        console.error('erro: um ou mais elementos essenciais da página de detalhes não foram encontrados.');
        if (container) displayError('erro ao carregar a página. tente novamente.'); // exibe erro se possível
        return; // interrompe a execução
    }

    // pega o ID do produto da query string da URL
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');

    // exibe erro se o ID não for encontrado na URL
    if (!productId) {
        displayError('erro: ID do produto não fornecido na URL.');
        return;
    }

    // busca os dados do produto na API pelo ID
    async function fetchProductDetails() {
        try {
            const response = await fetch(`/api/products/${productId}`);

            // trata caso de produto não encontrado (404)
            if (response.status === 404) {
                displayError('produto não encontrado.');
                return;
            }
            // trata outros erros de resposta da API
            if (!response.ok) {
                let errorMsg = `falha ao buscar detalhes do produto (status ${response.status}).`;
                try {
                    const errorData = await response.json(); // tenta obter msg da API
                    errorMsg = errorData.message || errorMsg;
                } catch (e) { /* ignora erro de parsing do json de erro */ }
                throw new Error(errorMsg);
            }

            const product = await response.json();
            currentProduct = product; // armazena dados para uso posterior (ex: add to cart)
            displayProductDetails(product); // preenche a página com os dados

        } catch (error) {
            console.error('erro ao buscar detalhes do produto:', error);
            displayError(error.message); // exibe erro na tela
        }
    }

    // preenche os elementos da página com os dados do produto
    function displayProductDetails(product) {
        productImage.src = product.image_url || 'https://via.placeholder.com/400x400?text=Sem+Imagem';
        productImage.alt = product.title || 'imagem do produto';
        productTitle.textContent = product.title || 'produto sem título';
        productDescription.textContent = product.description || 'produto sem descrição.';
        productPrice.textContent = formatCurrency(product.price); // formata o preço
        addToCartBtn.disabled = false; // habilita o botão 'adicionar ao carrinho'
    }

    // adiciona o produto atual ao carrinho no localStorage
    function addToCart() {
        if (!currentProduct) {
             console.warn('tentativa de adicionar ao carrinho antes do produto carregar.');
             return;
        }

        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        const existingItemIndex = cart.findIndex(item => item.id === currentProduct.id);

        if (existingItemIndex > -1) {
            // incrementa quantidade se o item já existe
            cart[existingItemIndex].quantity = (cart[existingItemIndex].quantity || 0) + 1;
        } else {
            // adiciona novo item ao carrinho com dados essenciais
            cart.push({
                id: currentProduct.id,
                title: currentProduct.title,
                price: currentProduct.price,
                image_url: currentProduct.image_url,
                quantity: 1
            });
        }
        localStorage.setItem('cart', JSON.stringify(cart)); // salva o carrinho atualizado
        alert(`"${currentProduct.title || 'produto'}" foi adicionado ao carrinho!`); // feedback
    }

    // função auxiliar para exibir mensagens de erro no container principal
    function displayError(message) {
         if(container) {
             // substitui o conteúdo por uma mensagem de erro e link para voltar
             container.innerHTML = `<p style="color: red;">${message}</p><a href="/produtos.html">voltar aos produtos</a>`;
         }
    }

     // formata um número como moeda brasileira (BRL)
    function formatCurrency(value) {
        const numericValue = Number(value);
        if (isNaN(numericValue)) {
            console.warn("valor não numérico fornecido para formatCurrency:", value);
            return 'R$ --,--'; // fallback
        }
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(numericValue);
    }

    // adiciona o listener ao botão 'adicionar ao carrinho'
    addToCartBtn.addEventListener('click', addToCart);

    // inicia o processo de busca dos detalhes do produto
    fetchProductDetails();
});