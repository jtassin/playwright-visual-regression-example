// Date/heure qui change à chaque exécution : source classique de faux positifs
const now = document.querySelector('[data-testid="now"]');
const tick = () => (now.textContent = new Date().toLocaleString('fr-FR'));
tick();
setInterval(tick, 1000);
