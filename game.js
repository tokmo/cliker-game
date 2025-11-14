// État du jeu
let gameState = {
    points: 50,  // Bonus de départ !
    pointsPerClick: 1,
    pointsPerSecond: 0,
    upgrades: {}
};

// Définition des améliorations
const upgradeDefinitions = [
    {
        id: 'cursor',
        name: '👆 Curseur',
        description: '+0.1 points/sec',
        baseCost: 10,
        costMultiplier: 1.15,
        effect: { type: 'perSecond', value: 0.1 }
    },
    {
        id: 'grandma',
        name: '👵 Grand-mère',
        description: '+1 point/sec',
        baseCost: 50,
        costMultiplier: 1.15,
        effect: { type: 'perSecond', value: 1 }
    },
    {
        id: 'farm',
        name: '🌾 Ferme',
        description: '+8 points/sec',
        baseCost: 500,
        costMultiplier: 1.15,
        effect: { type: 'perSecond', value: 8 }
    },
    {
        id: 'mine',
        name: '⛏️ Mine',
        description: '+47 points/sec',
        baseCost: 3000,
        costMultiplier: 1.15,
        effect: { type: 'perSecond', value: 47 }
    },
    {
        id: 'factory',
        name: '🏭 Usine',
        description: '+260 points/sec',
        baseCost: 10000,
        costMultiplier: 1.15,
        effect: { type: 'perSecond', value: 260 }
    },
    {
        id: 'bank',
        name: '🏦 Banque',
        description: '+1400 points/sec',
        baseCost: 40000,
        costMultiplier: 1.15,
        effect: { type: 'perSecond', value: 1400 }
    },
    {
        id: 'temple',
        name: '⛩️ Temple',
        description: '+7800 points/sec',
        baseCost: 200000,
        costMultiplier: 1.15,
        effect: { type: 'perSecond', value: 7800 }
    },
    {
        id: 'clickMultiplier1',
        name: '✨ Double clic',
        description: 'x2 points par clic',
        baseCost: 100,
        costMultiplier: 5,
        effect: { type: 'perClick', value: 2 }
    },
    {
        id: 'clickMultiplier2',
        name: '💫 Super clic',
        description: 'x5 points par clic',
        baseCost: 1000,
        costMultiplier: 5,
        effect: { type: 'perClick', value: 5 }
    },
    {
        id: 'clickMultiplier3',
        name: '🌟 Mega clic',
        description: 'x10 points par clic',
        baseCost: 10000,
        costMultiplier: 5,
        effect: { type: 'perClick', value: 10 }
    },
    {
        id: 'wizard',
        name: '🧙 Magicien',
        description: '+50000 points/sec',
        baseCost: 1000000,
        costMultiplier: 1.15,
        effect: { type: 'perSecond', value: 50000 }
    },
    {
        id: 'portal',
        name: '🌀 Portail',
        description: '+500000 points/sec',
        baseCost: 10000000,
        costMultiplier: 1.15,
        effect: { type: 'perSecond', value: 500000 }
    }
];

// Initialiser les upgrades
upgradeDefinitions.forEach(upgrade => {
    gameState.upgrades[upgrade.id] = {
        owned: 0,
        currentCost: upgrade.baseCost
    };
});

// Charger la sauvegarde
function loadGame() {
    const savedGame = localStorage.getItem('clickerGameSave');
    if (savedGame) {
        const loaded = JSON.parse(savedGame);
        gameState.points = loaded.points || 0;
        gameState.upgrades = loaded.upgrades || gameState.upgrades;
        calculateStats();
        showNotification('Partie chargée !');
    }
}

// Sauvegarder le jeu
function saveGame() {
    localStorage.setItem('clickerGameSave', JSON.stringify({
        points: gameState.points,
        upgrades: gameState.upgrades
    }));
    showNotification('Partie sauvegardée !');
}

// Réinitialiser le jeu
function resetGame() {
    if (confirm('Êtes-vous sûr de vouloir recommencer ? Toute progression sera perdue !')) {
        localStorage.removeItem('clickerGameSave');
        gameState.points = 50;
        gameState.pointsPerClick = 1;
        gameState.pointsPerSecond = 0;

        upgradeDefinitions.forEach(upgrade => {
            gameState.upgrades[upgrade.id] = {
                owned: 0,
                currentCost: upgrade.baseCost
            };
        });

        updateDisplay();
        renderUpgrades();
        showNotification('Jeu réinitialisé !');
    }
}

// Calculer les statistiques
function calculateStats() {
    let perClick = 1;
    let perSecond = 0;

    upgradeDefinitions.forEach(upgrade => {
        const owned = gameState.upgrades[upgrade.id].owned;
        if (owned > 0) {
            if (upgrade.effect.type === 'perClick') {
                perClick *= Math.pow(upgrade.effect.value, owned);
            } else if (upgrade.effect.type === 'perSecond') {
                perSecond += upgrade.effect.value * owned;
            }
        }
    });

    gameState.pointsPerClick = perClick;
    gameState.pointsPerSecond = perSecond;
}

