// Seletores
const form = document.getElementById("formAfiliado");
const nome = document.getElementById("nomeAfiliado");
const apelido = document.getElementById("apelidoAfiliado");
const cpf = document.getElementById("cpfAfiliado");
const email = document.getElementById("emailAfiliado");
const senha = document.getElementById("senhaAfiliado");
const confirmSenha = document.getElementById("confirmSenhaAfiliado");
const cep = document.getElementById("cepAfiliado");
const logradouro = document.getElementById("logradouroAfiliado");
const bairro = document.getElementById("bairroAfiliado");
const cidade = document.getElementById("cidadeAfiliado");
const uf = document.getElementById("ufAfiliado");

// Requisitos da senha
const req8 = document.getElementById("req-8");
const reqMaiuscula = document.getElementById("req-maiuscula");
const reqMinuscula = document.getElementById("req-minuscula");
const reqNumero = document.getElementById("req-numero");
const reqEspecial = document.getElementById("req-especial");

const textosFixosSenha = {
    "req-8": "Mínimo 8 caracteres",
    "req-maiuscula": "Letra maiúscula",
    "req-minuscula": "Letra minúscula",
    "req-numero": "Número",
    "req-especial": "Caractere especial (ex: @, #, $)"
};

// Funções de erro
function criarErro(campo, msg) {
    const div = document.getElementById("erro-" + campo.id);
    if (div) { div.textContent = msg; div.style.display = "block"; }
}
function removerErro(campo) {
    const div = document.getElementById("erro-" + campo.id);
    if (div) { div.textContent = ""; div.style.display = "none"; }
}

// Validações
function validarTexto(campo) {
    if (/\d/.test(campo.value)) { criarErro(campo, "Este campo não pode conter números."); return false; }
    removerErro(campo); return true;
}

function validarEmailCampo(campo) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regex.test(campo.value)) { criarErro(campo, "Digite um e-mail válido."); return false; }
    removerErro(campo); return true;
}

function validarSenhaCampo() {
    const s = senha.value;
    const regras = [/.{8,}/, /[A-Z]/, /[a-z]/, /\d/, /[@#$%^&*!?]/];
    for (let r of regras) { if (!r.test(s)) { criarErro(senha, "A senha não atende todos os requisitos."); return false; } }
    removerErro(senha); return true;
}

function validarConfirmacao() {
    if (senha.value !== confirmSenha.value) { criarErro(confirmSenha, "As senhas não coincidem."); return false; }
    removerErro(confirmSenha); return true;
}

// Máscaras CPF e CEP
cpf.addEventListener("input", () => {
    let v = cpf.value.replace(/\D/g, "");
    if (v.length > 3) v = v.replace(/^(\d{3})(\d)/, "$1.$2");
    if (v.length > 6) v = v.replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3");
    if (v.length > 9) v = v.replace(/^(\d{3})\.(\d{3})\.(\d{3})(\d)/, "$1.$2.$3-$4");
    cpf.value = v;
});

cep.addEventListener("input", () => {
    let v = cep.value.replace(/\D/g, "");
    if (v.length > 5) v = v.replace(/^(\d{5})(\d)/, "$1-$2");
    cep.value = v;
});

// API ViaCEP
cep.addEventListener("blur", async () => {
    const valor = cep.value.replace(/\D/g, "");
    if (valor.length !== 8) {
        criarErro(cep, "CEP inválido.");
        return;
    }
    removerErro(cep);
    try {
        const res = await fetch(`https://viacep.com.br/ws/${valor}/json/`);
        const data = await res.json();
        if (data.erro) {
            criarErro(cep, "CEP não encontrado.");
            return;
        }
        logradouro.value = data.logradouro || "";
        bairro.value = data.bairro || "";
        cidade.value = data.localidade || "";
        uf.value = data.uf || "";
    } catch (err) {
        criarErro(cep, "Erro ao consultar o CEP.");
    }
});

// Checklist senha
senha.addEventListener("input", () => {
    const s = senha.value;
    atualizarReq(req8, /.{8,}/.test(s), "req-8");
    atualizarReq(reqMaiuscula, /[A-Z]/.test(s), "req-maiuscula");
    atualizarReq(reqMinuscula, /[a-z]/.test(s), "req-minuscula");
    atualizarReq(reqNumero, /\d/.test(s), "req-numero");
    atualizarReq(reqEspecial, /[@#$%^&*!?]/.test(s), "req-especial");
});
function atualizarReq(el, valido, key) {
    el.textContent = textosFixosSenha[key];
    el.classList.toggle("ok", valido);
    el.classList.toggle("erro", !valido);
}

// LocalStorage
function getUsuarios() {
    const data = localStorage.getItem("usuarios");
    if (!data) return [];
    try { return JSON.parse(data); } 
    catch { return []; }
}
function salvarUsuario(usuario) {
    const lista = getUsuarios();
    lista.push(usuario);
    localStorage.setItem("usuarios", JSON.stringify(lista));
}

// Submit
form.addEventListener("submit", (e) => {
    e.preventDefault();

    const validacoes = [
        validarTexto(nome),
        validarTexto(apelido),
        validarEmailCampo(email),
        validarSenhaCampo(),
        validarConfirmacao()
    ];
    if (validacoes.includes(false)) return;

    // Verificar se email já existe
    if (getUsuarios().some(u => u.email === email.value)) {
        alert("E-mail já cadastrado!");
        return;
    }

    const usuario = {
        id: Date.now(),
        nome: nome.value,
        apelido: apelido.value,
        email: email.value,
        senha: senha.value,
        cpf: cpf.value,
        cep: cep.value,
        logradouro: logradouro.value,
        bairro: bairro.value,
        cidade: cidade.value,
        uf: uf.value,
        perfil: "afiliado"
    };

    salvarUsuario(usuario);
    alert("Cadastro de afiliado realizado com sucesso!");
    form.reset();
    window.location.href = "login.html";
});