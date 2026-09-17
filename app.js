// Registro do Service Worker (Offline)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .catch(error => console.log('Falha no SW:', error));
    });
}

// Lógica de Integração com o Intervals.icu
document.addEventListener('DOMContentLoaded', () => {
    const loginSection = document.getElementById('login-section');
    const workoutSection = document.getElementById('workout-section');
    
    // Verifica se o aluno já logou antes
    const savedId = localStorage.getItem('intervals_id');
    const savedKey = localStorage.getItem('intervals_key');

    if (savedId && savedKey) {
        mostrarTreino(savedId, savedKey);
    }

    // Botão Sincronizar
    document.getElementById('btn-connect').addEventListener('click', () => {
        const id = document.getElementById('intervals-id').value.trim();
        const key = document.getElementById('intervals-key').value.trim();
        
        if (id && key) {
            localStorage.setItem('intervals_id', id);
            localStorage.setItem('intervals_key', key);
            mostrarTreino(id, key);
        } else {
            alert("Por favor, preencha o ID e a API Key.");
        }
    });

    // Botão Desconectar (Limpa a memória do celular)
    document.getElementById('btn-logout').addEventListener('click', () => {
        localStorage.removeItem('intervals_id');
        localStorage.removeItem('intervals_key');
        workoutSection.style.display = 'none';
        loginSection.style.display = 'block';
    });
});

async function mostrarTreino(athleteId, apiKey) {
    // Altera a interface
    document.getElementById('login-section').style.display = 'none';
    document.getElementById('workout-section').style.display = 'block';
    
    try {
        // Pega a data de hoje no formato YYYY-MM-DD
        const dataHoje = new Date().toISOString().split('T')[0];
        
        // A API do Intervals exige a string "API_KEY" como usuário e a sua chave como senha
        const token = btoa('API_KEY:' + apiKey);
        
        const url = `https://intervals.icu/api/v1/athlete/${athleteId}/events?oldest=${dataHoje}&newest=${dataHoje}`;
        
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': 'Basic ' + token
            }
        });

        if (!response.ok) throw new Error("Credenciais inválidas ou erro na API");

        const eventos = await response.json();
        
        if (eventos && eventos.length > 0) {
            // Pega o primeiro treino do dia
            const treino = eventos[0];
            
            document.getElementById('workout-title').innerText = treino.name || "Treino Estruturado";
            document.getElementById('workout-desc').innerText = `Bloco AD3 Run • Sincronizado do Intervals`;
            
            // O Intervals manda distância em metros e tempo em segundos. Vamos converter:
            const distancia = treino.distance ? (treino.distance / 1000).toFixed(1) + ' km' : '-- km';
            const tempo = treino.moving_time ? Math.round(treino.moving_time / 60) + ' min' : '-- min';
            const tss = treino.tss ? Math.round(treino.tss) : '--';
            
            document.getElementById('workout-dist').innerText = distancia;
            document.getElementById('workout-dur').innerText = '~' + tempo;
            document.getElementById('workout-tss').innerText = tss;
            
        } else {
            // Se não houver treino no dia
            document.getElementById('workout-title').innerText = "Dia de Descanso!";
            document.getElementById('workout-desc').innerText = "Aproveite para alongar e se hidratar.";
            document.getElementById('workout-dist').innerText = "--";
            document.getElementById('workout-dur').innerText = "--";
            document.getElementById('workout-tss').innerText = "--";
        }

    } catch (error) {
        console.error(error);
        document.getElementById('workout-title').innerText = "Erro ao carregar";
        document.getElementById('workout-desc').innerText = "Verifique sua API Key ou ID.";
    }
}