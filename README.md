# Green-Test: Importação de Boletos

Este projeto importa e processa boletos a partir de arquivos CSV e PDF. Os boletos importados são armazenados em um banco de dados MySQL e podem ser consultados ou exportados em relatório PDF.

## Requisitos
- **Node.js** v16.20.2 ou superior.
- **MySQL**: configure seu banco de dados com as tabelas necessárias e certifique-se de que a tabela `lotes` contenha os registros esperados (ex.: '0017', '0018', '0019').
- (Opcional) **Docker** para rodar o MySQL.

## Instalação
1. Clone o repositório:
   ```bash
   git clone <URL_DO_REPOSITORIO>
   cd green-test
Instale as dependências:

bash
Copiar
npm install
Crie um arquivo .env na raiz do projeto com as variáveis de ambiente, por exemplo:

env
Copiar
DB_HOST=localhost
DB_PORT=3306
DB_USER=greenuser
DB_PASSWORD=greenpass
DB_NAME=greenpark
PORT=3000
Configure seu banco de dados executando os scripts SQL necessários e insira os registros na tabela lotes. Exemplo:

sql
Copiar
INSERT INTO lotes (nome, ativo, criado_em) VALUES ('0017', true, NOW());
INSERT INTO lotes (nome, ativo, criado_em) VALUES ('0018', true, NOW());
INSERT INTO lotes (nome, ativo, criado_em) VALUES ('0019', true, NOW());
Inicie o servidor:

bash
Copiar
npm run dev
Uso
Importação CSV:

Endpoint: POST /boletos/csv

Envie um arquivo CSV com o seguinte exemplo de conteúdo:

arduino
Copiar
"nome;unidade;valor;linha_digitavel"
"JOSE DA SILVA;17;182.54;123456123456123456"
"MARCOS ROBERTO;18;178.20;123456123456123456"
"MARCIA CARVALHO;19;128.00;123456123456123456"
Importação PDF:

Endpoint: POST /boletos/pdf

Envie um arquivo PDF que contenha várias páginas com textos no formato:

objectivec
Copiar
PAGINA BOLETO MARCIA CARVALHO
PAGINA BOLETO JOSE DA SILVA
PAGINA BOLETO MARCOS ROBERTO
Listagem/Relatório:

Endpoint: GET /boletos

Utilize parâmetros de query para filtros (ex.: ?nome=JOSE&valor_inicial=100&valor_final=200&id_lote=3)

Para gerar relatório em PDF codificado em Base64, use: ?relatorio=1

Licença
Este projeto é licenciado sob a licença MIT.
