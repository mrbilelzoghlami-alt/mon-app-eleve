// exercises.js
// Gestion de l'affichage et de la correction

export const PROMPT_TEMPLATES = {
    remplir_les_blancs: "Génère 5 phrases. Pour chaque espace vide (%BLANK%), insère le mot ou le verbe de base entre parenthèses juste avant le trou.",
    choix_multiple: "Génère 5 questions QCM.",
    vrai_faux: "Génère 5 affirmations Vrai/Faux.",
    remettre_en_ordre: "Génère 5 phrases mélangées ou mots mélangés.",
    listening: "Génère 5 items audio."
};

// Synthèse vocale (Text-to-Speech)
function speakText(text) {
    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-GB'; // Accent britannique
        utterance.rate = 0.8; 
        window.speechSynthesis.speak(utterance);
    } else {
        alert("Ton appareil ne supporte pas l'audio.");
    }
}

export function renderExerciseContent(q, idx, containerDiv) {
    let html = `<div class="question-block">`;
    
    // --- TYPE AUDIO (LISTENING) ---
    if (q.type === 'listening') {
        html += `<p><strong>Question ${idx + 1}:</strong> ${q.instruction}</p>`;
        const btnId = `speak-btn-${q.id}`;
        html += `<button type="button" id="${btnId}" class="speak-button" style="background:#ff9800; color:white; border:none; padding:8px 15px; border-radius:20px; cursor:pointer; margin-bottom:10px; font-weight:bold;">🔊 ÉCOUTER</button>`;
        
        if (q.options && q.options.length > 0) {
            q.options.forEach(opt => {
                html += `<label style="display:block; margin:5px 0; padding:8px; background:#f5f5f5; border-radius:5px; cursor:pointer;"><input type="radio" name="q${q.id}" value="${opt}"> ${opt}</label>`;
            });
        } else {
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
    // --- TYPE SAISIE (LANGUAGE / GRAMMAR) ---
    else if (q.type === 'remplir_les_blancs') {
        html += `<p><strong>Question ${idx + 1}:</strong> ${q.instruction}</p>`;
        // Remplace %BLANK% par un input
        // Note: S'il y a plusieurs %BLANK%, cela créera plusieurs inputs avec le même 'name'
        const contentWithInput = q.content.replace(/%BLANK%/g, `<input type="text" class="fill-in-blank" name="q${q.id}" autocomplete="off" style="border:none; border-bottom:2px dashed #3f51b5; background:#f0f4ff; text-align:center; width:120px; font-weight:bold; color:#333; margin: 0 5px;">`);
        html += `<p style="line-height:2em; font-size:1.1em">${contentWithInput}</p>`;
        containerDiv.innerHTML = html + `</div>`;
    }
    // --- TYPE QCM (LANGUAGE / FUNCTIONS) ---
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
    // --- TYPE PUZZLE (SPELLING) ---
    else if (q.type === 'remettre_en_ordre') {
        html += `<p><strong>Question ${idx + 1}:</strong> ${q.instruction}</p>`;
        const zoneId = `zone-${q.id}`;
        let elements = q.content.includes(',') ? q.content.split(',') : q.content.split(' ');
        elements = elements.map(s => s.trim()).sort(() => Math.random() - 0.5);
        
        html += `
            <div id="${zoneId}" class="reorder-container">
                <div class="reorder-zone reorder-source" style="background:#f9f9f9; padding:10px; min-height:50px; display:flex; flex-wrap:wrap; gap:5px; border:1px dashed #ccc; border-radius:5px;">
                    ${elements.map(w => `<span class="word-tag" style="background:white; border:1px solid #3f51b5; color:#3f51b5; padding:5px 10px; border-radius:15px; cursor:pointer; user-select:none;">${w}</span>`).join('')}
                </div>
                <p style="font-size:0.8em; color:#666; margin:5px 0;">Cliquez pour déplacer 👇</p>
                <div class="reorder-zone reorder-target" style="background:#e8eaf6; padding:10px; min-height:50px; display:flex; flex-wrap:wrap; gap:5px; border:2px solid #3f51b5; border-radius:5px;"></div>
                <input type="hidden" name="q${q.id}">
            </div>
        `;
        containerDiv.innerHTML = html + `</div>`;
        setTimeout(() => setupDragAndClickForId(zoneId), 100);
    }
}

// --- FONCTION DE CORRECTION CORRIGÉE ET ROBUSTE ---
export function checkAnswer(q) {
    let userRep = "";
    let isCorrect = true; // On part du principe que c'est juste, et on cherche l'erreur

    // CAS 1: REMPLIR LES BLANCS (Gère 1 ou plusieurs trous)
    if (q.type === 'remplir_les_blancs') {
        // On récupère TOUS les inputs de cette question (il peut y en avoir plusieurs)
        const inputs = document.querySelectorAll(`input[name="q${q.id}"]`);
        let userValues = [];

        // On s'assure que la réponse attendue est un tableau pour faciliter la comparaison
        // Si l'API envoie une chaine simple "reponse", on en fait ["reponse"]
        let correctAnswers = Array.isArray(q.correct) ? q.correct : [q.correct];

        inputs.forEach((input, index) => {
            const val = input.value.trim();
            userValues.push(val);

            // On compare la réponse de l'élève avec la réponse attendue à cet index
            // On utilise String() pour éviter le crash .toLowerCase() sur null/undefined
            const expected = String(correctAnswers[index] || "").trim().toLowerCase();
            
            if (val.toLowerCase() !== expected) {
                isCorrect = false;
            }
        });

        // Pour l'affichage, on joint les réponses de l'élève
        userRep = userValues.join(', ');
        
        // Si on affiche la correction, on montre toutes les réponses attendues
        if (!isCorrect) {
             // On met à jour q.correct pour l'affichage final s'il a changé de format
             q.correct = correctAnswers.join(', ');
        }
    }
    // CAS 2: PUZZLE
    else if (q.type === 'remettre_en_ordre') {
        const input = document.querySelector(`input[name="q${q.id}"]`);
        userRep = input ? input.value : "";
        
        // Comparaison souple (sans virgules ni espaces multiples)
        const cleanUser = userRep.replace(/,/g, '').replace(/\s+/g, '').toLowerCase();
        const cleanCorrect = String(q.correct).replace(/,/g, '').replace(/\s+/g, '').toLowerCase();
        
        if(cleanUser !== cleanCorrect) isCorrect = false;
    }
    // CAS 3: QCM / LISTENING / VRAI FAUX
    else {
        const checked = document.querySelector(`input[name="q${q.id}"]:checked`);
        userRep = checked ? checked.value : "Aucune réponse";
        
        // Comparaison simple
        if(String(userRep).toLowerCase() !== String(q.correct).toLowerCase()) {
            isCorrect = false;
        }
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
            const words = Array.from(container.querySelector('.reorder-target').children).map(el => el.innerText);
            const separator = (words.length > 0 && words[0].length === 1) ? '' : ' '; 
            hiddenInput.value = words.join(separator); 
        });
    });
}
