// Constante do seu backend
const API_URL = "https://petwalk-api-0kzx.onrender.com/api";

// Aguarda o HTML carregar para inicializar os ícones
document.addEventListener("DOMContentLoaded", () => {
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
});

// Navegação entre telas do index
function navigate(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');
    
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

// ----------------------------------------------------
// INTEGRAÇÃO COM BACKEND: REGISTRO
// ----------------------------------------------------
async function handleRegister(tipo) {
    let nome, email, senha, telefone;

    // Pega os dados baseados na tela que o usuário está preenchendo
    if (tipo === 'dono') {
        nome = document.getElementById('ownerName').value;
        email = document.getElementById('ownerEmail').value;
        telefone = document.getElementById('ownerPhone').value;
        senha = document.getElementById('ownerPass').value;
    } else {
        nome = document.getElementById('walkerName').value;
        email = document.getElementById('walkerEmail').value;
        telefone = document.getElementById('walkerPhone').value;
        senha = document.getElementById('walkerPass').value;
    }

    if (!nome || !email || !senha || !telefone) {
        alert("Por favor, preencha todos os campos.");
        return;
    }

    try {
        const response = await fetch(`${API_URL}/auth/registo`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nome, email, senha, telefone, tipo_usuario: tipo })
        });

        const data = await response.json();

        if (response.ok) {
            alert(`Conta de ${tipo} criada com sucesso! Faça login para continuar.`);
            navigate('login'); // Volta para a tela de login
        } else {
            alert("Erro: " + data.erro);
        }
    } catch (error) {
        console.error("Erro no cadastro:", error);
        alert("Falha ao comunicar com o servidor.");
    }
}

// ----------------------------------------------------
// INTEGRAÇÃO COM BACKEND: LOGIN
// ----------------------------------------------------
async function handleAuthLogin() {
    const email = document.getElementById('loginEmail').value;
    const senha = document.getElementById('loginPass').value;

    if (!email || !senha) {
        alert("Por favor, preencha E-mail e Senha.");
        return;
    }

    try {
        
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, senha })
        });

        const data = await response.json();

        if (response.ok) {
            // Salva as informações do usuário logado no navegador
            localStorage.setItem('usuarioLogado', JSON.stringify(data.usuario));
            
            // Redireciona de acordo com o cargo (role) real salvo no banco
            if (data.usuario.tipo_usuario === 'dono') {
                window.location.href = '../pages/petOwner/dono.html';
            } else if (data.usuario.tipo_usuario === 'passeador') {
                window.location.href = '../pages/petwalker/petwalker.html';
            }
        } else {
            alert("Erro: " + data.erro);
        }
    
    } catch (error) {
        console.error("Erro no login:", error);
        alert("Falha ao conectar no servidor");
    }
}