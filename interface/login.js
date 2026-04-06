// script2.js — coloque na pasta interface/ (usado pelo cadastra-se.html)
const API = 'http://localhost:3000/api'

// ── Validação de senha em tempo real ─────────────────────
const senhaInput = document.getElementById('senha')
if (senhaInput) {
  senhaInput.addEventListener('input', () => {
    const v = senhaInput.value

    const regras = {
      regra1: v.length >= 8,
      regra2: /[A-Z]/.test(v),
      regra3: /[a-z]/.test(v),
      regra4: /[0-9]/.test(v),
      regra5: /[@#$%^&*!]/.test(v),
    }

    for (const [id, valido] of Object.entries(regras)) {
      const el = document.getElementById(id)
      if (el) el.classList.toggle('valid', valido)
    }
  })
}

// ── Máscara CPF/CNPJ ─────────────────────────────────────
const cpfCnpjInput = document.getElementById('cpfCnpj')
if (cpfCnpjInput) {
  cpfCnpjInput.addEventListener('input', () => {
    let v = cpfCnpjInput.value.replace(/\D/g, '')
    if (v.length <= 11) {
      v = v.replace(/(\d{3})(\d)/, '$1.$2')
           .replace(/(\d{3})(\d)/, '$1.$2')
           .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
    } else {
      v = v.replace(/(\d{2})(\d)/, '$1.$2')
           .replace(/(\d{3})(\d)/, '$1.$2')
           .replace(/(\d{3})(\d)/, '$1/$2')
           .replace(/(\d{4})(\d{1,2})$/, '$1-$2')
    }
    cpfCnpjInput.value = v
  })
}

// ── Máscara data de nascimento ────────────────────────────
const nascimentoInput = document.getElementById('nascimento')
if (nascimentoInput) {
  nascimentoInput.addEventListener('input', () => {
    let v = nascimentoInput.value.replace(/\D/g, '')
    v = v.replace(/(\d{2})(\d)/, '$1/$2')
         .replace(/(\d{2})(\d)/, '$1/$2')
         .replace(/(\d{4})\d+?$/, '$1')
    nascimentoInput.value = v
  })
}

// ── Cadastro integrado ao backend ────────────────────────
const formCadastro = document.getElementById('formCadastro')
if (formCadastro) {
  formCadastro.addEventListener('submit', async (e) => {
    e.preventDefault()

    const nome      = document.getElementById('nomeCompleto')?.value.trim()
    const apelido   = document.getElementById('apelido')?.value.trim()
    const email     = document.getElementById('email')?.value.trim().toLowerCase()
    const senha     = document.getElementById('senha')?.value
    const cpfCnpj   = document.getElementById('cpfCnpj')?.value.trim()
    const nascimento= document.getElementById('nascimento')?.value.trim()
    const tipo      = document.querySelector('input[name="tipo"]:checked')?.value || 'fisica'

    // Validações básicas
    if (!nome || !apelido || !email || !senha || !cpfCnpj || !nascimento) {
      alert('Preencha todos os campos obrigatórios.')
      return
    }

    if (senha.length < 8) {
      alert('A senha deve ter pelo menos 8 caracteres.')
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      alert('E-mail inválido.')
      return
    }

    const btn = formCadastro.querySelector('input[type="submit"]')
    btn.disabled = true
    btn.value    = 'Aguarde...'

    try {
      const res = await fetch(`${API}/registrar`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ nome, apelido, email, senha, cpfCnpj, nascimento, tipo })
      })

      const data = await res.json()

      if (!res.ok) {
        alert(data.erro || 'Erro ao cadastrar.')
        return
      }

      // Salva token automaticamente (já entra logado)
      localStorage.setItem('lf_token', data.token)
      localStorage.setItem('lf_nome',  data.nome)
      localStorage.setItem('lf_email', email)

      alert('Cadastro realizado com sucesso! Bem-vindo, ' + data.nome + '!')
      window.location.href = 'index.html'

    } catch (err) {
      alert('Não foi possível conectar ao servidor. Verifique se ele está rodando.')
      console.error(err)
    } finally {
      btn.disabled = false
      btn.value    = 'Cadastre-se'
    }
  })
}