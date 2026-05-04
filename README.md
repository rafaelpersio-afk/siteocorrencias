# 📚 Sistema de Ocorrências Escolares - SaaS

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![SQLite](https://img.shields.io/badge/SQLite-3-blue.svg)](https://www.sqlite.org/)
[![Express](https://img.shields.io/badge/Express-4.18+-lightgrey.svg)](https://expressjs.com/)
[![JWT](https://img.shields.io/badge/JWT-Authentication-orange.svg)](https://jwt.io/)

Um sistema web SaaS moderno para gerenciamento de ocorrências escolares, com autenticação multi-tenant por escola, roles de usuário (Super Admin, Admin, Usuário) e interface responsiva com tema verde moderno.

## ✨ Funcionalidades

### 👤 Sistema de Usuários
- **Super Admin**: Gerencia todas as escolas, usuários e promove admins
- **Admin**: Aprova/rejeita usuários e gerencia ocorrências da própria escola
- **Usuário**: Registra e visualiza ocorrências escolares

### 🏫 Multi-Tenancy por Escola
- Escolas: COLEGIO ADV DO CAMPO LIMPO, COLEGIO ADV PIRAJUSSARA, ESCOLA ADV DA ALVORADA
- Isolamento completo de dados por escola
- Super admin acessa todas as escolas

### 📊 Dashboard Moderno
- **Cards Estatísticos**: Total de usuários, usuários pendentes/aprovados, total de ocorrências
- **Gráfico Mensal**: Visualização de ocorrências por mês
- **Sidebar Responsiva**: Navegação intuitiva com tema verde
- **Interface Moderna**: Design clean com gradientes e animações

### 📝 Gerenciamento de Ocorrências
- Criação de ocorrências com aluno, turma, descrição, data e hora
- Visualização organizada em cards
- Histórico completo com filtros
- Validação de formulários

### 🔐 Segurança
- Autenticação JWT
- Senhas criptografadas com bcrypt
- Middleware de verificação de token
- Controle de acesso baseado em roles

## 🛠️ Tecnologias Utilizadas

- **Backend**: Node.js, Express.js, SQLite3, JWT, bcryptjs, CORS
- **Frontend**: HTML5, CSS3, JavaScript (Vanilla), FontAwesome Icons
- **Arquitetura**: MVC organizada (Routes, Controllers, Models)
- **Banco de Dados**: SQLite (arquivo local)
- **Deploy**: Render (Node.js web service)

## 🚀 Instalação e Execução

### Pré-requisitos
- Node.js 18+
- Git

### Passos
1. Clone o repositório:
   ```bash
   git clone https://github.com/rafaelpersio-afk/siteocorrencias.git
   cd siteocorrencias
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

3. Execute o servidor:
   ```bash
   npm start
   ```

4. Abra no navegador: `http://localhost:3000`

## 👥 Usuários de Teste

| Usuário | Senha | Role | Escola |
|---------|-------|------|--------|
| Rafa.admin | 123 | Super Admin | Todas |
| lucas.usuario | 123 | Usuário | COLEGIO ADV DO CAMPO LIMPO |
| junior.usuario | 123 | Usuário | COLEGIO ADV PIRAJUSSARA |
| maria.usuario | 123 | Usuário | ESCOLA ADV DA ALVORADA |

## 📁 Estrutura do Projeto

```
siteocorrencias/
├── backend/
│   ├── server.js              # Servidor principal (organizado)
│   ├── models/               # Modelos de dados
│   │   ├── Database.js       # Conexões e inicialização DB
│   │   ├── User.js           # Modelo de usuário
│   │   └── Incident.js       # Modelo de ocorrência
│   ├── controllers/          # Controladores da API
│   │   ├── AuthController.js
│   │   ├── UsersController.js
│   │   └── IncidentsController.js
│   ├── routes/               # Rotas da API
│   │   ├── AuthRoutes.js
│   │   ├── UsersRoutes.js
│   │   └── IncidentsRoutes.js
│   ├── middleware/           # Middlewares
│   │   └── auth.js           # Autenticação JWT
│   ├── auth.db              # Banco de autenticação
│   └── database.db          # Banco de dados app
├── frontend/
│   ├── index.html           # Seleção de escola
│   ├── login.html           # Página de login
│   ├── pages/
│   │   └── dashboard.html   # Dashboard moderno
│   ├── components/          # Componentes reutilizáveis
│   │   ├── Sidebar.js       # Sidebar responsiva
│   │   ├── DashboardCards.js # Cards estatísticos
│   │   └── MonthlyChart.js  # Gráfico mensal
│   ├── js/
│   │   ├── login.js         # Lógica de login
│   │   └── dashboard.js     # Lógica do dashboard
│   ├── css/
│   │   └── styles.css       # Estilos modernos (tema verde)
│   └── assets/              # Recursos estáticos
├── package.json             # Configurações Node.js
├── render.yaml              # Configuração Render
└── README.md                # Este arquivo
```

## 🔄 API Endpoints

### Autenticação
- `POST /api/auth/login` - Login de usuário
- `POST /api/auth/register` - Registro de novo usuário

### Usuários
- `GET /api/users` - Listar usuários (com paginação)
- `POST /api/users` - Criar usuário
- `PUT /api/users/:id/status` - Atualizar status do usuário
- `PUT /api/users/:id/role` - Atualizar role do usuário

### Ocorrências
- `GET /api/incidents` - Listar ocorrências (com filtros)
- `POST /api/incidents` - Criar ocorrência
- `GET /api/incidents/stats` - Estatísticas mensais

### Compatibilidade (Legacy)
- Todas as rotas antigas continuam funcionando para compatibilidade

## 🎨 Design System

### Tema Verde Moderno
- **Primary**: #198754 (Verde Bootstrap)
- **Secondary**: #0f5132 (Verde escuro)
- **Accent**: #fd7e14 (Laranja)
- **Background**: Gradiente verde claro
- **Cards**: Branco com sombras suaves

### Componentes
- **Sidebar**: Navegação lateral responsiva
- **Cards**: Estatísticas com ícones e cores
- **Charts**: Gráficos simples em CSS
- **Forms**: Validação e UX moderna
- **Tables**: Tabelas responsivas

## 🌐 Deploy Online

O projeto está configurado para deploy no [Render](https://render.com):

1. Conecte seu repositório GitHub
2. Crie um **Web Service** (não Static Site)
3. Configure:
   - Runtime: Node
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Environment Variables: `NODE_ENV=production`

## 📖 Como Usar

1. **Login**: Use as credenciais de teste ou registre-se
2. **Super Admin**: Gerencie escolas e usuários globais
3. **Admin**: Aprove usuários pendentes da sua escola
4. **Usuário**: Crie e visualize ocorrências

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para detalhes.

## 📞 Contato

Rafael - rafaelpersio-afk

Link do projeto: [https://github.com/rafaelpersio-afk/siteocorrencias](https://github.com/rafaelpersio-afk/siteocorrencias)

