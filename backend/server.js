const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const SECRET_KEY = 'your_secret_key';

app.use(cors());
app.use(bodyParser.json());

// Servir arquivos estáticos da raiz do projeto
const rootPath = path.join(__dirname, '..');
app.use(express.static(rootPath));

// Servir arquivos estáticos do frontend (para compatibilidade)
const frontendPath = path.join(__dirname, '../frontend');
app.use(express.static(frontendPath));

// Database setup
const authDb = new sqlite3.Database(path.join(__dirname, 'auth.db'));
const dataDb = new sqlite3.Database(path.join(__dirname, 'database.db'));

// Create auth tables
authDb.serialize(() => {
  authDb.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    empresa_id INTEGER,
    role TEXT NOT NULL,
    status TEXT DEFAULT 'pendente'
  )`);

  authDb.get("SELECT * FROM users WHERE username = 'Rafa.admin'", (err, row) => {
    if (!row) {
      const hashedPassword = bcrypt.hashSync('123', 10);
      authDb.run("INSERT INTO users (username, password, role, status) VALUES (?, ?, 'super_admin', 'aprovado')", ['Rafa.admin', hashedPassword]);
    }
  });

  const hashedPassword = bcrypt.hashSync('123', 10);
  authDb.get("SELECT * FROM users WHERE username = 'lucas.usuario'", (err, row) => {
    if (!row) {
      authDb.run("INSERT INTO users (username, password, empresa_id, role, status) VALUES (?, ?, 1, 'usuario', 'aprovado')", ['lucas.usuario', hashedPassword]);
    }
  });
  authDb.get("SELECT * FROM users WHERE username = 'junior.usuario'", (err, row) => {
    if (!row) {
      authDb.run("INSERT INTO users (username, password, empresa_id, role, status) VALUES (?, ?, 2, 'usuario', 'aprovado')", ['junior.usuario', hashedPassword]);
    }
  });
  authDb.get("SELECT * FROM users WHERE username = 'maria.usuario'", (err, row) => {
    if (!row) {
      authDb.run("INSERT INTO users (username, password, empresa_id, role, status) VALUES (?, ?, 3, 'usuario', 'aprovado')", ['maria.usuario', hashedPassword]);
    }
  });
});

// Create app data tables
dataDb.serialize(() => {
  dataDb.run(`CREATE TABLE IF NOT EXISTS empresas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL
  )`);

  dataDb.run(`CREATE TABLE IF NOT EXISTS ocorrencias (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    aluno TEXT NOT NULL,
    turma TEXT NOT NULL,
    descricao TEXT NOT NULL,
    data TEXT NOT NULL,
    hora TEXT NOT NULL,
    empresa_id INTEGER NOT NULL,
    FOREIGN KEY (empresa_id) REFERENCES empresas(id)
  )`);

  dataDb.get("SELECT COUNT(*) as count FROM empresas", (err, row) => {
    if (!row || row.count == 0) {
      dataDb.run("INSERT INTO empresas (nome) VALUES (?)", ['COLEGIO ADV DO CAMPO LIMPO']);
      dataDb.run("INSERT INTO empresas (nome) VALUES (?)", ['COLEGIO ADV PIRAJUSSARA']);
      dataDb.run("INSERT INTO empresas (nome) VALUES (?)", ['ESCOLA ADV DA ALVORADA']);
    }
  });
});

// Middleware to verify token
function verifyToken(req, res, next) {
  const token = req.headers['authorization'];
  if (!token) return res.status(403).json({ error: 'Token required' });
  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) return res.status(401).json({ error: 'Invalid token' });
    req.user = decoded;
    next();
  });
}

// Routes
app.post('/login', (req, res) => {
  const { username, password, empresa_id } = req.body;
  authDb.get("SELECT * FROM users WHERE LOWER(username) = LOWER(?)", [username], (err, user) => {
    if (err || !user) return res.status(400).json({ error: 'Usuário não encontrado' });
    if (!bcrypt.compareSync(password, user.password)) return res.status(400).json({ error: 'Senha incorreta' });
    if (user.status !== 'aprovado') return res.status(400).json({ error: 'Usuário não aprovado' });
    if (user.role !== 'super_admin' && (!empresa_id || user.empresa_id != empresa_id)) return res.status(400).json({ error: 'Escola incorreta' });
    const token = jwt.sign({ id: user.id, role: user.role, empresa_id: user.empresa_id }, SECRET_KEY);
    res.json({ token, role: user.role });
  });
});

app.post('/empresa', verifyToken, (req, res) => {
  if (req.user.role !== 'super_admin') return res.status(403).json({ error: 'Acesso negado' });
  const { nome } = req.body;
  dataDb.run("INSERT INTO empresas (nome) VALUES (?)", [nome], function(err) {
    if (err) return res.status(400).json({ error: 'Erro ao criar escola' });
    res.json({ id: this.lastID });
  });
});

app.post('/register', (req, res) => {
  const { username, password, empresa_id } = req.body;
  if (!username || !password || !empresa_id) {
    return res.status(400).json({ error: 'Username, senha e escola são obrigatórios' });
  }

  const hashedPassword = bcrypt.hashSync(password, 10);
  authDb.run("INSERT INTO users (username, password, role, empresa_id, status) VALUES (?, ?, 'usuario', ?, 'pendente')", [username, hashedPassword, empresa_id], function(err) {
    if (err) return res.status(400).json({ error: 'Erro ao criar usuário' });
    res.json({ id: this.lastID });
  });
});

app.post('/createUser', verifyToken, (req, res) => {
  if (req.user.role !== 'super_admin') return res.status(403).json({ error: 'Acesso negado' });
  const { username, password, role, empresa_id } = req.body;
  if (!username || !password || !empresa_id || !role) {
    return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
  }
  if (role !== 'admin' && role !== 'usuario') {
    return res.status(400).json({ error: 'Role inválido' });
  }

  const hashedPassword = bcrypt.hashSync(password, 10);
  authDb.run("INSERT INTO users (username, password, role, empresa_id, status) VALUES (?, ?, ?, ?, 'pendente')", [username, hashedPassword, role, empresa_id], function(err) {
    if (err) return res.status(400).json({ error: 'Erro ao criar usuário' });
    res.json({ id: this.lastID });
  });
});

app.get('/users', verifyToken, (req, res) => {
  let query = "SELECT id, username, role, status, empresa_id FROM users";
  let params = [];

  if (req.user.role === 'super_admin') {
    if (req.query.empresa_id) {
      query += " WHERE empresa_id = ?";
      params = [req.query.empresa_id];
    }
  } else {
    query += " WHERE empresa_id = ?";
    params = [req.user.empresa_id];
  }

  authDb.all(query, params, (err, rows) => {
    if (err) return res.status(400).json({ error: 'Erro ao buscar usuários' });
    if (rows.length === 0) return res.json([]);

    const schoolIds = [...new Set(rows.map(r => r.empresa_id).filter(Boolean))];
    if (schoolIds.length === 0) {
      return res.json(rows.map(row => ({ ...row, escola: 'N/A' })));
    }

    const placeholders = schoolIds.map(() => '?').join(',');
    dataDb.all(`SELECT id, nome FROM empresas WHERE id IN (${placeholders})`, schoolIds, (err2, schools) => {
      if (err2) return res.status(400).json({ error: 'Erro ao buscar escolas' });
      const schoolMap = {};
      schools.forEach(s => schoolMap[s.id] = s.nome);
      res.json(rows.map(row => ({
        ...row,
        escola: row.empresa_id ? schoolMap[row.empresa_id] || 'Desconhecida' : 'N/A'
      })));
    });
  });
});

app.get('/users-criados', verifyToken, (req, res) => {
  if (req.user.role !== 'super_admin') return res.status(403).json({ error: 'Acesso negado' });
  authDb.all("SELECT id, username, role, status, empresa_id FROM users", (err, rows) => {
    if (err) return res.status(400).json({ error: 'Erro ao buscar usuários' });
    if (rows.length === 0) return res.json([]);

    const schoolIds = [...new Set(rows.map(r => r.empresa_id).filter(Boolean))];
    if (schoolIds.length === 0) {
      return res.json(rows.map(row => ({ ...row, escola: 'N/A' })));
    }

    const placeholders = schoolIds.map(() => '?').join(',');
    dataDb.all(`SELECT id, nome FROM empresas WHERE id IN (${placeholders})`, schoolIds, (err2, schools) => {
      if (err2) return res.status(400).json({ error: 'Erro ao buscar escolas' });
      const schoolMap = {};
      schools.forEach(s => schoolMap[s.id] = s.nome);
      res.json(rows.map(row => ({
        ...row,
        escola: row.empresa_id ? schoolMap[row.empresa_id] || 'Desconhecida' : 'N/A'
      })));
    });
  });
});

app.post('/aprovar', verifyToken, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Acesso negado' });
  const { user_id } = req.body;
  authDb.run("UPDATE users SET status = 'aprovado' WHERE id = ? AND empresa_id = ?", [user_id, req.user.empresa_id], function(err) {
    if (err) return res.status(400).json({ error: 'Erro ao aprovar usuário' });
    res.json({ message: 'Usuário aprovado' });
  });
});

app.post('/recusar', verifyToken, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Acesso negado' });
  const { user_id } = req.body;
  authDb.run("UPDATE users SET status = 'recusado' WHERE id = ? AND empresa_id = ?", [user_id, req.user.empresa_id], function(err) {
    if (err) return res.status(400).json({ error: 'Erro ao recusar usuário' });
    res.json({ message: 'Usuário recusado' });
  });
});

app.post('/promover', verifyToken, (req, res) => {
  if (req.user.role !== 'super_admin') return res.status(403).json({ error: 'Acesso negado' });
  const { user_id } = req.body;
  authDb.run("UPDATE users SET role = 'admin' WHERE id = ?", [user_id], function(err) {
    if (err) return res.status(400).json({ error: 'Erro ao promover usuário' });
    res.json({ message: 'Usuário promovido' });
  });
});

app.post('/rebaixar', verifyToken, (req, res) => {
  if (req.user.role !== 'super_admin') return res.status(403).json({ error: 'Acesso negado' });
  const { user_id } = req.body;
  authDb.run("UPDATE users SET role = 'usuario' WHERE id = ?", [user_id], function(err) {
    if (err) return res.status(400).json({ error: 'Erro ao rebaixar usuário' });
    res.json({ message: 'Usuário rebaixado' });
  });
});

app.post('/promover-admin', verifyToken, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Acesso negado' });
  const { user_id } = req.body;
  authDb.run("UPDATE users SET role = 'admin' WHERE id = ? AND empresa_id = ?", [user_id, req.user.empresa_id], function(err) {
    if (err) return res.status(400).json({ error: 'Erro ao promover usuário' });
    res.json({ message: 'Usuário promovido' });
  });
});

app.post('/rebaixar-admin', verifyToken, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Acesso negado' });
  const { user_id } = req.body;
  authDb.run("UPDATE users SET role = 'usuario' WHERE id = ? AND empresa_id = ?", [user_id, req.user.empresa_id], function(err) {
    if (err) return res.status(400).json({ error: 'Erro ao rebaixar usuário' });
    res.json({ message: 'Usuário rebaixado' });
  });
});

app.post('/ocorrencia', verifyToken, (req, res) => {
  const { aluno, turma, descricao, data, hora } = req.body;
  const empresa_id = req.user.empresa_id;
  dataDb.run("INSERT INTO ocorrencias (aluno, turma, descricao, data, hora, empresa_id) VALUES (?, ?, ?, ?, ?, ?)", [aluno, turma, descricao, data, hora, empresa_id], function(err) {
    if (err) return res.status(400).json({ error: 'Erro ao criar ocorrência' });
    res.json({ id: this.lastID });
  });
});

app.get('/ocorrencias', verifyToken, (req, res) => {
  const empresa_id = req.user.empresa_id;
  dataDb.all("SELECT * FROM ocorrencias WHERE empresa_id = ?", [empresa_id], (err, rows) => {
    if (err) return res.status(400).json({ error: 'Erro ao buscar ocorrências' });
    res.json(rows);
  });
});

app.get('/empresas', (req, res) => {
  dataDb.all("SELECT * FROM empresas", (err, rows) => {
    if (err) return res.status(400).json({ error: 'Erro ao buscar empresas' });
    res.json(rows);
  });
});

// Rota raiz
app.get('/', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// Rota fallback para SPA - serve index.html para rotas não-API
app.use((req, res, next) => {
  if (!req.path.startsWith('/api') && !req.path.startsWith('/login') && !req.path.startsWith('/register') && 
      !req.path.startsWith('/createUser') && !req.path.startsWith('/users') && !req.path.startsWith('/empresa') &&
      !req.path.startsWith('/aprovar') && !req.path.startsWith('/recusar') && !req.path.startsWith('/promover') &&
      !req.path.startsWith('/rebaixar') && !req.path.startsWith('/ocorrencia') && !req.path.startsWith('/ocorrencias') &&
      !req.path.startsWith('/empresas') && !req.path.startsWith('/promover-admin') && !req.path.startsWith('/rebaixar-admin') &&
      !req.path.startsWith('/users-criados') && req.method === 'GET') {
    return res.sendFile(path.join(frontendPath, 'index.html'));
  }
  next();
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});