CREATE DATABASE petshop;
use petshop;

CREATE TABLE users (
	id INT auto_increment PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    profile_image_url VARCHAR(255) NULL,
    phone VARCHAR(255)
);

CREATE TABLE products (
	id INT auto_increment PRIMARY KEY,
    image_url VARCHAR(255),
    title VARCHAR(255) NOT NULL,
    description VARCHAR(255) NOT NULL,
    price DOUBLE NOT NULL
);

select * from users;

select * from products;

DELETE FROM products WHERE id = 2;

DROP TABLE usuarios;

CREATE TABLE orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    total_price DECIMAL(10, 2) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'Aguardando Pagamento',
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    price_at_purchase DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
);

ALTER TABLE users ADD COLUMN role VARCHAR(10) NOT NULL DEFAULT 'cliente';

DROP table order_items;
DROP table orders;
DROP table users;
DROP table products;
