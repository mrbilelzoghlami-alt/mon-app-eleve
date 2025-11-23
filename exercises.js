// exercises.js
// Ce fichier gère l'affichage et la correction des types d'exercices

// 1. Les instructions pour l'IA selon le type
export const PROMPT_TEMPLATES = {
    remplir_les_blancs: "Génère 5 phrases. Pour chaque espace vide (%BLANK%), insère le mot ou le verbe de base (infinitif ou non accordé) entre parenthèses **juste avant** l'espace pour servir d'indice. Exemple: (verbe) %BLANK%",
    choix_multiple: "Génère 5 questions sous forme d'énoncé, chacune avec 3 à 4 options de réponse (dont une seule est correcte).",
    vrai_faux: "Génère 5 affirmations claires, dont certaines sont vraies et d'autres sont fausses, pour tester la règle.",
    remettre_en_ordre: "Génère 5 phrases mélangées. Fournis la phrase complète correcte comme 'ordre_correct'."
};

// 2. Fonction pour afficher l'exercice (HTML)
export function renderExerciseContent(q, idx, containerDiv) {
    let html = `<p><strong>Question ${idx + 1}:</strong> ${q.instruction}</p>`;

    if (q.type === 'remplir_les_blancs') {
        const inputHtml = q.content.replace(/%BLANK%/g, `<input type="text" class="fill-in-blank" name="q${q.id}" autocomplete="off">`);
        html += `<p style="line-height:2em; font-size:1.1em">${inputHtml}</p>`;
        containerDiv.innerHTML = html;
    } 
    else if (q.type === 'choix_multiple' || q.type === 'vrai_faux') {
        html += `<p>${q.content}</p>`;
        q.options.forEach(opt => {
            html += `
                <label style="font-weight:normal; margin:5px 0; display:block;">
                    <input type="radio" name="q${q.id}" value="${opt}"> ${opt}
                </label>`;
        });
        containerDiv.innerHTML = html;
    }
    else if (q.type === 'remettre_en_ordre') {
        html += `<p>${q.instruction}</p>`;
        const zoneId = `zone-${q.id}`;
        // Nettoyage et mélange des mots
        let words = [];
        if (q.content.includes(',')) words = q.content.split(',').map(s => s.trim());
        else words = q.content.split(' ').map(s => s.trim());
        
        words.sort(() => Math.random() - 0.5);
        
        html += `
            <div class="reorder-container" id="${zoneId}">
                <div class="reorder-zone reorder-source" data-type="source">
                    ${words.map(w => `<span class="word-tag">${w}</span>`).join('')}
                </div>
                <p style="font-size:0.8em; color:#666">Cliquez pour déplacer les mots 👇</p>
                <div class="reorder-zone reorder-target" data-type="target"></div>
                <input type="hidden" name="q${q.id}"> 
            </div>
        `;
        containerDiv.innerHTML = html;
        
        // Active la logique de clic pour ce type spécifique
        setTimeout(() => setupDragAndClickForId(zoneId), 100);
    }
}

// 3. Fonction pour calculer si la réponse est juste
export function checkAnswer(q) {
    let userRep = "";
    let isCorrect = false;

    if (q.type === 'remplir_les_blancs') {
        const input = document.querySelector(`input[name="q${q.id}"]`);
        userRep = input ? input.value.trim() : "";
        if(userRep.toLowerCase() === q.correct.toLowerCase()) isCorrect = true;
    }
    else if (q.type === 'remettre_en_ordre') {
        const input = document.querySelector(`input[name="q${q.id}"]`);
        userRep = input ? input.value : "";
        // Nettoyage ponctuation pour comparaison souple
        const cleanUser = userRep.replace(/,/g, ' ').replace(/\s+/g, ' ').toLowerCase().trim();
        const cleanCorrect = q.correct.replace(/,/g, ' ').replace(/\s+/g, ' ').toLowerCase().trim();
        if(cleanUser === cleanCorrect) isCorrect = true;
    }
    else {
        const checked = document.querySelector(`input[name="q${q.id}"]:checked`);
        userRep = checked ? checked.value : "Aucune réponse";
        if(userRep === q.correct) isCorrect = true;
    }

    return { isCorrect, userRep };
}

// Petite fonction interne pour gérer le clic du Puzzle
function setupDragAndClickForId(zoneId) {
    const container = document.getElementById(zoneId);
    if(!container) return;
    
    const tags = container.querySelectorAll('.word-tag');
    tags.forEach(tag => {
        tag.addEventListener('click', function() {
            const currentZone = this.parentElement;
            const targetZone = currentZone.classList.contains('reorder-source') 
                ? container.querySelector('.reorder-target') 
                : container.querySelector('.reorder-source');
            
            targetZone.appendChild(this);
            this.classList.toggle('placed');

            const hiddenInput = container.querySelector('input[type="hidden"]');
            const words = Array.from(container.querySelector('.reorder-target').children).map(el => el.innerText);
            hiddenInput.value = words.join(' '); 
        });
    });
}
