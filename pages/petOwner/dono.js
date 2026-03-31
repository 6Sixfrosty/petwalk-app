const API_URL = 'https://petwalk-api-0kzx.onrender.com/api';
let usuarioLogado = null;
let listaPasseadores = [];
let passeadorSelecionado = null;
let petAtualId = null;
let passeioAtualId = null;



// ==========================================
// Carregamento da pagina e proteção de rota
// ==========================================
function init() {
    lucide.createIcons();
    usuarioLogado = protegerRota('dono');
    if (!usuarioLogado) return;

    fetchProfile();
    fetchPet();
}
document.addEventListener("DOMContentLoaded", init);



// ==========================================
// Carregar Telas e chamar funções de FETCH
// ==========================================

// Lista de passeadores
function walkersScreen() {
    navigate('explore');
    fetchWalkers();
}

document.addEventListener("click", walkersScreen, { capture: true, passive: true, once: false });

// Perfil do pet
function petProfileScreen() {
    navigate('pet-profile');
}

// Mapa de passeadores
function openMapScreen() {
    navigate('map-screen');
}


// ==========================================
// funções de FETCH
// ==========================================


// buscar dados do perfil
async function fetchProfile() {
    try {
        const response = await fetch(`${API_URL}/usuarios/${usuarioLogado.id}`);

        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status}`);
        }

        const data = await response.json();

        document.getElementById('profileName').innerText = data.nome || '—';
        document.getElementById('profileEmail').innerText = data.email || '—';
        document.getElementById('profilePhone').innerText = data.telefone || '—';

    } catch (error) {
        console.error('Erro ao buscar perfil:', error);
    }
}

// buscar dados do Pet
async function fetchPet() {
    try {
        const response = await fetch(`${API_URL}/pets/dono/${usuarioLogado.id}`);
        const pets = await response.json();

        if (!pets || pets.length === 0) return;

        const pet = pets[0];
        petAtualId = pet.id;

        document.getElementById('petName').innerText = pet.nome || '—';
        document.getElementById('petBreed').innerText = pet.raca || '—';
        document.getElementById('petPorte').innerText = pet.porte || '—';
        document.getElementById('petIdade').innerText = pet.idade ? `${pet.idade} anos` : '—';
        document.getElementById('petObservacoes').innerText = pet.observacoes || '—';
    } catch (error) {
        console.error('Erro ao buscar pet:', error);
    }
}



async function fetchWalkers() {
    try {
        const response = await fetch(`${API_URL}/passeadores`);
        listaPasseadores = await response.json();

        const container = document.getElementById('walkersListContainer');
        container.innerHTML = '';

        if (listaPasseadores.length === 0) {
            container.innerHTML = '<p class="text-xs text-gray-400 text-center">Nenhum passeador encontrado.</p>';
            return;
        }

        listaPasseadores.forEach(p => {
            const nome = p.usuarios ? p.usuarios.nome : 'Passeador';
            container.innerHTML += `
                        <div class="flex gap-4 p-4 border border-[var(--muted)] rounded-2xl cursor-pointer hover:bg-slate-50 transition-colors" onclick="selectWalker('${p.usuario_id}')">
                            <img src="https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100&h=100&crop=faces" class="w-14 h-14 rounded-full object-cover">
                            <div class="flex-1"><h4 class="font-semibold text-sm text-[var(--primary)]">${nome}</h4><p class="text-xs text-[var(--accent)] font-medium mt-1">Passeador Verificado</p></div>
                            <div class="text-right text-[var(--accent)] font-bold"><i data-lucide="star" class="w-4 h-4 inline mr-1 fill-[var(--accent)] text-[var(--accent)]"></i>${p.nota_media}</div>
                        </div>
                    `;
        });
        lucide.createIcons();
    } catch (error) {
        console.error("Erro ao buscar passeadores:", error);
    }
}

// ==========================================
// FLUXO DE AGENDAMENTO
// ==========================================
function selectWalker(id) {
    passeadorSelecionado = listaPasseadores.find(p => p.usuario_id === id);
    const nome = passeadorSelecionado.usuarios.nome;

    document.getElementById('walkerProfileName').innerText = nome;
    document.getElementById('walkerProfilePrice').innerText = `R$ ${passeadorSelecionado.preco_por_passeio}`;
    document.getElementById('walkerProfileRating').innerHTML = `<i data-lucide="star" class="w-4 h-4 inline mr-1 fill-[var(--accent)] text-[var(--accent)]"></i>${passeadorSelecionado.nota_media}`;
    document.getElementById('walkerProfileBio').innerText = `"${passeadorSelecionado.biografia}"`;
    document.getElementById('checkoutWalkerName').innerText = nome;
    const taxa = (passeadorSelecionado.preco_por_passeio * 0.10).toFixed(2);
    const total = (passeadorSelecionado.preco_por_passeio * 1.10).toFixed(2);
    document.getElementById('checkoutSubtotal').innerText = `R$ ${passeadorSelecionado.preco_por_passeio}`;
    document.getElementById('checkoutTaxa').innerText = `R$ ${taxa}`;
    document.getElementById('checkoutTotal').innerText = `R$ ${total}`;

    navigate('walker');
}

async function confirmAndPay() {
    try {
        const response = await fetch(`${API_URL}/passeios`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                dono_id: usuarioLogado.id,
                passeador_id: passeadorSelecionado.usuario_id,
                pet_id: petAtualId,
                data_horario: new Date().toISOString(),
                preco_total: passeadorSelecionado.preco_por_passeio,
                tipo_passeio: 'agora'
            })
        });

        if (response.ok) {
            const data = await response.json();
            passeioAtualId = data.id;
            navigate('track');
        } else {
            alert('Erro ao processar pagamento e agendar.');
        }
    } catch (error) {
        alert('Erro de conexão com o servidor.');
    }
}

// ==========================================
// ENCERRAR PASSEIO
// ==========================================
async function finishWalk() {
    if (!passeioAtualId) {
        navigate('rating');
        return;
    }

    try {
        await fetch(`${API_URL}/passeios/${passeioAtualId}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status_novo: 'concluido' })
        });
        navigate('rating');
    } catch (error) {
        console.error("Erro ao finalizar:", error);
        navigate('rating');
    }
}

// ==========================================
// UTILITÁRIOS E NAVEGAÇÃO
// ==========================================
function navigate(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');
    lucide.createIcons();
}

function setRating(rating) {
    const stars = document.querySelectorAll('#rating .stars i');
    stars.forEach((star, index) => {
        if (index < rating) {
            star.classList.add('text-[var(--accent)]', 'fill-[var(--accent)]');
            star.classList.remove('text-slate-300', 'fill-slate-300');
        } else {
            star.classList.add('text-slate-300', 'fill-slate-300');
            star.classList.remove('text-[var(--accent)]', 'fill-[var(--accent)]');
        }
    });
}
