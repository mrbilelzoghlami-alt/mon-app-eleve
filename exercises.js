// exercises.js

// Instructions standards (utilisées pour les autres matières)
export const PROMPT_TEMPLATES = {
    remplir_les_blancs: "Génère 5 phrases. Pour chaque espace vide (%BLANK%), insère le mot ou le verbe de base entre parenthèses juste avant le trou.",
    choix_multiple: "Génère 5 questions QCM.",
    vrai_faux: "Génère 5 affirmations Vrai/Faux.",
    remettre_en_ordre: "Génère 5 phrases mélangées ou mots mélangés.",
    listening: "Génère 5 items audio."
};

// Synthèse vocale
function speakText(text) {
    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-UK'; // Accent britannique préféré pour l'école tunisienne
        utterance.rate = 0.8; // Un peu lent pour bien comprendre
        window.speechSynthesis.speak(utterance);
    } else {
        alert("Ton navigateur ne supporte pas l'audio.");
    }
}

export function renderExerciseContent(q, idx, containerDiv) {
    let html = `<div class="question-block">`;
    
    // --- TYPE AUDIO ---
    if (q.type === 'listening') {
        html += `<p><strong>Question ${idx + 1}:</strong> ${q.instruction}</p>`;
        const btnId = `speak-btn-${q.id}`;
        html += `<button type="button" id="${btnId}" class="speak-button" style="background:#ff9800; color:white; border:none; padding:8px 15px; border-radius:20px; cursor:pointer; margin-bottom:10px;">🔊 Écouter</button>`;
        
        if (q.options && q.options.length > 0) {
            q.options.forEach(opt => {
                html += `<label style="display:block; margin:5px 0; padding:8px; background:#f5f5f5; border-radius:5px; cursor:pointer;"><input type="radio" name="q${q.id}" value="${opt}"> ${opt}</label>`;
            });
        } else {
            // Cas Vrai/Faux audio
             html += `
                <label style="margin-right:15px"><input type="radio" name="q${q.id}" value="True"> True</label>
                <label><input type="radio" name="q${q.id}" value="False"> False</label>
            `;
        }
        containerDiv.innerHTML = html + `</div>`;
        
        setTimeout(() => {
            const btn = document.getElementById(btnId);
            if(btn) btn.onclick = (e) => { e.preventDefault(); speakText(q.content); };
        }, 100);
    } 
    // --- TYPE SAISIE (Language / Grammar) ---
    else if (q.type === 'remplir_les_blancs') {
        html += `<p><strong>Question ${idx + 1}:</strong> ${q.instruction}</p>`;
        // Remplace %BLANK% par un input
        const contentWithInput = q.content.replace(/%BLANK%/g, `<input type="text" class="fill-in-blank" name="q${q.id}" autocomplete="off" style="border:none; border-bottom:2px dashed #3f51b5; background:#f0f4ff; text-align:center; width:120px;">`);
        html += `<p style="line-height:1.8em; font-size:1.1em">${contentWithInput}</p>`;
        containerDiv.innerHTML = html + `</div>`;
    }
    // --- TYPE QCM (Language / Functions) ---
    else if (q.type === 'choix_multiple' || q.type === 'vrai_faux') {
        html += `<p><strong>Question ${idx + 1}:</strong> ${q.instruction}</p>`;
        html += `<p style="font-weight:500; margin-bottom:10px;">${q.content}</p>`;
        if(q.options) {
            q.options.forEach(opt => {
                html += `<label style="display:block; margin:5px 0; cursor:pointer;"><input type="radio" name="q${q.id}" value="${opt}"> ${opt}</label>`;
            });
        }
        containerDiv.innerHTML = html + `</div>`;
    }
    // --- TYPE PUZZLE (Spelling / Word Order) ---
    else if (q.type === 'remettre_en_ordre') {
        html += `<p><strong>Question ${idx + 1}:</strong> ${q.instruction}</p>`;
        const zoneId = `zone-${q.id}`;
        let elements = q.content.includes(',') ? q.content.split(',') : q.content.split(' ');
        elements = elements.map(s => s.trim()).sort(() => Math.random() - 0.5);
        
        html += `
            <div id="${zoneId}" class="reorder-container">
                <div class="reorder-zone reorder-source" style="background:#f9f9f9; padding:10px; min-height:50px; display:flex; flex-wrap:wrap; gap:5px; border:1px dashed #ccc;">
                    ${elements.map(w => `<span class="word-tag" style="background:white; border:1px solid #3f51b5; color:#3f51b5; padding:5px 10px; border-radius:15px; cursor:pointer; user-select:none;">${w}</span>`).join('')}
                </div>
                <div class="reorder-zone reorder-target" style="background:#e8eaf6; padding:10px; min-height:50px; margin-top:10px; display:flex; flex-wrap:wrap; gap:5px; border:2px solid #3f51b5;"></div>
                <input type="hidden" name="q${q.id}">
            </div>
        `;
        containerDiv.innerHTML = html + `</div>`;
        setTimeout(() => setupDragAndClickForId(zoneId), 100);
    }
}

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
        const cleanUser = userRep.replace(/,/g, '').replace(/\s+/g, '').toLowerCase();
        const cleanCorrect = q.correct.replace(/,/g, '').replace(/\s+/g, '').toLowerCase();
        if(cleanUser === cleanCorrect) isCorrect = true;
    }
    else {
        const checked = document.querySelector(`input[name="q${q.id}"]:checked`);
        userRep = checked ? checked.value : "Aucune réponse";
        if(userRep === q.correct) isCorrect = true;
    }
    return { isCorrect, userRep };
}

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
            const hiddenInput = container.querySelector('input[type="hidden"]');
            // On reconstruit la phrase avec des espaces ou virgules
            const words = Array.from(container.querySelector('.reorder-target').children).map(el => el.innerText);
            hiddenInput.value = words.join(' '); // Join avec espace par défaut
        });
    });
}
