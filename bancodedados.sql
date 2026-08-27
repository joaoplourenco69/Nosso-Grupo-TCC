create database fireguard;
use fireguard;

CREATE TABLE usuario (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    cpf VARCHAR(11) NOT NULL,
    senha VARCHAR(255) NOT NULL,
    tipo_usuario VARCHAR(20) NOT NULL,
    ativo BOOLEAN DEFAULT TRUE
);
describe usuario;

INSERT INTO usuario
(nome, email, cpf, senha, tipo_usuario, ativo)
VALUES
('Maria Teste', 'maria@teste.com', '12345678900', 'senha_teste', 'FUNCIONARIO', TRUE);

select * from usuario;

SELECT * FROM usuario
WHERE tipo_usuario = 'FUNCIONARIO';

DELETE FROM usuario
WHERE id_usuario = 1;

CREATE TABLE area_monitorada (
    id_area INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT,
    localizacao VARCHAR(255) NOT NULL,
    status VARCHAR(20) NOT NULL
);