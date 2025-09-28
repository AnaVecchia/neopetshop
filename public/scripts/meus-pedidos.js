document.addEventListener('DOMContentLoaded', function() {
    const ordersListContainer = document.getElementById('orders-list');
    const user = JSON.parse(localStorage.getItem('user'));

    if (!user) {
        ordersListContainer.innerHTML = '<h2>Você precisa estar logado para ver seus pedidos.</h2>';
        return;
    }

    fetch(`http://localhost:3030/pedidos/usuario/${user.id}`)
        .then(response => response.json())
        .then(orders => {
            if (orders.length === 0) {
                ordersListContainer.innerHTML = '<p>Você ainda não fez nenhum pedido.</p>';
                return;
            }

            orders.forEach(order => {
                const orderDate = new Date(order.order_date).toLocaleDateString('pt-BR', {
                    day: '2-digit', month: '2-digit', year: 'numeric'
                });

                const formattedPrice = new Intl.NumberFormat('pt-BR', { 
                    style: 'currency', currency: 'BRL' 
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
        })
        .catch(error => {
            console.error('Erro ao buscar pedidos:', error);
            ordersListContainer.innerHTML = '<p style="color: red;">Não foi possível carregar seus pedidos.</p>';
        });
});