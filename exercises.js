// exercises.js
// Gestion de l'affichage et de la correction

export const PROMPT_TEMPLATES = {
    remplir_les_blancs: "Génère 5 phrases. Pour chaque espace vide, utilise le code %BLANK%.",
    choix_multiple: "Génère 5 questions. NE PAS UTILISER DE TROUS (%BLANK%). Pose une question complète.",
    vrai_faux: "Génère 5 affirmations.",
    remettre_en_ordre: "Génère 5 phrases ou mots à réordonner.",
    listening: "Génère 5 items audio."
};

// Synthèse vocale
function speakText(text) {
    if ('speechSynthesis' in window) {
        // Nettoyage du texte (enlève les %BLANK% ou caractères bizarres avant de lire)
        const cleanText = String(text).replace(/%BLANK%/g, "blank").replace(/[^a-zA-Z0-9\s\?\!\.]/g, "");
        const utterance = new SpeechSynthesisUtterance(cleanText);
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
    
    // --- TYPE SAISIE (Language) ---
    else if (q.type === 'remplir_les_blancs') {
        html += `<p><strong>Question ${idx + 1}:</strong> ${q.instruction}</p>`;
        // Conversion en string pour sécurité
        let textContent = String(q.content);
        
        // Si l'IA a oublié les %BLANK% mais a mis des "...", on corrige
        if (!textContent.includes('%BLANK%') && textContent.includes('...')) {
            textContent = textContent.replace(/\.\.\./g, '%BLANK%');
        }

        const contentWithInput = textContent.replace(/%BLANK%/g, `<input type="text" class="fill-in-blank" name="q${q.id}" autocomplete="off" style="border:none; border-bottom:2px dashed #3f51b5; background:#f0f4ff; text-align:center; width:120px; font-weight:bold; color:#333; margin:0 5px;">`);
        html += `<p style="line-height:2em; font-size:1.2em">${contentWithInput}</p>`;
        containerDiv.innerHTML = html + `</div>`;
    }
    
    // --- TYPE QCM ---
    else if (q.type === 'choix_multiple' || q.type === 'vrai_faux' || q.type === 'vocabulaire_trad') {
        html += `<p><strong>Question ${idx + 1}:</strong> ${q.instruction}</p>`;
        // Affichage propre de la question/mot
        html += `<p style="font-weight:500; font-size:1.1em; margin-bottom:15px; background:#fff3e0; padding:10px; border-left:4px solid #ff9800;">${q.content}</p>`;
        
        if(q.options) {
            q.options.forEach(opt => {
                html += `<label style="display:block; margin:8px 0; padding:10px; background:#fff; border:1px solid #ddd; border-radius:6px; cursor:pointer; transition:0.2s;">
                            <input type="radio" name="q${q.id}" value="${opt}"> <span style="margin-left:8px; font-weight:500;">${opt}</span>
                         </label>`;
            });
        }
        containerDiv.innerHTML = html + `</div>`;
    }
    
    // --- TYPE PUZZLE (Correction split) ---
    else if (q.type === 'remettre_en_ordre') {
        html += `<p><strong>Question ${idx + 1}:</strong> ${q.instruction}</p>`;
        const zoneId = `zone-${q.id}`;
        
        // --- CORRECTION DU BUG SPLIT ---
        // On force la conversion en Chaine de caractères (String) avant de manipuler
        let rawContent = String(q.content); 
        
        let elements = [];
        if (rawContent.includes(',')) {
            elements = rawContent.split(',');
        } else {
            // Si pas de virgule, on découpe par espace, sauf si c'est un seul mot (Spelling)
            if(rawContent.length < 15 && !rawContent.includes(' ')) {
                 // C'est probablement un mot à épeler (ex: FAMILY), on split par lettre
                 elements = rawContent.split('');
            } else {
                 elements = rawContent.split(' ');
            }
        }
        
        // Nettoyage et mélange
        elements = elements
            .map(s => s.trim())
            .filter(s => s !== "")
            .sort(() => Math.random() - 0.5);
        
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
        const inputs = document.querySelectorAll(`input[name="q${q.id}"]`);
        let userValues = [];
        
        // Gestion souple : si l'IA a donné une seule string "reponse", on la met dans un tableau
        let correctAnswers = Array.isArray(q.correct) ? q.correct : [String(q.correct)];

        // Si l'IA a donné une seule chaine mais avec des virgules "reponse1, reponse2"
        if (correctAnswers.length === 1 && correctAnswers[0].includes(',')) {
             correctAnswers = correctAnswers[0].split(',').map(s => s.trim());
        }

        inputs.forEach((input, index) => {
            const val = input.value.trim();
            userValues.push(val);
            const expected = String(correctAnswers[index] || "").trim().toLowerCase();
            if (val.toLowerCase() !== expected) isCorrect = false;
        });
        
        userRep = userValues.join(', ');
        if (!isCorrect) q.correct = correctAnswers.join(', '); // Pour l'affichage
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
        if(String(userRep).trim().toLowerCase() !== String(q.correct).trim().toLowerCase()) isCorrect = false;
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
            // Espace si ce sont des mots, vide si ce sont des lettres (longueur 1)
            const separator = (words.length > 0 && words[0].length === 1) ? '' : ' '; 
            hiddenInput.value = words.join(separator); 
        });
    });
}
