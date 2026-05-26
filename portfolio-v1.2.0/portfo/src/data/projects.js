const projects = [
    {
        slug: 'portfolio',
        title: 'Portfolio',
        tagline: 'Le site que tu es en train de visiter — vitrine perso, design system maison, fond animé WebGL.',
        stack: ['React 19', 'React Router v7', 'Vanta.js / Three.js', 'CSS variables'],
        sections: [
            {
                heading: 'Contexte',
                body: "Mon portfolio perso : vitrine de mes projets et de mon parcours Epitech Marseille, mais aussi terrain de jeu pour expérimenter le front. Itéré en plusieurs versions (v1.1 → v1.2).",
            },
            {
                heading: 'Stack technique',
                body: 'React 19 + React Router v7 pour la navigation entre pages projet, Vanta.js (sur Three.js) pour le fond animé, CSS variables pour le thème dark/light dynamique.',
            },
            {
                heading: "Ce que j'ai appris",
                body: "Structurer une app React multi-pages avec un design system maison (tokens CSS), gérer les thèmes en runtime, et intégrer des animations WebGL sans tuer la perf.",
            },
        ],
    },
    {
        slug: 'merci-app',
        title: 'Merci-App',
        tagline: "Hub média all-in-one : musique, films, séries, anime, YouTube — un seul endroit, plusieurs sources.",
        stack: ['Python / Flask', 'React + TypeScript', 'Nginx', 'Docker Compose', 'yt-dlp'],
        sections: [
            {
                heading: 'Contexte',
                body: "Une app web qui agrège plusieurs sources média en un seul endroit : recherche musicale via Deezer, catalogue films/séries via TMDB, anime via AniList/Jikan, vidéos via yt-dlp. Multi-utilisateur (rôles admin / user), streaming des fichiers locaux, queue de téléchargements en temps réel. Usage strictement perso.",
            },
            {
                heading: 'Stack technique',
                body: "Backend Flask en Python, frontend React + TypeScript, Nginx en reverse proxy, le tout orchestré en Docker Compose. yt-dlp embarqué pour la couche download. Stack pensée pour être lancée en une commande sur n'importe quelle machine.",
            },
            {
                heading: "Ce que j'ai appris",
                body: "Designer une vraie app fullstack qui parle à plusieurs API tierces (Deezer, TMDB, AniList/Jikan), gérer une queue de jobs asynchrones, et packager une stack multi-services en Docker. Et bien séparer les responsabilités frontend / backend / proxy.",
            },
        ],
    },
    {
        slug: 'auris-mp3',
        title: 'Auris-MP3',
        tagline: "Lecteur MP3 IoT — projet maker pour me former à l'embarqué.",
        stack: ['IoT', 'Embedded', 'PoC documenté'],
        sections: [
            {
                heading: 'Contexte',
                body: "Projet personnel : construire un lecteur MP3 IoT pour me former à l'embarqué et au hardware, en parallèle d'Epitech. Cadré dès le départ comme un vrai projet pro, avec une méthodologie en 5 phases (Initiation, Planification, Réalisation, Suivi, Clôture).",
            },
            {
                heading: 'Stack technique',
                body: "Actuellement en phase PoC : choix matériels et logiciels en cours de validation, framework de gestion projet documenté. Première vraie incursion côté hardware après deux ans de soft.",
            },
            {
                heading: "Ce que j'ai appris",
                body: "Cadrer un projet personnel avant d'écrire la moindre ligne de code : valider la faisabilité, poser les jalons, documenter les choix. Et accepter qu'un PoC est plus important que de foncer dans la prod.",
            },
        ],
    },
    {
        slug: 'voltaire',
        title: 'Voltaire-Menu',
        tagline: "Userscript open source qui assiste Projet Voltaire — auto-réponse, mode discret, overlay live.",
        stack: ['JavaScript', 'Tampermonkey', 'Python', 'Docker'],
        sections: [
            {
                heading: 'Contexte',
                body: "Projet Voltaire est imposé dans pas mal d'écoles et d'entreprises, avec une UX… discutable. KAETS-Menu est une surcouche open source qui rend l'outil utilisable, avec plusieurs modes selon le besoin (AutoAnswer, Silent, Overlay, Compare).",
            },
            {
                heading: 'Stack technique',
                body: "Userscript JavaScript injecté via Tampermonkey côté navigateur, backend Python en Docker exécuté localement (port 8000) pour la base de réponses. Communication 100% locale, rien ne sort de la machine.",
            },
            {
                heading: "Ce que j'ai appris",
                body: "Coder un userscript qui s'injecte dans une app que je ne contrôle pas, packager un backend Python en Docker pour un usage perso, et penser produit avec plusieurs modes d'usage. Premier projet où j'ai eu de vrais utilisateurs.",
            },
        ],
    },
];

export default projects;
