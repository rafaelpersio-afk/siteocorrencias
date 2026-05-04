// Database models and connection
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database connections
const authDb = new sqlite3.Database(path.join(__dirname, 'auth.db'));
const dataDb = new sqlite3.Database(path.join(__dirname, 'database.db'));

// Initialize database tables
authDb.serialize(() => {
  authDb.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE,
    password TEXT NOT NULL,
    empresa_id INTEGER,
    role TEXT NOT NULL DEFAULT 'usuario',
    status TEXT DEFAULT 'pendente',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Seed initial users
  const hashedPassword = require('bcryptjs').hashSync('123', 10);

  authDb.run("DELETE FROM users WHERE username = 'maria.usuario'");

  authDb.get("SELECT * FROM users WHERE username = 'Rafa.admin'", (err, row) => {
    if (!row) {
      authDb.run("INSERT INTO users (username, email, password, role, status) VALUES (?, ?, ?, 'super_admin', 'aprovado')",
        ['Rafa.admin', 'admin@educadv.com', hashedPassword]);
    }
  });

  authDb.get("SELECT * FROM users WHERE username = 'lucas.usuario'", (err, row) => {
    if (!row) {
      authDb.run("INSERT INTO users (username, email, password, empresa_id, role, status) VALUES (?, ?, ?, 1, 'usuario', 'aprovado')",
        ['lucas.usuario', 'lucas@email.com', hashedPassword]);
    } else {
      authDb.run("UPDATE users SET empresa_id = 1, role = 'usuario', status = 'aprovado' WHERE id = ?", [row.id]);
    }
  });

  authDb.get("SELECT * FROM users WHERE username = 'junior.usuario'", (err, row) => {
    if (!row) {
      authDb.run("INSERT INTO users (username, email, password, empresa_id, role, status) VALUES (?, ?, ?, 2, 'usuario', 'aprovado')",
        ['junior.usuario', 'junior@email.com', hashedPassword]);
    } else {
      authDb.run("UPDATE users SET empresa_id = 2, role = 'usuario', status = 'aprovado' WHERE id = ?", [row.id]);
    }
  });

  authDb.get("SELECT * FROM users WHERE username = 'rafa.usuario'", (err, row) => {
    if (!row) {
      authDb.run("INSERT INTO users (username, email, password, empresa_id, role, status) VALUES (?, ?, ?, 3, 'usuario', 'aprovado')",
        ['rafa.usuario', 'rafa@email.com', hashedPassword]);
    } else {
      authDb.run("UPDATE users SET empresa_id = 3, role = 'usuario', status = 'aprovado' WHERE id = ?", [row.id]);
    }
  });
});

dataDb.serialize(() => {
  dataDb.run(`CREATE TABLE IF NOT EXISTS empresas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  dataDb.run(`CREATE TABLE IF NOT EXISTS ocorrencias (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    aluno TEXT NOT NULL,
    turma TEXT NOT NULL,
    descricao TEXT NOT NULL,
    data TEXT NOT NULL,
    hora TEXT NOT NULL,
    empresa_id INTEGER NOT NULL,
    created_by INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (empresa_id) REFERENCES empresas(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
  )`);

  // Seed companies and keep names in the required format
  dataDb.get("SELECT COUNT(*) as count FROM empresas", (err, row) => {
    if (!row || row.count == 0) {
      dataDb.run("INSERT INTO empresas (nome) VALUES (?)", ['Colégio Adventista do Campo Limpo']);
      dataDb.run("INSERT INTO empresas (nome) VALUES (?)", ['Escola Adventista da Alvorada']);
      dataDb.run("INSERT INTO empresas (nome) VALUES (?)", ['Colégio Adventista do Pirajuçara']);
    } else {
      dataDb.run("UPDATE empresas SET nome = ? WHERE id = 1", ['Colégio Adventista do Campo Limpo']);
      dataDb.run("UPDATE empresas SET nome = ? WHERE id = 2", ['Escola Adventista da Alvorada']);
      dataDb.run("UPDATE empresas SET nome = ? WHERE id = 3", ['Colégio Adventista do Pirajuçara']);
    }
  });
});

module.exports = { authDb, dataDb };