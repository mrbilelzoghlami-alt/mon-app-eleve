// exercises.js

export const PROMPT_TEMPLATES = {
    remplir_les_blancs: "Génère 5 phrases. 1 SEUL TROU PAR PHRASE. Insère l'indice entre parenthèses avant le trou.",
    choix_multiple: "Génère 5 questions QCM.",
    vrai_faux: "Génère 5 affirmations Vrai/Faux.",
    // MODIFICATION ICI : Demande explicite des indices FR/AR
    remettre_en_ordre: "Génère 5 mots mélangés. DANS L'INSTRUCTION, AJOUTE LA TRADUCTION (FR + AR) COMME INDICE.",
    listening: "Génère 5 items audio.",
    vocabulaire_trad: "Génère 5 mots en anglais. Les options sont en Arabe."
};

// Synthèse vocale
function speakText(text) {
    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-GB'; 
        utterance.rate = 0.8; 
        window.speechSynthesis.speak(utterance);
    } else {
        alert("Audio non supporté");
    }
}

export function renderExerciseContent(q, idx, containerDiv) {
    let html = `<div class="question-block">`;
    
    // --- TYPE AUDIO ---
    if (q.type === 'listening') {
        html += `<p><strong>Question ${idx + 1}:</strong> ${q.instruction}</p>`;
        const btnId = `speak-btn-${q.id}`;
        html += `<div style="text-align:center; margin:15px 0;">
                    <button type="button" id="${btnId}" style="background:#ff9800; color:white; border:none; padding:10px 20px; border-radius:30px; cursor:pointer; font-size:1.1em; box-shadow: 0 4px 0 #e65100;">
                    🔊 Écouter
                    </button>
                 </div>`;
        
        if (q.options) {
            q.options.forEach(opt => {
                html += `<label style="display:block; margin:8px 0; padding:12px; background:#f0f0f0; border-radius:8px; cursor:pointer; border:1px solid #ccc;">
                            <input type="radio" name="q${q.id}" value="${opt}"> <span style="font-size:1.1em; margin-left:10px;">${opt}</span>
                         </label>`;
            });
        }
        containerDiv.innerHTML = html + `</div>`;
        setTimeout(() => {
            const btn = document.getElementById(btnId);
            if(btn) btn.onclick = (e) => { e.preventDefault(); speakText(q.content); };
        }, 100);
    } 
    
    // --- TYPE SAISIE ---
    else if (q.type === 'remplir_les_blancs') {
        html += `<p><strong>Question ${idx + 1}:</strong> ${q.instruction}</p>`;
        // Sécurité : S'assurer qu'il n'y a qu'un seul input par phrase pour éviter les bugs d'affichage
        const contentWithInput = q.content.replace(/%BLANK%/g, `<input type="text" class="fill-in-blank" name="q${q.id}" autocomplete="off" style="border:none; border-bottom:2px solid #3f51b5; background:#e8eaf6; text-align:center; padding:5px; width:130px; font-weight:bold; font-size:1.1em; color:#333;">`);
        html += `<p style="line-height:2em; font-size:1.2em">${contentWithInput}</p>`;
        containerDiv.innerHTML = html + `</div>`;
    }
    
    // --- TYPE QCM (Classique + Vocabulaire) ---
    else if (q.type === 'choix_multiple' || q.type === 'vrai_faux' || q.type === 'vocabulaire_trad') {
        html += `<p><strong>Question ${idx + 1}:</strong> ${q.instruction}</p>`;
        // Si c'est du vocabulaire, on affiche le mot en gros
        let styleContent = (q.type === 'vocabulaire_trad') ? "font-size:1.5em; text-align:center; color:#2c3e50; font-weight:bold;" : "font-weight:500; font-size:1.1em;";
        
        html += `<p style="${styleContent} margin-bottom:15px; background:#fff3e0; padding:10px; border-left:4px solid #ff9800;">${q.content}</p>`;
        
        if(q.options) {
            q.options.forEach(opt => {
                html += `<label style="display:block; margin:8px 0; padding:10px; background:#fff; border:1px solid #ddd; border-radius:6px; cursor:pointer; transition:0.2s;">
                            <input type="radio" name="q${q.id}" value="${opt}"> <span style="margin-left:8px; font-weight:500;">${opt}</span>
                         </label>`;
            });
        }
        containerDiv.innerHTML = html + `</div>`;
    }
    
    // --- TYPE PUZZLE ---
    else if (q.type === 'remettre_en_ordre') {
        html += `<p><strong>Question ${idx + 1}:</strong> ${q.instruction}</p>`; 
        // Note: L'instruction contiendra maintenant l'indice FR/AR généré par Gemini
        
        const zoneId = `zone-${q.id}`;
        let elements = q.content.includes(',') ? q.content.split(',') : q.content.split(' ');
        // Nettoyage des espaces vides
        elements = elements.map(s => s.trim()).filter(s => s !== "").sort(() => Math.random() - 0.5);
        
        html += `
            <div id="${zoneId}" class="reorder-container">
                <div class="reorder-zone reorder-source" style="background:#fafafa; padding:15px; min-height:60px; display:flex; flex-wrap:wrap; gap:8px; border:2px dashed #ccc; border-radius:8px;">
                    ${elements.map(w => `<span class="word-tag" style="background:white; border:2px solid #3f51b5; color:#3f51b5; padding:8px 15px; border-radius:20px; cursor:pointer; user-select:none; font-weight:bold; font-size:1.1em;">${w}</span>`).join('')}
                </div>
                <p style="text-align:center; color:#666; margin:5px 0;">⬇️</p>
                <div class="reorder-zone reorder-target" style="background:#e8eaf6; padding:15px; min-height:60px; display:flex; flex-wrap:wrap; gap:8px; border:2px solid #3f51b5; border-radius:8px;"></div>
                <input type="hidden" name="q${q.id}">
            </div>
        `;
        containerDiv.innerHTML = html + `</div>`;
        setTimeout(() => setupDragAndClickForId(zoneId), 100);
    }
}

export function checkAnswer(q) {
    let userRep = "";
    let isCorrect = true;

    if (q.type === 'remplir_les_blancs') {
        const input = document.querySelector(`input[name="q${q.id}"]`);
        userRep = input ? input.value.trim() : "";
        if(userRep.toLowerCase() !== String(q.correct).toLowerCase()) isCorrect = false;
    }
    else if (q.type === 'remettre_en_ordre') {
        const input = document.querySelector(`input[name="q${q.id}"]`);
        userRep = input ? input.value : "";
        const cleanUser = userRep.replace(/,/g, '').replace(/\s+/g, '').toLowerCase();
        const cleanCorrect = String(q.correct).replace(/,/g, '').replace(/\s+/g, '').toLowerCase();
        if(cleanUser !== cleanCorrect) isCorrect = false;
    }
    else {
        const checked = document.querySelector(`input[name="q${q.id}"]:checked`);
        userRep = checked ? checked.value : "Aucune réponse";
        // Comparaison simple string vs string
        if(String(userRep).trim() !== String(q.correct).trim()) isCorrect = false;
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
