const projectsData = {
    en: [
        {
            slug: 'portfolio',
            title: 'Portfolio',
            tagline: 'The website you are currently exploring — personal showcase, custom design system, interactive mountain wallpaper.',
            stack: ['React 19', 'React Router v7', 'Modern CSS Variables', 'Full i18n'],
            sections: [
                {
                    heading: 'Context',
                    body: "My personal portfolio: a showcase of my projects and curriculum at Epitech Marseille, as well as a playground to build refined front-end interfaces and robust system architectures.",
                },
                {
                    heading: 'Tech Stack',
                    body: 'React 19 + React Router v7 for smooth client-side routing, modular CSS tokens with complete Dark & Light themes, full bilingual i18n support, and a lightweight native Node SMTP backend.',
                },
                {
                    heading: 'What I Learned',
                    body: 'Structuring a scalable React application with a cohesive design system, managing runtime theme switching, state-driven internationalization, and optimized asset delivery.',
                },
            ],
        },
        {
            slug: 'merci-app',
            title: 'Merci-App',
            tagline: "All-in-one media hub: music, movies, series, anime, YouTube — unified access, multiple sources.",
            stack: ['Python / Flask', 'React + TypeScript', 'Nginx', 'Docker Compose', 'yt-dlp'],
            sections: [
                {
                    heading: 'Context',
                    body: "A web platform aggregating multiple media sources into a single interface: music search via Deezer, movie/series catalog via TMDB, anime via AniList/Jikan, video downloads via yt-dlp. Features multi-user authentication (admin/user roles), local file streaming, and real-time download queue. Built for personal self-hosted usage.",
                },
                {
                    heading: 'Tech Stack',
                    body: "Flask Python backend, React + TypeScript frontend, Nginx reverse proxy, all containerized and orchestrated with Docker Compose. Engineered to spin up seamlessly with a single command on any server.",
                },
                {
                    heading: 'What I Learned',
                    body: "Designing a production-grade fullstack application communicating with multiple third-party APIs (Deezer, TMDB, AniList/Jikan), orchestrating asynchronous job queues, and containerizing multi-service micro-architectures with Docker.",
                },
            ],
        },
        {
            slug: 'auris-mp3',
            title: 'Auris-MP3',
            tagline: "IoT MP3 Player — maker project exploring embedded hardware and firmware.",
            stack: ['IoT', 'Embedded Systems', 'Documented PoC', 'C++ / Microcontroller'],
            sections: [
                {
                    heading: 'Context',
                    body: "Personal maker project: building an IoT MP3 audio player to learn embedded firmware and hardware fundamentals alongside my Epitech studies. Framed from day one as a professional engineering project with a structured 5-phase methodology (Initiation, Planning, Implementation, Monitoring, Closure).",
                },
                {
                    heading: 'Tech Stack',
                    body: "Hardware component selection, I2S DAC integration, microcontroller firmware architecture, and documented project governance framework.",
                },
                {
                    heading: 'What I Learned',
                    body: "Scoping a personal engineering initiative prior to writing code: validating feasibility, setting milestones, documenting hardware trade-offs, and iterative PoC validation.",
                },
            ],
        },
        {
            slug: 'voltaire',
            title: 'Voltaire-Menu',
            tagline: "Open-source userscript assisting Projet Voltaire — auto-completion, discrete mode, live overlay.",
            stack: ['JavaScript', 'Tampermonkey', 'Python', 'Docker'],
            sections: [
                {
                    heading: 'Context',
                    body: "Projet Voltaire is widely used in French educational institutions and corporations with a challenging UX. KAETS-Menu is an open-source overlay that provides multiple operating modes according to user needs (AutoAnswer, Silent, Overlay, Compare).",
                },
                {
                    heading: 'Tech Stack',
                    body: "Client-side JavaScript userscript injected via Tampermonkey in the browser, paired with a local Python backend running in Docker (port 8000) for the answer lookup database. 100% local communication, zero data leaves the machine.",
                },
                {
                    heading: 'What I Learned',
                    body: "Developing a robust browser injection script within a closed third-party web application, packaging local Python Docker backends, and maintaining open-source tools with active daily users.",
                },
            ],
        },
    ],
    fr: [
        {
            slug: 'portfolio',
            title: 'Portfolio',
            tagline: 'Le site que tu es en train de visiter — vitrine perso, design system maison, fond interactif.',
            stack: ['React 19', 'React Router v7', 'Variables CSS modernes', 'Full i18n'],
            sections: [
                {
                    heading: 'Contexte',
                    body: "Mon portfolio perso : vitrine de mes projets et de mon parcours Epitech Marseille, mais aussi terrain de jeu pour concevoir des interfaces soignées et des architectures robustes.",
                },
                {
                    heading: 'Stack technique',
                    body: 'React 19 + React Router v7 pour la navigation, design system complet avec thèmes Dark & Light dynamiques, gestion bilingue i18n et backend SMTP Node natif sécurisé.',
                },
                {
                    heading: "Ce que j'ai appris",
                    body: "Structurer une app React maintenable avec des tokens CSS, gérer le changement de thème et de langue au runtime, et optimiser les performances de rendu.",
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
                    body: "Designer une vraie app fullstack qui parle à plusieurs API tierces (Deezer, TMDB, AniList/Jikan), gérer une queue de jobs asynchrones, et packager une stack multi-services en Docker.",
                },
            ],
        },
        {
            slug: 'auris-mp3',
            title: 'Auris-MP3',
            tagline: "Lecteur MP3 IoT — projet maker pour me former à l'embarqué.",
            stack: ['IoT', 'Embedded', 'PoC documenté', 'C++ / Microcontrôleur'],
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
    ],
};

export const getProjects = (lang = 'en') => projectsData[lang] || projectsData.en;
export const getProjectBySlug = (slug, lang = 'en') => {
    const list = getProjects(lang);
    return list.find((p) => p.slug === slug);
};

export default projectsData.en;
