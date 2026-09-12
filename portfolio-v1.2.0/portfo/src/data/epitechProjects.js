const epitechProjectsData = {
    en: [
        {
            name: 'Job Aggregator',
            category: 'Web · Fullstack',
            description:
                "Team project (4 members): a fullstack job search web application with an operational API and intelligent chatbot. Final defense before an academic jury.",
            tags: ['Node.js', 'React', 'MariaDB', 'phpMyAdmin', 'Docker'],
            repoUrl: 'https://github.com/EpitechBachelorPromo2028/B-YEP-200-MAR-2-1-jobaggregator-3',
        },
        {
            name: 'Eliza',
            category: 'AI · Discord Bot',
            description:
                "AI integration bot for Discord / Slack / Telegram. In a team of 3, created an « Anti-Rage » Discord bot for frustrated gamers: a private listening space to defuse tension and improve gaming experience. Self-hosted on a private server.",
            tags: ['Python', 'Discord API', 'Self-hosted'],
            repoUrl: 'https://github.com/EpitechBachelorPromo2028/B-AIA-210-MAR-2-1-eliza-8',
        },
        {
            name: 'Bookworm',
            category: 'CLI · NLP',
            description:
                "Python CLI tool for searching, downloading, and summarizing books via an online repository. Modules: load_book, download_book, process_text, compute_lexdiv, topics, cache.",
            tags: ['Python', 'NLP', 'HTTP'],
            repoUrl: 'https://github.com/EpitechBachelorPromo2028/B-AIA-200-MAR-2-1-aliceinwonderland-10',
        },
        {
            name: 'Nextbuy',
            category: 'Data Science',
            description:
                "Data science project analyzing real-world Instacart order data: processing 1.4 million raw orders into actionable business insights and training ML models to predict customer reorder behaviors.",
            tags: ['Python', 'Pandas', 'ML'],
            repoUrl: 'https://github.com/EpitechBachelorPromo2028/B-DAT-201-MAR-2-1-nextbuy-4',
        },
        {
            name: 'Tardis',
            category: 'Data Science',
            description:
                "Data science project in a team of 3 on SNCF train delay datasets (2018 to present). Route and station performance analysis, training ML predictive models, delivered through an interactive analytics dashboard.",
            tags: ['Python', 'ML', 'Dashboard'],
            repoUrl: 'https://github.com/EpitechBachelorPromo2028/B-DAT-200-MAR-2-1-tardis-7',
        },
        {
            name: 'ProductDesign Hackathon',
            category: 'Hackathon · UX',
            description:
                "Epitech × The Shifters Hackathon: designing an intuitive ecological data comparison platform for French municipalities. Eco-design approach to minimize carbon emissions during development and runtime.",
            tags: ['UX', 'Eco-design', 'Open Data'],
            repoUrl: 'https://github.com/EpitechBachelorPromo2028/B-TBM-100-MAR-1-1-productdesignhackathon-4',
        },
        {
            name: 'Hack and Juice',
            category: 'Cybersecurity · Pentest',
            description:
                "Pair pentesting on OWASP Juice-Shop. Discovery and exploitation of SQL injection vulnerabilities (sqlmap, base64 / URL encodings) and Stored/Reflected XSS attacks using custom and open-source payloads.",
            tags: ['OWASP', 'sqlmap', 'XSS', 'Pentest'],
            repoUrl: 'https://github.com/EpitechBachelorPromo2028/B-SEC-100-MAR-1-1-hack_juice-10',
        },
    ],
    fr: [
        {
            name: 'Job Aggregator',
            category: 'Web · Fullstack',
            description:
                "Projet de groupe (4 personnes) : un site web fullstack avec API et chatbot opérationnel. Présentation finale devant jury.",
            tags: ['Node.js', 'React', 'MariaDB', 'phpMyAdmin', 'Docker'],
            repoUrl: 'https://github.com/EpitechBachelorPromo2028/B-YEP-200-MAR-2-1-jobaggregator-3',
        },
        {
            name: 'Eliza',
            category: 'IA · Bot',
            description:
                "Bot IA d'intégration Slack / Discord / Telegram. En groupe de 3, on a choisi Discord pour créer un bot « Anti-Rage » destiné aux gamers frustrés : un espace de discussion privé pour se confier et éviter la catastrophe. Déployé sur serveur perso.",
            tags: ['Python', 'Discord API', 'Self-hosted'],
            repoUrl: 'https://github.com/EpitechBachelorPromo2028/B-AIA-210-MAR-2-1-eliza-8',
        },
        {
            name: 'Bookworm',
            category: 'CLI · NLP',
            description:
                "Outil CLI Python pour la recherche, le téléchargement et le résumé de livres via un annuaire en ligne. Modules : load_book, download_book, process_text, compute_lexdiv, topics, cache.",
            tags: ['Python', 'NLP', 'HTTP'],
            repoUrl: 'https://github.com/EpitechBachelorPromo2028/B-AIA-200-MAR-2-1-aliceinwonderland-10',
        },
        {
            name: 'Nextbuy',
            category: 'Data Science',
            description:
                "Projet data science sur les données réelles de commandes Instacart : transformer 1,4 million de commandes brutes en insights business actionnables et entraîner des modèles ML capables de prédire les comportements d'achat.",
            tags: ['Python', 'Pandas', 'ML'],
            repoUrl: 'https://github.com/EpitechBachelorPromo2028/B-DAT-201-MAR-2-1-nextbuy-4',
        },
        {
            name: 'Tardis',
            category: 'Data Science',
            description:
                "Projet data science (B-DAT-200) en équipe de 3 (Alix, Pierre, Valentin) sur les données SNCF de retards de trains (2018 → aujourd'hui). Analyse par trajet, gare et période, entraînement d'un modèle ML pour prédire les retards, le tout accessible via un dashboard interactif.",
            tags: ['Python', 'ML', 'Dashboard'],
            repoUrl: 'https://github.com/EpitechBachelorPromo2028/B-DAT-200-MAR-2-1-tardis-7',
        },
        {
            name: 'ProductDesign Hackathon',
            category: 'Hackathon · UX',
            description:
                "Hackathon Epitech × The Shifters : concevoir une interface intuitive pour consulter et comparer des données écologiques par commune. Démarche éco-responsable — limitation des émissions de gaz à effet de serre durant la phase de production.",
            tags: ['UX', 'Eco-design', 'Open Data'],
            repoUrl: 'https://github.com/EpitechBachelorPromo2028/B-TBM-100-MAR-1-1-productdesignhackathon-4',
        },
        {
            name: 'Hack and Juice',
            category: 'Cybersécurité · Pentest',
            description:
                "Pentest en binôme sur Juice-Shop, le site vulnérable d'OWASP. Découverte de failles SQL (sqlmap, base64 decoder, URL encoder) et de failles XSS Stored & Reflected. Utilisation de payloads home-made et de repos GitHub publics.",
            tags: ['OWASP', 'sqlmap', 'XSS', 'Pentest'],
            repoUrl: 'https://github.com/EpitechBachelorPromo2028/B-SEC-100-MAR-1-1-hack_juice-10',
        },
    ],
};

export const getEpitechProjects = (lang = 'en') => epitechProjectsData[lang] || epitechProjectsData.en;
export { epitechProjectsData };
export default epitechProjectsData.en;

