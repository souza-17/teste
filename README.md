# Green-Test: Importação de Boletos

Este projeto importa e processa boletos a partir de arquivos CSV e PDF. Os boletos importados são armazenados em um banco de dados MySQL e podem ser consultados ou exportados em relatório PDF.

## Requisitos
- **Node.js** v16.20.2 ou superior.
- **MySQL**: configure seu banco de dados com as tabelas necessárias e certifique-se de que a tabela `lotes` contenha os registros esperados (ex.: '0017', '0018', '0019').
- (Opcional) **Docker** para rodar o MySQL.

## Instalação
1. Clone o repositório:
   ```
   git clone <URL_DO_REPOSITORIO>
   cd green-test
Instale as dependências:

     npm install
 
Crie um arquivo .env na raiz do projeto com as variáveis de ambiente, por exemplo:

      DB_HOST=localhost
      DB_PORT=3306
      DB_USER=greenuser
      DB_PASSWORD=greenpass
      DB_NAME=greenpark
      PORT=3000
      
Configure seu banco de dados executando os scripts SQL necessários e insira os registros na tabela lotes. Exemplo:

      sql
      INSERT INTO lotes (nome, ativo, criado_em) VALUES ('0017', true, NOW());
      INSERT INTO lotes (nome, ativo, criado_em) VALUES ('0018', true, NOW());
      INSERT INTO lotes (nome, ativo, criado_em) VALUES ('0019', true, NOW());


Inicie o servidor:

      npx ts-node-dev src/server.ts


Uso

Existe um arquivo Colletion.json para importar no POSTMAN as requisições e Exemplos:

         {
          "info": {
            "_postman_id": "12345678-90ab-cdef-1234-567890abcdef",
            "name": "Green Test API",
            "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
          },
          "item": [
            {
              "name": "Import CSV Boletos",
              "request": {
                "method": "POST",
                "header": [],
                "body": {
                  "mode": "formdata",
                  "formdata": [
                    {
                      "key": "file",
                      "type": "file",
                      "src": ""
                    }
                  ]
                },
                "url": {
                  "raw": "http://localhost:3000/boletos/csv",
                  "protocol": "http",
                  "host": ["localhost"],
                  "port": "3000",
                  "path": ["boletos", "csv"]
                }
              },
              "response": []
            },
            {
              "name": "Import PDF Boletos",
              "request": {
                "method": "POST",
                "header": [],
                "body": {
                  "mode": "formdata",
                  "formdata": [
                    {
                      "key": "file",
                      "type": "file",
                      "src": ""
                    }
                  ]
                },
                "url": {
                  "raw": "http://localhost:3000/boletos/pdf",
                  "protocol": "http",
                  "host": ["localhost"],
                  "port": "3000",
                  "path": ["boletos", "pdf"]
                }
              },
              "response": []
            },
            {
              "name": "Listar Boletos",
              "request": {
                "method": "GET",
                "header": [],
                "url": {
                  "raw": "http://localhost:3000/boletos?nome=JOSE&valor_inicial=100&valor_final=200&id_lote=3",
                  "protocol": "http",
                  "host": ["localhost"],
                  "port": "3000",
                  "path": ["boletos"],
                  "query": [
                    { "key": "nome", "value": "JOSE" },
                    { "key": "valor_inicial", "value": "100" },
                    { "key": "valor_final", "value": "200" },
                    { "key": "id_lote", "value": "3" }
                  ]
                }
              },
              "response": []
            },
            {
              "name": "Gerar Relatório PDF (Base64)",
              "request": {
                "method": "GET",
                "header": [],
                "url": {
                  "raw": "http://localhost:3000/boletos?relatorio=1",
                  "protocol": "http",
                  "host": ["localhost"],
                  "port": "3000",
                  "path": ["boletos"],
                  "query": [
                    { "key": "relatorio", "value": "1" }
                  ]
                }
              },
              "response": []
            }
          ]
      }


Importação CSV:

Endpoint: POST /boletos/csv

Envie um arquivo CSV com o seguinte exemplo de conteúdo:

      "nome;unidade;valor;linha_digitavel"
      "JOSE DA SILVA;17;182.54;123456123456123456"
      "MARCOS ROBERTO;18;178.20;123456123456123456"
      "MARCIA CARVALHO;19;128.00;123456123456123456"

Importação PDF:

Endpoint: POST /boletos/pdf

Envie um arquivo PDF que contenha várias páginas com textos no formato:

      PAGINA 1 BOLETO MARCIA CARVALHO
      PAGINA 2 BOLETO JOSE DA SILVA
      PAGINA 3 BOLETO MARCOS ROBERTO

Listagem/Relatório:

Endpoint: GET /boletos

Utilize parâmetros de query para filtros (ex.: ?nome=JOSE&valor_inicial=100&valor_final=200&id_lote=3)

Para gerar relatório em PDF codificado em Base64, use: ?relatorio=1

Licença
Este projeto é licenciado sob a licença MIT.
