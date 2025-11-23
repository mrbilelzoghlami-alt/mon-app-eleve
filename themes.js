// themes.js
export const PRIORITY_VERBS = "be, have got, get up, wash, dress, eat, drink, go, watch, play, listen, read, write, speak, enjoy, like, love, study, do, brush";

export const THEMES = {
    "Français": {
        "Conjugaison": { 
            type: "checkbox", 
            groups: ["1er groupe", "2e groupe", "3e groupe"], 
            tenses: ["Présent", "Futur simple", "Passé composé", "Impératif"] 
        },
        "Grammaire": { 
            type: "select", 
            options: ["Les déterminants", "L'adjectif qualificatif", "Le sujet et le verbe", "Le pluriel des noms"] 
        }
    },
    "Anglais": {
        "Module 1 (7ème Année)": {
            type: "module_mode", // Type spécial pour déclencher l'interface simplifiée
            options: [
                "Listening (Compréhension & Sons)",
                "Language (Grammaire & Vocabulaire)",
                "Spelling (Orthographe)",
                "🛑 EXAMEN RÉVISION (Devoir Type)"
            ]
        },
        "Vocabulaire Général": { 
            type: "select", 
            options: ["Animals", "Colors & Numbers", "School Objects", "House"] 
        }
    }
};
