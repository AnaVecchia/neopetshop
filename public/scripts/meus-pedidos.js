// explicação spread operator: o operador '...' (spread) expande elementos de iteráveis (como arrays) ou propriedades de objetos, tipo um for each single line
document.addEventListener('DOMContentLoaded', function() {
    const ordersListContainer = document.getElementById('orders-list');

    // envia requisições à API anexando o token JWT, se disponível
    async function fetchWithAuth(url, options = {}) {
        const token = localStorage.getItem('token'); // lê o token atual a cada chamada
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers,
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        return fetch(url, { ...options, headers });
    }

    // busca e exibe o histórico de pedidos do usuário logado
    async function loadOrders() {
        if (!ordersListContainer) {
            console.error('elemento #orders-list não encontrado no DOM.');
            return;
        }

        // verifica se o usuário está logado antes de fazer a requisição
        if (!localStorage.getItem('token')) {
            ordersListContainer.innerHTML = '<h2>acesso negado. você precisa estar logado para ver seus pedidos.</h2>';
            return;
        }

        // indica estado de carregamento (opcional)
        ordersListContainer.innerHTML = '<p>carregando pedidos...</p>';

        try {
            // busca os pedidos usando a função autenticada
            const response = await fetchWithAuth('/api/orders/user');
            const data = await response.json();

            // verifica se a API retornou erro
            if (!response.ok) {
                throw new Error(data.message || `erro ${response.status} ao buscar pedidos.`);
            }

            const orders = data;

            // verifica se não há pedidos
            if (!orders || orders.length === 0) {
                ordersListContainer.innerHTML = '<p>você ainda não fez nenhum pedido.</p>';
                return;
            }

            ordersListContainer.innerHTML = ''; // limpa o container antes de adicionar os cards

            // cria e adiciona o HTML para cada pedido
            orders.forEach(order => {
                // formata data e preço
                const orderDate = new Date(order.order_date).toLocaleDateString('pt-BR', {
                    day: '2-digit', month: '2-digit', year: 'numeric'
                });
                const formattedPrice = new Intl.NumberFormat('pt-BR', {
                    style: 'currency', currency: 'BRL'
                }).format(order.total_price || 0); // fallback para preço nulo/inválido

                const statusClass = order.status && order.status.toLowerCase().includes('aguardando') ? 'status-aguardando' : '';

                // HTML do card do pedido
                const orderCardHTML = `
                    <div class="order-card">
                        <div class="order-header">
                            <h3>pedido #${order.id}</h3>
                            <span class="order-status ${statusClass}">${order.status || 'Status desconhecido'}</span>
                        </div>
                        <div class="order-details">
                            <p><strong>data:</strong> ${orderDate}</p>
                            <p><strong>total:</strong> ${formattedPrice}</p>
                        </div>
                    </div>
                `;
                ordersListContainer.innerHTML += orderCardHTML;
            });

        } catch (error) {
            // exibe mensagem de erro no container
            console.error('erro ao buscar pedidos:', error);
            ordersListContainer.innerHTML = `<p style="color: red;">não foi possível carregar seus pedidos. motivo: ${error.message}</p>`;
        }
    }

    // executa a função principal ao carregar a página
    loadOrders();
});