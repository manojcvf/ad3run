// Registro do Service Worker (Offline)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .catch(error => console.log('Falha no SW:', error));
    });
}

document.addEventListener('DOMContentLoaded', () => {
    
    // --- LÓGICA DO SPLASH / LOGIN DO APP ---
    const splashScreen = document.getElementById('splash-screen');
    const btnShowLogin = document.getElementById('btn-show-login');
    const splashAction = document.getElementById('splash-action');
    const loginFormContainer = document.getElementById('login-form-container');
    const btnDoLogin = document.getElementById('btn-do-login');

    if (localStorage.getItem('app_logged_in') === 'true') {
        splashScreen.style.display = 'none';
    }

    btnShowLogin.addEventListener('click', () => {
        splashAction.style.display = 'none';
        loginFormContainer.style.display = 'block';
    });

    btnDoLogin.addEventListener('click', () => {
        const user = document.getElementById('app-user').value.trim();
        const pass = document.getElementById('app-pass').value.trim();

        if (user === 'admin' && pass === 'admin') {
            localStorage.setItem('app_logged_in', 'true');
            splashScreen.style.opacity = '0';
            setTimeout(() => {
                splashScreen.style.display = 'none';
            }, 400);
        } else {
            document.getElementById('login-error').style.display = 'block';
        }
    });

    // Clique no botão Sair (Menu Inferior)
    document.getElementById('btn-app-logout').addEventListener('click', (e) => {
        e.preventDefault(); 
        localStorage.removeItem('app_logged_in');
        
        document.getElementById('app-user').value = '';
        document.getElementById('app-pass').value = '';
        document.getElementById('login-error').style.display = 'none';
        
        splashAction.style.display = 'block';
        loginFormContainer.style.display = 'none';
        
        splashScreen.style.display = 'flex';
        setTimeout(() => {
            splashScreen.style.opacity = '1';
        }, 10);
    });

    // --- LÓGICA DO INTERVALS.ICU ---
    const loginSection = document.getElementById('login-section');
    const workoutSection = document.getElementById('workout-section');
    
    const savedId = localStorage.getItem('intervals_id');
    const savedKey = localStorage.getItem('intervals_key');

    if (savedId && savedKey) {
        mostrarTreino(savedId, savedKey);
    }

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

    document.getElementById('btn-logout').addEventListener('click', () => {
        localStorage.removeItem('intervals_id');
        localStorage.removeItem('intervals_key');
        workoutSection.style.display = 'none';
        loginSection.style.display = 'block';
    });
});

async function mostrarTreino(athleteId, apiKey) {
    document.getElementById('login-section').style.display = 'none';
    document.getElementById('workout-section').style.display = 'block';
    
    try {
        const dataHoje = new Date().toISOString().split('T')[0];
        const token = btoa('API_KEY:' + apiKey);
        
        const url = `https://intervals.icu/api/v1/athlete/${athleteId}/events?oldest=${dataHoje}&newest=${dataHoje}`;
        
        const response = await fetch(url, {
            method: 'GET',
            headers: { 'Authorization': 'Basic ' + token }
        });

        if (!response.ok) throw new Error("Credenciais inválidas");

        const eventos = await response.json();
        
        if (eventos && eventos.length > 0) {
            const treino = eventos[0];
            
            document.getElementById('workout-title').innerText = treino.name || "Treino Estruturado";
            document.getElementById('workout-desc').innerText = `Bloco AD3 Run • Sincronizado do Intervals`;
            
            const distancia = treino.distance ? (treino.distance / 1000).toFixed(1) + ' km' : '-- km';
            const tempo = treino.moving_time ? Math.round(treino.moving_time / 60) + ' min' : '-- min';
            
            // Pega a descrição do Intervals ou coloca um texto padrão se estiver vazio
            const descricao = treino.description ? treino.description : "Treino livre. Nenhuma descrição fornecida para hoje.";
            
            document.getElementById('workout-dist').innerText = distancia;
            document.getElementById('workout-dur').innerText = '~' + tempo;
            document.getElementById('workout-details').innerText = descricao;
            
        } else {
            document.getElementById('workout-title').innerText = "Dia de Descanso!";
            document.getElementById('workout-desc').innerText = "Aproveite para alongar e se hidratar.";
            document.getElementById('workout-dist').innerText = "--";
            document.getElementById('workout-dur').innerText = "--";
            document.getElementById('workout-details').innerText = "Hoje não há treinos programados na sua planilha.";
        }
    } catch (error) {
        console.error(error);
        document.getElementById('workout-title').innerText = "Erro ao carregar";
        document.getElementById('workout-desc').innerText = "Verifique sua API Key ou ID.";
    }
}