// Calculer le coût d'un upgrade
function getUpgradeCost(upgradeId) {
    const upgrade = upgradeDefinitions.find(u => u.id === upgradeId);
    const owned = gameState.upgrades[upgradeId].owned;
    return Math.floor(upgrade.baseCost * Math.pow(upgrade.costMultiplier, owned));
}

// Acheter un upgrade
function buyUpgrade(upgradeId) {
    const cost = getUpgradeCost(upgradeId);

    if (gameState.points >= cost) {
        gameState.points -= cost;
        gameState.upgrades[upgradeId].owned++;
        gameState.upgrades[upgradeId].currentCost = getUpgradeCost(upgradeId);

        calculateStats();
        updateDisplay();
        renderUpgrades();

        showNotification(`Acheté ! ${upgradeDefinitions.find(u => u.id === upgradeId).name}`);
    }
}

// Gérer le clic principal
function handleClick(event) {
    gameState.points += gameState.pointsPerClick;
    updateDisplay();

    // Animation du bouton
    const button = document.getElementById('clickButton');
    button.classList.add('clicked');
    setTimeout(() => button.classList.remove('clicked'), 300);

    // Créer un nombre flottant
    createFloatingNumber(event, gameState.pointsPerClick);

    // Sauvegarde automatique tous les 10 clics
    if (Math.random() < 0.1) {
        saveGame();
    }
}

// Créer un nombre flottant
function createFloatingNumber(event, value) {
    const container = document.getElementById('floatingNumbers');
    const number = document.createElement('div');
    number.className = 'floating-number';
    number.textContent = '+' + formatNumber(value);

    const button = document.getElementById('clickButton');
    const rect = button.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();

    // Position aléatoire autour du bouton
    const x = event.clientX - containerRect.left + (Math.random() - 0.5) * 50;
    const y = event.clientY - containerRect.top + (Math.random() - 0.5) * 50;

    number.style.left = x + 'px';
    number.style.top = y + 'px';

    container.appendChild(number);

    setTimeout(() => {
        container.removeChild(number);
    }, 1000);
}

// Formater les nombres
function formatNumber(num) {
    if (num < 1000) return Math.floor(num).toString();
    if (num < 1000000) return (num / 1000).toFixed(1) + 'K';
    if (num < 1000000000) return (num / 1000000).toFixed(1) + 'M';
    if (num < 1000000000000) return (num / 1000000000).toFixed(1) + 'B';
    return (num / 1000000000000).toFixed(1) + 'T';
}

// Mettre à jour l'affichage
function updateDisplay() {
    document.getElementById('points').textContent = formatNumber(gameState.points);
    document.getElementById('pointsPerClick').textContent = formatNumber(gameState.pointsPerClick);
    document.getElementById('pointsPerSecond').textContent = formatNumber(gameState.pointsPerSecond);
}

// Rendre les upgrades
function renderUpgrades() {
    const container = document.getElementById('upgradesContainer');
    container.innerHTML = '';

    upgradeDefinitions.forEach(upgrade => {
        const owned = gameState.upgrades[upgrade.id].owned;
        const cost = getUpgradeCost(upgrade.id);
        const canAfford = gameState.points >= cost;

        const upgradeElement = document.createElement('div');
        upgradeElement.className = 'upgrade-item' + (canAfford ? ' affordable' : '');

        upgradeElement.innerHTML = `
            <div class="upgrade-info">
                <span class="upgrade-name">${upgrade.name}</span>
                <span class="upgrade-description">${upgrade.description}</span>
                <span class="upgrade-owned">Possédé: ${owned}</span>
            </div>
            <div class="upgrade-buy">
                <span class="upgrade-cost">${formatNumber(cost)}</span>
                <button class="buy-button" ${!canAfford ? 'disabled' : ''}>
                    Acheter
                </button>
            </div>
        `;

        const buyButton = upgradeElement.querySelector('.buy-button');
        buyButton.addEventListener('click', () => buyUpgrade(upgrade.id));

        container.appendChild(upgradeElement);
    });
}

// Afficher une notification
function showNotification(message) {
    // Simple console log pour l'instant, peut être amélioré avec un toast
    console.log('Notification:', message);
}

// Boucle de jeu principale
function gameLoop() {
    if (gameState.pointsPerSecond > 0) {
        gameState.points += gameState.pointsPerSecond / 10; // 10 updates par seconde
        updateDisplay();
        renderUpgrades();
    }
}

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    loadGame();
    updateDisplay();
    renderUpgrades();

    // Bouton principal
    document.getElementById('clickButton').addEventListener('click', handleClick);

    // Boutons de contrôle
    document.getElementById('resetButton').addEventListener('click', resetGame);
    document.getElementById('saveButton').addEventListener('click', saveGame);

    // Boucle de jeu (10 fois par seconde)
    setInterval(gameLoop, 100);

    // Sauvegarde automatique toutes les 30 secondes
    setInterval(saveGame, 30000);
});
