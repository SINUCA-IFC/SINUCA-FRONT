# SINUCA — Front-end

Interface web do **Simulado Interdisciplinar das Nações Unidas do Campus Araquari (SINUCA)**, projeto do Instituto Federal Catarinense.

A aplicação centraliza notícias, materiais de apoio, tarefas e informações das delegações, facilitando a comunicação entre a organização e os participantes.

A API utilizada pela interface está no [SINUCA-BACK](https://github.com/SINUCA-IFC/SINUCA-BACK).

FIGMA: https://www.figma.com/design/SxdVw9n8771wtU9HICf8Jg/SINUCA---LAYOUT?node-id=422-435&t=YW5CfsnfCA3GOPeE-1

## Funcionalidades

- Mural de notícias e comunicados.
- Cadastro e autenticação com JWT.
- Área autenticada da delegação.
- Quadro de tarefas com criação e edição.
- Consulta de cronogramas e detalhes dos debates.
- Acesso a documentos e materiais de apoio.
- Interface adaptada para dispositivos móveis e desktop.
- Configuração de PWA com manifesto e service worker.

As páginas de **chat** e **história** estão em construção na versão atual da `main`.

## Tecnologias

| Tecnologia | Finalidade |
| --- | --- |
| Vue 3 | Interface e componentes |
| Vite 7 | Desenvolvimento e build |
| Vue Router | Navegação |
| Pinia | Gerenciamento de estado |
| Axios | Comunicação com a API |
| vite-plugin-pwa | Configuração de PWA |
| Material Design Icons | Ícones |
| Prettier | Formatação |

## Pré-requisitos

- Git.
- Node.js compatível com `^20.19.0 || >=22.12.0`.
- npm.
- API do SINUCA disponível.

## Instalação

```bash
git clone https://github.com/SINUCA-IFC/SINUCA-FRONT.git
cd SINUCA-FRONT
npm ci
```

## Configuração da API

A URL está definida em `src/plugins/axios.js`. Atualmente, o cliente utiliza:

```js
axios.defaults.baseURL =
  'https://sinuca-backend.class.fabricadesoftware.ifc.edu.br/api'
```

Para utilizar o back-end local, substitua essa atribuição por:

```js
axios.defaults.baseURL = 'http://127.0.0.1:8000/api'
```

Para configurar a URL por variável de ambiente, substitua a atribuição ativa por:

```js
axios.defaults.baseURL =
  import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api'
```

Depois, crie `.env.local` na raiz:

```dotenv
VITE_API_BASE_URL=http://127.0.0.1:8000/api
```

Reinicie o Vite após alterar o ambiente.

**Apenas criar `.env.local` não altera a API utilizada:** a leitura da variável precisa estar ativa em `axios.js`. Variáveis `VITE_` são públicas e não devem conter segredos.

## Execução

```bash
npm run dev
```

Acesse o endereço informado no terminal, normalmente:

```text
http://localhost:5173
```

Para carregar a área da delegação, o usuário precisa estar associado a um país no back-end. O cadastro público da API cria alunos aguardando atribuição de delegação pela organização.

## Comandos

| Comando | Descrição |
| --- | --- |
| `npm ci` | Instala as dependências do lockfile |
| `npm run dev` | Inicia o servidor de desenvolvimento |
| `npm run build` | Gera o build em `dist/` |
| `npm run preview` | Serve o build para conferência local |
| `npm run format` | Formata os arquivos de `src/` |

O projeto ainda não define scripts de testes automatizados ou lint no `package.json`.

## Rotas principais

| Rota | Conteúdo |
| --- | --- |
| `/` | Redirecionamento conforme a sessão |
| `/mural` | Notícias e comunicados |
| `/bem-vindo` | Entrada para autenticação |
| `/login` | Login pelo fluxo de boas-vindas |
| `/cadastro` | Cadastro de participante |
| `/delegacao` | Área autenticada da delegação |
| `/delegacao/nova-tarefa` | Criação de tarefa |
| `/delegacao/tarefas/:id/editar` | Edição de tarefa |
| `/delegacao/schedule/:id` | Detalhes do cronograma |
| `/chat` | Em construção |
| `/historia` | Em construção |

## Autenticação

O cliente armazena `access_token` e `refresh_token` no `localStorage`.

O Axios adiciona o token às requisições e tenta renovar o acesso quando necessário. As permissões sobre os recursos são verificadas pelo back-end.

## Estrutura

```text
public/             Arquivos públicos
src/
  assets/           Estilos e recursos visuais
  components/       Componentes reutilizáveis
  composables/      Lógica reutilizável de interface
  plugins/          Configuração do Axios
  router/           Rotas e regras de navegação
  services/         Chamadas à API
  stores/           Estado com Pinia
  utils/            Funções auxiliares
  views/            Páginas
  App.vue           Componente raiz
  main.js           Inicialização
static.json         Configuração de hospedagem estática
vite.config.js      Configuração do Vite e da PWA
```

## Publicação

```bash
npm run build
npm run preview
```

Publique o conteúdo de `dist/`.

Como o roteador utiliza `createWebHistory`, a hospedagem deve encaminhar as rotas da aplicação para `index.html`. O arquivo `static.json` descreve esse comportamento para plataformas compatíveis.

Configure a URL da API antes do build e utilize HTTPS para os recursos de PWA que exigem contexto seguro.

## Problemas comuns

| Problema | Verificação |
| --- | --- |
| Requisições vão para a API errada | Confira a atribuição ativa de `baseURL` |
| Delegação não carrega | Verifique a sessão e a associação do usuário a um país |
| Atualizar uma rota retorna 404 | Configure o fallback para `index.html` |
| Fotos locais não carregam | Confira a configuração de mídia do back-end |
| Interface antiga após publicação | Verifique o cache e o service worker |

## Referências

- [Back-end](https://github.com/SINUCA-IFC/SINUCA-BACK)
- [Organização SINUCA-IFC](https://github.com/SINUCA-IFC)
- [Documento do projeto](https://docs.google.com/document/d/17GRwIq2vJa5Fo7NMv2ppM04NwbgOPGmEZtuLE4Cn_as/edit)
