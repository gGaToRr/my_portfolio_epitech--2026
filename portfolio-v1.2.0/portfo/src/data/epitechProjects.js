const epitechProjects = [
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
];

export default epitechProjects;
