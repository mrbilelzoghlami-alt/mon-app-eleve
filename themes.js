// themes.js
// Ce fichier contient la structure des matières et les listes de vocabulaire

export const PRIORITY_VERBS = "être, avoir, marcher, manger, commencer, appeler, acheter, envoyer, nettoyer, aller, courir, voir, lire, se promener, réussir, savoir, vouloir, pouvoir, écrire, partir, vivre, venir, rendre, mettre, faire, dire";

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
        },
        "Vocabulaire": { 
            type: "select", 
            options: ["Les émotions", "L'école", "La maison", "Les animaux"] 
        }
    },
    "Anglais": {
        "Vocabulary": { 
            type: "select", 
            options: ["Family Members", "Animals", "Colors & Numbers", "School Objects", "House & Furniture"] 
        },
        "Grammar": { 
            type: "select", 
            options: ["To Be (Present)", "To Have (Present)", "Plural of Nouns", "Present Continuous"] 
        }
    }
};
