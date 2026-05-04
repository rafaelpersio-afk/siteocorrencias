// User model
const { authDb } = require('./Database');
const bcrypt = require('bcryptjs');

class User {
  static async findByUsername(username) {
    return new Promise((resolve, reject) => {
      authDb.get("SELECT * FROM users WHERE username = ?", [username], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  static async findById(id) {
    return new Promise((resolve, reject) => {
      authDb.get("SELECT * FROM users WHERE id = ?", [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  static async findAll(filters = {}) {
    return new Promise((resolve, reject) => {
      let query = "SELECT * FROM users WHERE 1=1";
      let params = [];

      if (filters.empresa_id) {
        query += " AND empresa_id = ?";
        params.push(filters.empresa_id);
      }

      if (filters.status) {
        query += " AND status = ?";
        params.push(filters.status);
      }

      if (filters.role) {
        query += " AND role = ?";
        params.push(filters.role);
      }

      if (filters.search) {
        query += " AND (username LIKE ? OR email LIKE ?)";
        params.push(`%${filters.search}%`, `%${filters.search}%`);
      }

      query += " ORDER BY created_at DESC";

      if (filters.limit) {
        query += " LIMIT ?";
        params.push(filters.limit);
      }

      if (filters.offset) {
        query += " OFFSET ?";
        params.push(filters.offset);
      }

      authDb.all(query, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  static async create(userData) {
    return new Promise((resolve, reject) => {
      const { username, email, password, empresa_id, role = 'usuario' } = userData;
      const hashedPassword = bcrypt.hashSync(password, 10);

      authDb.run(
        "INSERT INTO users (username, email, password, empresa_id, role, status) VALUES (?, ?, ?, ?, ?, 'pendente')",
        [username, email, hashedPassword, empresa_id, role],
        function(err) {
          if (err) reject(err);
          else resolve({ id: this.lastID });
        }
      );
    });
  }

  static async updateStatus(id, status) {
    return new Promise((resolve, reject) => {
      authDb.run(
        "UPDATE users SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
        [status, id],
        function(err) {
          if (err) reject(err);
          else resolve({ changes: this.changes });
        }
      );
    });
  }

  static async updateRole(id, role) {
    return new Promise((resolve, reject) => {
      authDb.run(
        "UPDATE users SET role = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
        [role, id],
        function(err) {
          if (err) reject(err);
          else resolve({ changes: this.changes });
        }
      );
    });
  }

  static async getStats(empresa_id = null) {
    return new Promise((resolve, reject) => {
      let query = `
        SELECT
          COUNT(*) as total,
          SUM(CASE WHEN status = 'pendente' THEN 1 ELSE 0 END) as pending,
          SUM(CASE WHEN status = 'aprovado' THEN 1 ELSE 0 END) as approved,
          SUM(CASE WHEN status = 'rejeitado' THEN 1 ELSE 0 END) as rejected
        FROM users
      `;
      let params = [];

      if (empresa_id) {
        query += " WHERE empresa_id = ?";
        params.push(empresa_id);
      }

      authDb.get(query, params, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  static validatePassword(password, hash) {
    return bcrypt.compareSync(password, hash);
  }
}

module.exports = User;