// Auth controller
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const SECRET_KEY = 'your_secret_key';

class AuthController {
  static async login(req, res) {
    try {
      const { username, password, empresa_id } = req.body;

      const user = await User.findByUsername(username);
      if (!user) {
        return res.status(400).json({ error: 'Usuário não encontrado' });
      }

      if (!User.validatePassword(password, user.password)) {
        return res.status(400).json({ error: 'Senha incorreta' });
      }

      if (user.status !== 'aprovado') {
        return res.status(400).json({ error: 'Usuário não aprovado' });
      }

      if (user.role !== 'super_admin' && (!empresa_id || user.empresa_id != empresa_id)) {
        return res.status(400).json({ error: 'Escola incorreta' });
      }

      const token = jwt.sign(
        { id: user.id, role: user.role, empresa_id: user.empresa_id },
        SECRET_KEY,
        { expiresIn: '24h' }
      );

      res.json({
        token,
        role: user.role,
        empresa_id: user.empresa_id,
        username: user.username
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  static async register(req, res) {
    try {
      const { username, email, password, empresa_id } = req.body;

      if (!username || !password || !empresa_id) {
        return res.status(400).json({ error: 'Username, senha e escola são obrigatórios' });
      }

      const result = await User.create({ username, email, password, empresa_id });
      res.json({ id: result.id, message: 'Usuário criado com sucesso' });
    } catch (error) {
      console.error('Register error:', error);
      res.status(500).json({ error: 'Erro ao criar usuário' });
    }
  }
}

module.exports = AuthController;