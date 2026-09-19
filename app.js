if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch(err => console.log('SW error:', err));
    });
}

document.addEventListener('DOMContentLoaded', () => {
    // Splash / Login
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
            setTimeout(() => { splashScreen.style.display = 'none'; }, 400);
        } else {
            document.getElementById('login-error').style.display = 'block';
        }
    });

    document.getElementById('btn-app-logout').addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('app_logged_in');
        document.getElementById('app-user').value = '';
        document.getElementById('app-pass').value = '';
        document.getElementById('login-error').style.display = 'none';
        splashAction.style.display = 'block';
        loginFormContainer.style.display = 'none';
        splashScreen.style.display = 'flex';
        setTimeout(() => { splashScreen.style.opacity = '1'; }, 10);
    });

    // Intervals.icu
    const savedId = localStorage.getItem('intervals_id');
    const savedKey = localStorage.getItem('intervals_key');

    if (savedId && savedKey) {
        carregarTreino(savedId, savedKey);
    }

    document.getElementById('btn-connect').addEventListener('click', () => {
        const id = document.getElementById('intervals-id').value.trim();
        const key = document.getElementById('intervals-key').value.trim();
        if (id && key) {
            localStorage.setItem('intervals_id', id);
            localStorage.setItem('intervals_key', key);
            carregarTreino(id, key);
        } else {
            alert('Por favor, informe Athlete ID e API Key.');
        }
    });

    document.getElementById('btn-logout').addEventListener('click', () => {
        localStorage.removeItem('intervals_id');
        localStorage.removeItem('intervals_key');
        document.getElementById('workout-card-training').style.display = 'none';
        document.getElementById('workout-card-rest').style.display = 'none';
        document.getElementById('login-section').style.display = 'block';
    });
});

async function carregarTreino(athleteId, apiKey) {
    const loginSec = document.getElementById('login-section');
    const cardTraining = document.getElementById('workout-card-training');
    const cardRest = document.getElementById('workout-card-rest');
    const dayToday = document.getElementById('day-today');

    loginSec.style.display = 'none';

    try {
        const dataHoje = new Date().toISOString().split('T')[0];
        const token = btoa('API_KEY:' + apiKey);
        const url = `https://intervals.icu/api/v1/athlete/${athleteId}/events?oldest=${dataHoje}&newest=${dataHoje}`;

        const response = await fetch(url, {
            headers: { 'Authorization': 'Basic ' + token }
        });

        if (!response.ok) throw new Error('Falha na autenticação');

        const eventos = await response.json();

        if (eventos && eventos.length > 0) {
            const treino = eventos[0];
            
            // Ativa o layout Amarelo (Treino)
            cardRest.style.display = 'none';
            cardTraining.style.display = 'block';
            dayToday.className = 'day-col active';

            document.getElementById('training-title').innerText = treino.name || 'Corrida intervalada';
            
            const dist = treino.distance ? (treino.distance / 1000).toFixed(1) + ' km' : '-- km';
            const dur = treino.moving_time ? Math.round(treino.moving_time / 60) + ' min' : '~40 min';
            
            // Calcula pace aproximado se houver distância e tempo
            let paceStr = '5:30/km';
            if (treino.distance && treino.moving_time) {
                const totalSec = treino.moving_time;
                const km = treino.distance / 1000;
                const secPerKm = totalSec / km;
                const min = Math.floor(secPerKm / 60);
                const sec = Math.floor(secPerKm % 60).toString().padStart(2, '0');
                paceStr = `${min}:${sec}/km`;
            }

            document.getElementById('training-dist').innerText = dist;
            document.getElementById('training-pace').innerText = paceStr;
            document.getElementById('training-dur').innerText = dur;

            const descBox = document.getElementById('training-desc-box');
            if (treino.description) {
                descBox.style.display = 'block';
                document.getElementById('training-desc-text').innerText = treino.description;
            } else {
                descBox.style.display = 'none';
            }

        } else {
            // Ativa o layout Azul (Descanso)
            cardTraining.style.display = 'none';
            cardRest.style.display = 'block';
            dayToday.className = 'day-col active-rest';
        }

    } catch (error) {
        console.error(error);
        loginSec.style.display = 'block';
        cardTraining.style.display = 'none';
        cardRest.style.display = 'none';
        alert('Não foi possível sincronizar com o Intervals.icu. Verifique suas credenciais.');
    }
}