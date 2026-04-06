import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import db from '../utils/db.js'

const SECRET = process.env.JWT_SECRET || 'locafacil_chave_secreta'

export class health {
  static verify(req, res) {
    res.status(200).json({ message: 'healthy', uptime: process.uptime() })
  }

  static async registrar(req, res) {
    try {
      const { nome, apelido, email, senha, cpfCnpj, nascimento, tipo } = req.body

      if (!nome || !email || !senha)
        return res.status(400).json({ erro: 'Nome, e-mail e senha são obrigatórios.' })

      if (senha.length < 6)
        return res.status(400).json({ erro: 'A senha deve ter pelo menos 6 caracteres.' })

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email))
        return res.status(400).json({ erro: 'E-mail inválido.' })

      const jaExiste = await db.get_async(
        'SELECT id FROM usuarios WHERE email = ?',
        [email.toLowerCase().trim()]
      )
      if (jaExiste)
        return res.status(409).json({ erro: 'Este e-mail já está cadastrado.' })

      const hash = await bcrypt.hash(senha, 10)

      const resultado = await db.run_async(
        `INSERT INTO usuarios (nome, apelido, email, senha, cpf_cnpj, nascimento, tipo)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          nome.trim(),
          apelido?.trim() || '',
          email.toLowerCase().trim(),
          hash,
          cpfCnpj?.trim() || '',
          nascimento?.trim() || '',
          tipo || 'fisica'
        ]
      )

      const token = jwt.sign(
        { id: resultado.lastID, email: email.toLowerCase().trim(), nome: nome.trim() },
        SECRET,
        { expiresIn: '2h' }
      )

      res.status(201).json({ mensagem: 'Cadastro realizado!', token, nome: nome.trim() })
    } catch (err) {
      console.error('Erro /registrar:', err)
      res.status(500).json({ erro: 'Erro interno do servidor.' })
    }
  }

  static async login(req, res) {
    try {
      const { email, senha } = req.body

      if (!email || !senha)
        return res.status(400).json({ erro: 'E-mail e senha são obrigatórios.' })

      const usuario = await db.get_async(
        'SELECT * FROM usuarios WHERE email = ?',
        [email.toLowerCase().trim()]
      )
      if (!usuario)
        return res.status(401).json({ erro: 'E-mail não encontrado.' })

      const senhaOk = await bcrypt.compare(senha, usuario.senha)
      if (!senhaOk)
        return res.status(401).json({ erro: 'Senha incorreta.' })

      const token = jwt.sign(
        { id: usuario.id, email: usuario.email, nome: usuario.nome },
        SECRET,
        { expiresIn: '2h' }
      )

      res.json({ mensagem: 'Login realizado!', token, nome: usuario.nome })
    } catch (err) {
      console.error('Erro /login:', err)
      res.status(500).json({ erro: 'Erro interno do servidor.' })
    }
  }

  static async perfil(req, res) {
    try {
      const authHeader = req.headers['authorization'] || ''
      const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null
      if (!token) return res.status(401).json({ erro: 'Token não enviado.' })

      let payload
      try { payload = jwt.verify(token, SECRET) }
      catch { return res.status(403).json({ erro: 'Token inválido ou expirado.' }) }

      const usuario = await db.get_async(
        'SELECT id, nome, apelido, email, cpf_cnpj, nascimento, tipo, criado_em FROM usuarios WHERE id = ?',
        [payload.id]
      )
      if (!usuario) return res.status(404).json({ erro: 'Usuário não encontrado.' })

      res.json({ usuario })
    } catch (err) {
      console.error('Erro /perfil:', err)
      res.status(500).json({ erro: 'Erro interno do servidor.' })
    }
  }
}