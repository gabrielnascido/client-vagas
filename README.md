# Cliente da API de Vagas

Cliente web para sistema de gerenciamento de vagas de emprego, desenvolvido em Vue.js.

## 📋 Pré-requisitos

- Node.js (versão 16 ou superior)
- npm ou yarn
- Backend da API rodando (veja configuração abaixo)

## 🚀 Como Executar

### 1. Instalar Dependências

```bash
npm install
```

### 2. Executar em Modo de Desenvolvimento

```bash
npm run dev
```

O aplicativo estará disponível em `http://localhost:5173` (ou outra porta indicada no terminal).

### 3. Conectar ao Backend

Na tela inicial, informe:
- **IP do Servidor**: endereço onde o backend está rodando (ex: `localhost`)
- **Porta**: porta do backend (ex: `21234`)

Clique em **Conectar**.

## 👥 Funcionalidades

### Para Candidatos
- Cadastro e autenticação
- Busca de vagas com filtros (título, área, localização, salário)
- Candidatura a vagas
- Visualização de feedbacks recebidos
- Gerenciamento de perfil

### Para Empresas
- Cadastro e autenticação
- Criação e gerenciamento de vagas
- Visualização de candidatos
- Envio de feedbacks aos candidatos
- Gerenciamento de perfil

## 🛠️ Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview da build
npm run preview

# Testes
npm run test:unit

# Lint
npm run lint
```

## 📦 Tecnologias

- Vue 3 (Composition API)
- Vite
- Vue Router
- Pinia

---

**Nota**: Certifique-se de que o backend da aplicação está rodando antes de iniciar o cliente.
