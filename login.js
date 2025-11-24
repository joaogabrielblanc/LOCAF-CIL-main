// ===============================
// 💾 Funções de LocalStorage
// ===============================
function getUsuarios() {
    let data = localStorage.getItem("usuarios");
    if (!data) return [];
    try {
        let usuarios = JSON.parse(data);
        if (!Array.isArray(usuarios)) {
            console.warn("LocalStorage inválido. Resetando...");
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

function existeUsuario(email) {
    return getUsuarios().some(u => u.email.trim().toLowerCase() === email.trim().toLowerCase());
}

// ===============================
// 🔐 Login Unificado
// ===============================
const formLogin = document.getElementById("loginForm");
if (formLogin) {
    const emailInput = document.getElementById("email");
    const senhaInput = document.getElementById("senha");

    formLogin.addEventListener("submit", (e) => {
        e.preventDefault();
        const email = emailInput.value.trim().toLowerCase();
        const senha = senhaInput.value.trim();
        const usuarios = getUsuarios();

        const usuario = usuarios.find(u => u.email.trim().toLowerCase() === email);

        if (!usuario) {
            alert("E-mail não encontrado. Verifique e tente novamente.");
            return;
        }
        if (usuario.senha !== senha) {
            alert("Senha incorreta! Tente novamente.");
            return;
        }

        localStorage.setItem("usuarioLogado", JSON.stringify(usuario));
        alert("Login realizado com sucesso!");
        window.location.href = "index.html"; // redireciona para dashboard
    });
}

// ===============================
// 📝 Cadastro de Clientes ou Afiliados
// ===============================
function cadastrarUsuario({
    form,
    nomeEl, apelidoEl, emailEl, senhaEl,
    cpfEl, nascimentoEl, perfil = "cliente"
}) {
    if (!form) return;

    form.addEventListener("submit", (e) => {
        e.preventDefault();

        const email = emailEl.value.trim().toLowerCase();
        if (existeUsuario(email)) {
            alert("Email já cadastrado.");
            return;
        }

        const usuario = {
            id: Date.now(),
            nome: nomeEl.value.trim(),
            apelido: apelidoEl.value.trim(),
            email: email,
            senha: senhaEl.value.trim(),
            cpf: cpfEl ? cpfEl.value.trim() : "",
            nascimento: nascimentoEl ? nascimentoEl.value.trim() : "",
            perfil: perfil
        };

        const usuarios = getUsuarios();
        usuarios.push(usuario);
        salvarUsuarios(usuarios);

        alert("Cadastro realizado com sucesso!");
        form.reset();
        window.location.href = "login.html";
    });
}

// Chamando para clientes
cadastrarUsuario({
    form: document.getElementById("formCadastro"),
    nomeEl: document.getElementById("nomeCompleto"),
    apelidoEl: document.getElementById("apelido"),
    emailEl: document.getElementById("email"),
    senhaEl: document.getElementById("senha"),
    cpfEl: document.getElementById("cpfCnpj"),
    nascimentoEl: document.getElementById("nascimento"),
    perfil: "cliente"
});

// Chamando para afiliados
cadastrarUsuario({
    form: document.getElementById("formAfiliado"),
    nomeEl: document.getElementById("nomeCompleto"),
    apelidoEl: document.getElementById("apelido"),
    emailEl: document.getElementById("email"),
    senhaEl: document.getElementById("senha"),
    cpfEl: document.getElementById("cpf"),
    perfil: "afiliado"
});
