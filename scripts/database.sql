CREATE TABLE IF NOT EXISTS lotes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    ativo BOOLEAN DEFAULT true,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS boletos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome_sacado VARCHAR(255) NOT NULL,
    id_lote INT NOT NULL,
    valor DECIMAL(10,2) NOT NULL,
    linha_digitavel VARCHAR(255) NOT NULL,
    ativo BOOLEAN DEFAULT true,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_lote) REFERENCES lotes(id)
);


INSERT INTO lotes (nome, ativo, criado_em) VALUES ('0017', true, NOW());
INSERT INTO lotes (nome, ativo, criado_em) VALUES ('0018', true, NOW());
INSERT INTO lotes (nome, ativo, criado_em) VALUES ('0019', true, NOW());
