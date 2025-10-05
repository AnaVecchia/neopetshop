document.addEventListener('DOMContentLoaded', function() {
    const ordersListContainer = document.getElementById('orders-list');
    const token = localStorage.getItem('token');

    // Função auxiliar para realizar requisições autenticadas
    async function fetchWithAuth(url, options = {}) {
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers,
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        return fetch(url, { ...options, headers });
    }

    // Função principal para buscar e renderizar os pedidos
    async function loadOrders() {
        if (!token) {
            ordersListContainer.innerHTML = '<h2>Acesso negado. Você precisa estar logado para ver seus pedidos.</h2>';
            return;
        }

        try {
            const response = await fetchWithAuth('http://localhost:3030/api/orders/user');
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Erro ${response.status}`);
            }

            const orders = await response.json();

            if (orders.length === 0) {
                ordersListContainer.innerHTML = '<p>Você ainda não fez nenhum pedido.</p>';
                return;
            }

            // Limpa o container antes de adicionar os novos elementos
            ordersListContainer.innerHTML = ''; 

            orders.forEach(order => {
                const orderDate = new Date(order.order_date).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                });

                const formattedPrice = new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                }).format(order.total_price);

                const statusClass = order.status.toLowerCase().includes('aguardando') ? 'status-aguardando' : '';

                const orderCardHTML = `
                    <div class="order-card">
                        <div class="order-header">
                            <h3>Pedido #${order.id}</h3>
                            <span class="order-status ${statusClass}">${order.status}</span>
                        </div>
                        <div class="order-details">
                            <p><strong>Data:</strong> ${orderDate}</p>
                            <p><strong>Total:</strong> ${formattedPrice}</p>
                        </div>
                    </div>
                `;
                ordersListContainer.innerHTML += orderCardHTML;
            });

        } catch (error) {
            console.error('Erro ao buscar pedidos:', error);
            ordersListContainer.innerHTML = `<p style="color: red;">Não foi possível carregar seus pedidos. Motivo: ${error.message}</p>`;
        }
    }

    // Executa a função ao carregar a página
    loadOrders();
});