// ===============================
// 📌 Seleção dos elementos
// ===============================
const cpfCnpj = document.getElementById("cpfCnpj");
const nomeCompleto = document.getElementById("nomeCompleto");
const apelido = document.getElementById("apelido");
const nascimento = document.getElementById("nascimento");
const emailField = document.getElementById("email");
const senha = document.getElementById("senha");
const form = document.getElementById("formCadastro");

// ===============================
// 🔤 Bloquear números em nomes
// ===============================
function bloquearNumeros(input) {
    input.addEventListener("input", () => {
        input.value = input.value.replace(/[^A-Za-zÀ-ÖØ-öø-ÿ\s'-]/g, "");
    });
}
bloquearNumeros(nomeCompleto);
bloquearNumeros(apelido);

// ===============================
// 🧮 Máscara CPF/CNPJ
// ===============================
cpfCnpj.addEventListener("input", (e) => {
    let v = e.target.value.replace(/\D/g, "");

    if (v.length <= 11) {
        v = v.replace(/(\d{3})(\d)/, "$1.$2");
        v = v.replace(/(\d{3})(\d)/, "$1.$2");
        v = v.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    } else {
        v = v.replace(/^(\d{2})(\d)/, "$1.$2");
        v = v.replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3");
        v = v.replace(/\.(\d{3})(\d)/, ".$1/$2");
        v = v.replace(/(\d{4})(\d{1,2})$/, "$1-$2");
    }

    e.target.value = v.substring(0, 18);
});

// ===============================
// 📅 Máscara Data (DD/MM/AAAA)
// ===============================
nascimento.addEventListener("input", (e) => {
    let value = e.target.value.replace(/\D/g, "");
    value = value.replace(/(\d{2})(\d)/, "$1/$2");
    value = value.replace(/(\d{2})(\d)/, "$1/$2");
    e.target.value = value.substring(0, 10);
});

// ===============================
// 🎂 Validação Idade ≥ 18
// ===============================
function idadeValida(str) {
    const p = str.split("/");
    if (p.length !== 3) return false;

    const d = new Date(p[2], p[1] - 1, p[0]);
    if (isNaN(d.getTime())) return false;

    const hoje = new Date();
    let idade = hoje.getFullYear() - d.getFullYear();
    const m = hoje.getMonth() - d.getMonth();

    if (m < 0 || (m === 0 && hoje.getDate() < d.getDate())) idade--;

    return idade >= 18;
}

// ===============================
// 🔐 Regras da Senha
// ===============================
const regras = {
    regra1: /.{8,}/,           
    regra2: /[A-Z]/,            
    regra3: /[a-z]/,            
    regra4: /[0-9]/,            
    regra5: /[!@#$%^&*(),.?":{}|<>]/ 
};

senha.addEventListener("input", () => {
    for (const r in regras) {
        const el = document.getElementById(r);
        regras[r].test(senha.value)
            ? el.classList.add("valid")
            : el.classList.remove("valid");
    }
});

// ===============================
// 💾 Banco de Dados — LocalStorage
// ===============================
function getUsuarios() {
    let data = localStorage.getItem("usuarios");

    if (!data) return []; // se não existir, retorna array vazio

    try {
        let usuarios = JSON.parse(data);

        if (!Array.isArray(usuarios)) {
            console.warn("Valor inválido no LocalStorage. Resetando...");
            localStorage.setItem("usuarios", JSON.stringify([]));
            return [];
        }

        return usuarios;

    } catch (e) {
        console.error("Erro ao ler LocalStorage:", e);
        localStorage.setItem("usuarios", JSON.stringify([]));
        return [];
    }
}

function salvarUsuarios(lista) {
    localStorage.setItem("usuarios", JSON.stringify(lista));
}

function existeUsuario(cpf, email) {
    return getUsuarios().some(u => u.cpfCnpj === cpf || u.email === email);
}

// ===============================
// 📝 Cadastro
// ===============================
form.addEventListener("submit", (e) => {
    e.preventDefault();

    const data = {
        cpf: cpfCnpj.value.trim(),
        nome: nomeCompleto.value.trim(),
        apelido: apelido.value.trim(),
        nascimento: nascimento.value.trim(),
        email: emailField.value.trim(),
        senha: senha.value.trim()
    };

    if (!idadeValida(data.nascimento)) {
        alert("Você deve ter 18 anos ou mais.");
        return;
    }

    const senhaInvalida = Object.keys(regras).some(r => !regras[r].test(data.senha));
    if (senhaInvalida) {
        alert("A senha não atende aos requisitos.");
        return;
    }

    if (existeUsuario(data.cpf, data.email)) {
        alert("CPF/CNPJ ou Email já cadastrado.");
        return;
    }

    const novoUsuario = {
        id: Date.now(),
        cpfCnpj: data.cpf,
        nome: data.nome,
        apelido: data.apelido,
        nascimento: data.nascimento,
        email: data.email,
        senha: data.senha,
        perfil: "cliente"
    };

    const usuarios = getUsuarios();
    usuarios.push(novoUsuario);
    salvarUsuarios(usuarios);

    alert("Cadastro realizado com sucesso!");
    form.reset();

    window.location.href = "login.html";
});