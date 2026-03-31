const API_URL = 'http://localhost:3000/api';//https://petwalk-api-0kzx.onrender.com
let usuarioLogado = null;
let perfilPasseador = null;
let passeioAtual = null;
let mockRequests = [];

document.addEventListener("DOMContentLoaded", () => {
    lucide.createIcons();

    // 🔒 CHAMADA DO GUARDIÃO! 
    usuarioLogado = protegerRota('passeador');
    if (!usuarioLogado) return;

    document.getElementById('walkerGreeting').innerText = `Olá, ${usuarioLogado.nome.split(' ')[0]}! 🐕`;
    document.getElementById('profileName').innerText = usuarioLogado.nome;

    loadWalkerData();
});

// 2. Carrega Perfil, Carteira e Pedidos Mockados/Reais
async function loadWalkerData() {
    try {
        const res = await fetch(`${API_URL}/passeadores`);
        const passeadores = await res.json();

        perfilPasseador = passeadores.find(p => p.usuario_id === usuarioLogado.id);

        if (perfilPasseador) {
            const saldoFormatado = parseFloat(perfilPasseador.carteira_saldo).toFixed(2).replace('.', ',');
            document.getElementById('walletBalance').innerText = `R$ ${saldoFormatado}`;
            document.getElementById('profileRating').innerText = perfilPasseador.nota_media;
        }

        // Simula pedidos pendentes chegando (Scroll Uber) se estiver online
        if (document.getElementById('onlineToggle').checked) {
            renderMockPendingWalk();
        }

    } catch (error) {
        console.error("Erro ao carregar dados:", error);
    }
}

// Função do Toggle Online/Offline
function toggleOnline() {
    const isOnline = document.getElementById('onlineToggle').checked;
    const statusDot = document.getElementById('statusDot');
    const statusTextBadge = document.getElementById('statusTextBadge');

    if (isOnline) {
        statusDot.classList.replace('bg-gray-400', 'bg-green-400');
        statusDot.classList.add('animate-pulse');
        statusTextBadge.innerText = 'ONLINE';
        renderMockPendingWalk(); // Mostra os pedidos mockados novamente

        // Futuramente: Call API para atualizar status_online no banco de dados
    } else {
        statusDot.classList.replace('bg-green-400', 'bg-gray-400');
        statusDot.classList.remove('animate-pulse');
        statusTextBadge.innerText = 'OFFLINE';
        document.getElementById('pendingRequestsContainer').innerHTML = `
                    <div class="text-center p-6 bg-gray-50 rounded-3xl border border-gray-100 mt-4">
                        <i data-lucide="moon" class="w-10 h-10 mx-auto text-gray-300 mb-2"></i>
                        <p class="text-xs text-gray-500">Você está offline. Fique online para receber novos pedidos na sua região.</p>
                    </div>
                `;
        document.getElementById('pendingCountBadge').innerText = '0 Pendentes';
        lucide.createIcons();
    }
}

// Simulação dos Pedidos Pendentes (Lista Estilo Uber)
function renderMockPendingWalk() {
    // Criando 3 pedidos mockados para demonstrar o scroll
    mockRequests = [
        {
            id: 'mock-1',
            pet_nome: 'Rex',
            pet_raca: 'Golden Retriever',
            dono_nome: 'João Silva',
            preco: perfilPasseador ? perfilPasseador.preco_por_passeio : '35.00',
            distancia: '1.2 km',
            obs: 'Puxa muito a coleira no início do passeio.',
            cor: 'bg-[#14b8a6]',
            img: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=100'
        },
        {
            id: 'mock-2',
            pet_nome: 'Bolinha',
            pet_raca: 'Pug',
            dono_nome: 'Maria Fernanda',
            preco: '45.00',
            distancia: '2.5 km',
            obs: 'Cansa rápido, precisa de pausas constantes.',
            cor: 'bg-[#f97316]',
            img: 'https://images.unsplash.com/photo-1517849845537-4d257902454a?w=100'
        },
        {
            id: 'mock-3',
            pet_nome: 'Thor',
            pet_raca: 'Pastor Alemão',
            dono_nome: 'Carlos Eduardo',
            preco: '50.00',
            distancia: '3.1 km',
            obs: 'Cão de guarda. Não gosta de aproximação de outros machos.',
            cor: 'bg-[#030213]',
            img: 'https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?w=100'
        }
    ];

    document.getElementById('pendingCountBadge').innerText = `${mockRequests.length} Pendentes`;
    const container = document.getElementById('pendingRequestsContainer');
    container.innerHTML = ''; // Limpa

    mockRequests.forEach(req => {
        const precoFormat = parseFloat(req.preco).toFixed(2).replace('.', ',');

        // Card Estilo Uber
        container.innerHTML += `
                    <div class="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 relative overflow-hidden transition transform active:scale-95 cursor-pointer" onclick="openRequestDetail('${req.id}')">
                        <div class="absolute left-0 top-0 w-1.5 h-full ${req.cor}"></div>
                        <div class="flex justify-between items-start pl-2">
                            <div class="flex gap-3 items-center">
                                <img src="${req.img}" class="w-12 h-12 bg-gray-100 rounded-full object-cover border border-gray-100">
                                <div>
                                    <h3 class="font-bold text-[var(--primary)] text-sm">${req.pet_nome} <span class="text-xs font-normal text-gray-400">(${req.pet_raca})</span></h3>
                                    <p class="text-[11px] text-gray-500 mt-0.5"><i data-lucide="map-pin" class="w-3 h-3 inline text-[var(--accent)]"></i> ${req.distancia} de distância</p>
                                </div>
                            </div>
                            <div class="text-right">
                                <span class="text-base font-bold text-[var(--accent)]">R$ ${precoFormat}</span>
                                <p class="text-[9px] text-gray-400 uppercase font-bold mt-0.5 tracking-wider">Agora</p>
                            </div>
                        </div>
                    </div>
                `;
    });
    lucide.createIcons();
}

