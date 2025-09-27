CREATE DATABASE petshop;
use petshop;

CREATE TABLE users (
	id INT auto_increment PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(50) NOT NULL,
    phone VARCHAR(50)
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