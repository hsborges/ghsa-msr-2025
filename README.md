
# Coletor de Advisories e Dados do GitHub

Este projeto automatiza a coleta de dados públicos do GitHub relacionados a advisories de segurança, repositórios e usuários envolvidos.

## Funcionalidades

- Busca advisories globais de segurança usando a API do GitHub
- Coleta informações dos repositórios afetados
- Coleta dados dos usuários e organizações relacionados
- Salva os resultados em arquivos JSON na pasta `data/`

## Estrutura dos principais arquivos

- `src/advisories.ts`: coleta advisories de segurança
- `src/repos.ts`: coleta dados de repositórios
- `src/users.ts`: coleta dados de usuários
- `src/utils/`: utilitários para escrita de arquivos e manipulação de iteradores

## Como funciona

O script principal (`src/index.ts`) executa a sequência:

1. Busca advisories
2. Extrai e busca repositórios relacionados
3. Extrai e busca usuários e organizações
4. Salva tudo em arquivos JSON

## Requisitos

- Node.js >= 22
- Token de acesso à API do GitHub (opcional, mas recomendado para evitar limites de rate limit)

## Variáveis de Ambiente

O projeto utiliza variáveis de ambiente para configuração. Você pode criar um arquivo `.env` na raiz do projeto ou usar o `.env.example` como base:

```env
NODE_ENV=development            # Ambiente de execução: development, production ou test
LOG_LEVEL=info                  # Nível de log: debug, info, warn, error
GITHUB_API_URL=https://api.github.com  # URL da API do GitHub
GITHUB_TOKEN=                   # Token de acesso à API do GitHub (opcional)
CACHE_PATH=./.cache             # Caminho para cache local
CACHE_STRATEGY=force-cache      # Estratégia de cache: default ou force-cache
```

Exemplo:

```sh
cp .env.example .env
# Edite o arquivo .env conforme necessário
```

## Uso

Instale as dependências e execute:

```sh
npm install
npm start
```

Os dados serão salvos na pasta `data/`.