function openRequestDetail(id) {
    // Busca o pedido que foi clicado na lista
    passeioAtual = mockRequests.find(r => r.id === id);

    const precoFormat = parseFloat(passeioAtual.preco).toFixed(2).replace('.', ',');

    document.getElementById('detailPetName').innerText = passeioAtual.pet_nome;
    document.getElementById('detailPetInfo').innerText = passeioAtual.pet_raca;
    document.getElementById('detailOwnerName').innerText = passeioAtual.dono_nome;
    document.getElementById('detailPrice').innerText = `R$ ${precoFormat}`;
    document.getElementById('detailObs').innerText = passeioAtual.obs;

    // Atualiza a foto do pet no detalhe
    document.getElementById('detailPetImg').src = passeioAtual.img;

    navigate('request-detail');
}

function acceptWalk() {
    const precoFormat = parseFloat(passeioAtual.preco).toFixed(2).replace('.', ',');

    document.getElementById('trackPetName').innerText = `Em Rota com ${passeioAtual.pet_nome}`;
    document.getElementById('trackPriceBadge').innerText = `Ganhos: R$ ${precoFormat}`;

    // Atualiza a foto do pet no mapa
    document.getElementById('trackPetImg').src = passeioAtual.img;

    navigate('track');
}

async function finishWalk() {
    const precoFormat = parseFloat(passeioAtual.preco).toFixed(2).replace('.', ',');
    document.getElementById('ratingEarned').innerText = `R$ ${precoFormat}`;

    if (perfilPasseador) {
        const novoSaldo = parseFloat(perfilPasseador.carteira_saldo) + parseFloat(passeioAtual.preco);
        document.getElementById('walletBalance').innerText = `R$ ${novoSaldo.toFixed(2).replace('.', ',')}`;
    }

    navigate('rating');
}

function returnToHome() {
    // Remove o pedido que acabou de ser concluído da lista
    mockRequests = mockRequests.filter(r => r.id !== passeioAtual.id);

    // Re-renderiza a lista (agora com 1 pedido a menos)
    document.getElementById('pendingCountBadge').innerText = `${mockRequests.length} Pendentes`;
    const container = document.getElementById('pendingRequestsContainer');
    container.innerHTML = '';

    if (mockRequests.length === 0) {
        container.innerHTML = '<p class="text-xs text-gray-400 text-center mt-4">Nenhum pedido no momento.</p>';
    } else {
        // Reaproveita a lógica pra desenhar os cards restantes
        mockRequests.forEach(req => {
            const precoFormat = parseFloat(req.preco).toFixed(2).replace('.', ',');
            container.innerHTML += `
                        <div class="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 relative overflow-hidden transition transform active:scale-95 cursor-pointer" onclick="openRequestDetail('${req.id}')">
                            <div class="absolute left-0 top-0 w-1.5 h-full ${req.cor}"></div>
                            <div class="flex justify-between items-start pl-2">
                                <div class="flex gap-3 items-center">
                                    <img src="${req.img}" class="w-12 h-12 bg-gray-100 rounded-full object-cover border border-gray-100">
                                    <div>
                                        <h3 class="font-bold text-[var(--primary)] text-sm">${req.pet_nome} <span class="text-xs font-normal text-gray-400">(${req.pet_raca})</span></h3>
                                        <p class="text-[11px] text-gray-500 mt-0.5"><i data-lucide="map-pin" class="w-3 h-3 inline text-[var(--accent)]"></i> ${req.distancia} de distância</p>
                                    </div>
                                </div>
                                <div class="text-right">
                                    <span class="text-base font-bold text-[var(--accent)]">R$ ${precoFormat}</span>
                                    <p class="text-[9px] text-gray-400 uppercase font-bold mt-0.5 tracking-wider">Agora</p>
                                </div>
                            </div>
                        </div>
                    `;
        });
    }

    navigate('home');
}

// Utilitários
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

