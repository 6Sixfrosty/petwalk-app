// auth/guardian.js

/**
 * Protege uma rota verificando se o usuário está logado
 * e se tem o tipo correto (dono ou passeador).
 *
 * @param {string} tipoPermitido - 'dono' ou 'passeador'
 * @returns {object|null} - Dados do usuário logado ou null se não autorizado
 */
function protegerRota(tipoPermitido) {
    const userStorage = localStorage.getItem('usuarioLogado');

    // 1. Sem sessão → volta para o login
    if (!userStorage) {
        alert("Sessão expirada ou não autorizada. Faça login.");
        window.location.replace("../../public/index.html");
        return null;
    }

    const usuarioLogado = JSON.parse(userStorage);

    // 2. Tipo errado → redireciona para a área correta
    if (usuarioLogado.tipo_usuario !== tipoPermitido) {
        alert("Você não tem permissão para acessar esta área.");
        if (usuarioLogado.tipo_usuario === 'dono') {
            window.location.replace("../pages/dono.html");
        } else {
            window.location.replace("../pages/passeador.html");
        }
        return null;
    }

    // 3. Tudo certo → retorna os dados do usuário
    return usuarioLogado;
}


function logout() {
    localStorage.removeItem('usuarioLogado');
    window.location.replace("../../public/index.html");
}
/**
 * Faz logout: chama a API para setar online=false no banco
 * 
 * e limpa o localStorage, redirecionando para o login.
 *
 * @param {string} apiUrl 
 * 
 */
async function fazerLogout(apiUrl) {
    const userStorage = localStorage.getItem('usuarioLogado');

    if (userStorage) {
        const usuario = JSON.parse(userStorage);

        try {
            // Avisa o backend para marcar o usuário como offline no banco
            await fetch(`${apiUrl}/auth/logout`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ usuario_id: usuario.id })
            });
        } catch (e) {
            // Se falhar a requisição, limpa localmente mesmo assim
            console.warn("Logout offline: não foi possível contatar o servidor.", e);
        }
    }

    // Limpa a sessão local independente do resultado
    localStorage.removeItem('usuarioLogado');
    window.location.replace("../../public/index.html");
}

