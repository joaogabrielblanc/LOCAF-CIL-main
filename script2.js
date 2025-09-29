const cpfCnpj = document.getElementById("cpfCnpj");
const nomeCompleto = document.getElementById("nomeCompleto");
const apelido = document.getElementById("apelido");
const nascimento = document.getElementById("nascimento");
const emailField = document.getElementById("email");
const senha = document.getElementById("senha");

// --- Bloquear números em nomes ---
function bloquearNumeros(input) {
  input.addEventListener("input", () => {
    input.value = input.value.replace(/[^A-Za-zÀ-ÖØ-öø-ÿ\s'-]/g, "");
  });
}
bloquearNumeros(nomeCompleto);
bloquearNumeros(apelido);

// --- Máscara CPF/CNPJ ---
cpfCnpj.addEventListener("input", (e) => {
  let v = e.target.value.replace(/\D/g, "");

  if (v.length <= 11) {
    // CPF
    v = v.replace(/(\d{3})(\d)/, "$1.$2");
    v = v.replace(/(\d{3})(\d)/, "$1.$2");
    v = v.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  } else {
    // CNPJ
    v = v.replace(/^(\d{2})(\d)/, "$1.$2");
    v = v.replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3");
    v = v.replace(/\.(\d{3})(\d)/, ".$1/$2");
    v = v.replace(/(\d{4})(\d{1,2})$/, "$1-$2"); // corrigido para pegar últimos dígitos
  }

  e.target.value = v.substring(0, 18);
});

// --- Máscara de data ---
nascimento.addEventListener("input", (e) => {
  let value = e.target.value.replace(/\D/g, "");
  value = value.replace(/(\d{2})(\d)/, "$1/$2");
  value = value.replace(/(\d{2})(\d)/, "$1/$2");
  e.target.value = value.substring(0, 10);
});

// --- Validação idade >= 18 ---
function idadeValida(str) {
  const parts = str.split('/');
  if (parts.length !== 3) return false;
  const d = new Date(parts[2], parts[1] - 1, parts[0]);
  if (isNaN(d)) return false;
  const hoje = new Date();
  let idade = hoje.getFullYear() - d.getFullYear();
  const m = hoje.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && hoje.getDate() < d.getDate())) idade--;
  return idade >= 18;
}

// --- Validação de senha ---
const regras = {
  regra1: /.{8,}/,
  regra2: /[A-Z]/,
  regra3: /[a-z]/,
  regra4: /[0-9]/,
  regra5: /[!@#$%^&*(),.?":{}|<>]/
};
senha.addEventListener("input", () => {
  for (const regra in regras) {
    const el = document.getElementById(regra);
    if (regras[regra].test(senha.value)) {
      el.classList.add("valid");
    } else {
      el.classList.remove("valid");
    }
  }
});

// --- Validação final ---
document.getElementById("formCadastro").addEventListener("submit", (e) => {
  e.preventDefault();
  let erro = false;

  // Checar campos obrigatórios
  [cpfCnpj, nomeCompleto, apelido, nascimento, emailField, senha].forEach(field => {
    if (!field.value.trim()) {
      field.classList.add("input-error");
      erro = true;
    } else {
      field.classList.remove("input-error");
    }
  });

  if (erro) {
    alert("Preencha todos os campos obrigatórios.");
    return;
  }

  // Checar idade
  if (!idadeValida(nascimento.value.trim())) {
    const erroIdade = document.getElementById("nascimento-erro");
    erroIdade.textContent = "Você precisa ter 18 anos ou mais.";
    erroIdade.style.display = "block";
    nascimento.classList.add("input-error");
    return;
  } else {
    document.getElementById("nascimento-erro").style.display = "none";
  }

  // Checar e-mail válido
  const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!regexEmail.test(emailField.value.trim())) {
    const erroEmail = document.getElementById("email-erro");
    erroEmail.textContent = "E-mail inválido.";
    erroEmail.style.display = "block";
    emailField.classList.add("input-error");
    return;
  } else {
    document.getElementById("email-erro").style.display = "none";
  }

  alert("Cadastro realizado com sucesso!");
});