// Configurazione del gioco
let redTime = 0;
let blueTime = 0;
let gameInterval;
let isGameRunning = false;
let activeTeam = null;
let targetTime = 0; // Tempo obiettivo da raggiungere
let soundsLoaded = false;

// Inizializzazione suoni
const alarmSound = new Audio('./alarm.wav');
const clickSound = new Audio('./notification.wav');

// Pre-carica i suoni
window.addEventListener('load', () => {
    alarmSound.load();
    clickSound.load();
    // Imposta il volume del click più basso
    clickSound.volume = 0.3;
    document.addEventListener('click', () => {
        alarmSound.load();
        clickSound.load();
    }, { once: true });
});



// Aggiungi event listener per il primo click sulla pagina
document.addEventListener('click', () => {
    loadSounds();
    // Riproduci un suono silenzioso per sbloccare l'audio
    const silentSound = new Audio();
    silentSound.play().catch(() => {});
}, { once: true });

// Formatta il tempo in formato MM:SS
function formatTime(seconds) {
    const minutes = Math.floor(Math.max(0, seconds) / 60);
    const remainingSeconds = Math.max(0, seconds) % 60;
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
}


function loadSounds() {
    if (!soundsLoaded) {
        alarmSound.load();
        clickSound.load();
        clickSound.volume = 0.3;
        soundsLoaded = true;
    }
}

// Inizia la partita
function startGame() {
    const duration = parseInt(document.getElementById('duration').value);
    targetTime = duration * 60; // Tempo da raggiungere
    redTime = 0;
    blueTime = 0;
    
    // Nascondi setup e mostra gioco
    document.getElementById('setup').style.display = 'none';
    document.getElementById('gameContainer').style.display = 'flex';
    
    document.getElementById('gameInstructions').style.display = 'block';
    updateTimers();
    isGameRunning = true;
}

// Aggiorna il display della squadra attiva
function updateActiveTeamDisplay() {
    const display = document.getElementById('activeTeamDisplay');
    if (!activeTeam) {
        display.textContent = '';
        display.className = 'active-team-display';
        return;
    }

    if (activeTeam === 'red') {
        display.textContent = 'Conquista Rossa in corso...';
        display.className = 'active-team-display red';
    } else {
        display.textContent = 'Conquista Blu in corso...';
        display.className = 'active-team-display blue';
    }
}

// Gestisce il timer attivo
function startTeamTimer(team) {
    // Ferma il timer precedente se esistente
    if (gameInterval) {
        clearInterval(gameInterval);
    }
    
    // Imposta la nuova squadra attiva
    activeTeam = team;
    updateActiveTeamDisplay();
    
    // Avvia il nuovo timer
    gameInterval = setInterval(() => {
        if (team === 'red') {
            redTime++;
            if (redTime >= targetTime) {
                endGame();
                return;
            }
        } else {
            blueTime++;
            if (blueTime >= targetTime) {
                endGame();
                return;
            }
        }
        updateTimers();
    }, 1000);
}

// Aggiorna i display dei timer
function updateTimers() {
    document.getElementById('redTimer').textContent = formatTime(redTime);
    document.getElementById('blueTimer').textContent = formatTime(blueTime);
}

// Gestisce i colpi delle squadre
function hit(team) {
    if (!isGameRunning) return;

    loadSounds();

    // Se il timer non è ancora partito per nessuna squadra
    if (!activeTeam) {
        startTeamTimer(team); // Avvia il timer per la squadra che ha cliccato
        document.getElementById('gameInstructions').style.display = 'none';
    }

    // Se viene premuto il bottone, attiva il timer per quella squadra
    startTeamTimer(team);
    
    // Effetto visivo sul bottone e suono
    const btn = document.querySelector(`.${team}-btn`);
    btn.style.transform = 'scale(0.95)';
    
    // Riproduci il suono di click
    try {
        clickSound.currentTime = 0;
        const playPromise = clickSound.play();
        if (playPromise !== undefined) {
            playPromise.catch(e => {
                console.log('Errore nella riproduzione del suono di click:', e);
                // Riprova a caricare e riprodurre
                clickSound.load();
                clickSound.play().catch(() => {});
            });
        }
    } catch (e) {
        console.log('Errore nella riproduzione del suono di click:', e);
    }
    
    setTimeout(() => {
        btn.style.transform = 'scale(1)';
    }, 100);
}

// Termina la partita
function endGame() {
    isGameRunning = false;
    clearInterval(gameInterval);
    activeTeam = null;
    updateActiveTeamDisplay();
    
    const winner = document.getElementById('winner');
    
    // Determina e mostra il vincitore
    if (redTime >= targetTime) {
        winner.textContent = 'SQUADRA ROSSA HA VINTO!';
        winner.className = 'winner red show';
    } else if (blueTime >= targetTime) {
        winner.textContent = 'SQUADRA BLU HA VINTO!';
        winner.className = 'winner blue show';
    }
    
    // Riproduce il suono
    try {
        alarmSound.play().catch(e => {
            console.log('Errore nella riproduzione del suono:', e);
            alarmSound.load();
            alarmSound.play();
        });
    } catch (e) {
        console.log('Errore nella riproduzione del suono:', e);
    }
}

// Gestione pressione tasti
document.addEventListener('keydown', (e) => {
    if (!isGameRunning) return;
    
    if (e.key.toLowerCase() === 'q') {
        hit('red');
    } else if (e.key.toLowerCase() === 'p') {
        hit('blue');
    }
});