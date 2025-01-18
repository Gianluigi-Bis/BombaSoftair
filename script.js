// Configurazione del gioco
let redTime = 0;
let blueTime = 0;
let gameInterval;
let isGameRunning = false;
let activeTeam = null;
let targetTime = 0; // Tempo obiettivo da raggiungere
let soundsLoaded = false;
// Aggiungi queste variabili all'inizio del tuo JavaScript
let isPaused = false;
let lastActiveTeam = null;

// Inizializzazione suoni
const bombSound1 = new Audio('./bombsound1.wav');
const bombSound2 = new Audio('./bombsound2.wav');
const alarmSound = new Audio('./alarm.wav');

// Configura i suoni delle bombe
bombSound1.loop = false; // Disabilitiamo il loop automatico per gestirlo manualmente
bombSound2.loop = false;

// Pre-carica i suoni
window.addEventListener('load', () => {
    bombSound1.load();
    bombSound2.load();
    alarmSound.load();
    document.addEventListener('click', () => {
        bombSound1.load();
        bombSound2.load();
        alarmSound.load();
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
        bombSound1.load();
        bombSound2.load();
        alarmSound.load();
        soundsLoaded = true;
    }
}

// Funzione per fermare tutti i suoni delle bombe
function stopBombSounds() {
    bombSound1.pause();
    bombSound1.currentTime = 0;
    bombSound2.pause();
    bombSound2.currentTime = 0;
}

// Aggiungi questa funzione per gestire pausa/ripresa
function togglePause() {
    isPaused = !isPaused;
    const pauseBtn = document.getElementById('pauseBtn');
    
    if (isPaused) {
        // Salva la squadra attiva corrente e ferma il timer
        lastActiveTeam = activeTeam;
        clearInterval(gameInterval);
        activeTeam = null;
        updateActiveTeamDisplay();
        pauseBtn.textContent = '▶ RIPRENDI';
        pauseBtn.classList.add('paused');
        // Ferma i suoni della bomba
        stopBombSounds();
    } else {
        // Riprendi il timer con l'ultima squadra attiva
        if (lastActiveTeam) {
            startTeamTimer(lastActiveTeam);
        }
        pauseBtn.textContent = '⏸ PAUSA';
        pauseBtn.classList.remove('paused');
    }
}


// Funzione per gestire il loop del suono con pausa
function playBombSoundWithDelay(sound) {
    sound.play().catch(e => console.log('Errore riproduzione suono:', e));
    sound.addEventListener('ended', () => {
        setTimeout(() => {
            if (isGameRunning && 
                ((sound === bombSound1 && activeTeam === 'red') || 
                 (sound === bombSound2 && activeTeam === 'blue'))) {
                sound.play().catch(e => console.log('Errore riproduzione suono:', e));
            }
        }, 2000); // 2 secondi di pausa
    });
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
    document.getElementById('winner').className = 'winner';
    document.getElementById('winner').textContent = '';
    
    updateTimers();
    isGameRunning = true;

    if (!document.getElementById('pauseBtn')) {
        const controlsDiv = document.querySelector('.controls');
        const pauseBtn = document.createElement('button');
        pauseBtn.id = 'pauseBtn';
        pauseBtn.className = 'pause-btn';
        pauseBtn.textContent = '⏸ PAUSA';
        pauseBtn.onclick = togglePause;
        // Inserisci prima del div controls
        controlsDiv.parentNode.insertBefore(pauseBtn, controlsDiv);
    }
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
    
    // Gestisci i suoni delle bombe
    stopBombSounds();
    if (team === 'red') {
        playBombSoundWithDelay(bombSound1);
    } else {
        playBombSoundWithDelay(bombSound2);
    }
    
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
    if (!isGameRunning || isPaused) return;

    loadSounds();

    // Se il timer non è ancora partito per nessuna squadra
    if (!activeTeam) {
        startTeamTimer(team); // Avvia il timer per la squadra che ha cliccato
        document.getElementById('gameInstructions').style.display = 'none';
    }

    // Se viene premuto il bottone, attiva il timer per quella squadra
    startTeamTimer(team);
    
    // Effetto visivo sul bottone
    const btn = document.querySelector(`.${team}-btn`);
    btn.style.transform = 'scale(0.95)';
    
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
    
    // Ferma i suoni delle bombe
    stopBombSounds();
    
    const winner = document.getElementById('winner');
    winner.innerHTML = ''; // Pulisce il contenuto precedente
    
    // Determina e mostra il vincitore
    const winnerText = document.createElement('div');
    if (redTime >= targetTime) {
        winnerText.textContent = 'SQUADRA ROSSA HA VINTO!';
        winner.className = 'winner red show';
    } else if (blueTime >= targetTime) {
        winnerText.textContent = 'SQUADRA BLU HA VINTO!';
        winner.className = 'winner blue show';
    }
    winner.appendChild(winnerText);
    
    // Riproduce il suono di fine partita
    try {
        alarmSound.play().catch(e => {
            console.log('Errore nella riproduzione del suono:', e);
            alarmSound.load();
            alarmSound.play();
        });
    } catch (e) {
        console.log('Errore nella riproduzione del suono:', e);
    }
    
    // Mostra il bottone di reset
    const resetButton = document.createElement('button');
    resetButton.textContent = 'Torna al Menu Iniziale';
    resetButton.className = 'reset-button';
    resetButton.onclick = resetGame;
    winner.appendChild(resetButton);
}

// Funzione per resettare il gioco
function resetGame() {
    // Ferma tutti i suoni
    stopBombSounds();
    alarmSound.pause();
    alarmSound.currentTime = 0;
    
    // Resetta i timer e lo stato del gioco
    redTime = 0;
    blueTime = 0;
    isGameRunning = false;
    activeTeam = null;
    
    // Nascondi il container del gioco e il messaggio del vincitore
    document.getElementById('gameContainer').style.display = 'none';
    document.getElementById('winner').className = 'winner';
    document.getElementById('winner').innerHTML = '';
    
    // Mostra il setup iniziale
    document.getElementById('setup').style.display = 'flex';
    
    // Resetta i display
    updateTimers();
    updateActiveTeamDisplay();

    isPaused = false;
    lastActiveTeam = null;
    const pauseBtn = document.getElementById('pauseBtn');
    if (pauseBtn) {
        pauseBtn.textContent = '⏸ PAUSA';
        pauseBtn.classList.remove('paused');
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