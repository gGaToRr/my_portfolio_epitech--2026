"""Script de peuplement initial (Seed) de la base SQLite."""
from app.database import engine, Base, SessionLocal
from app.models import AdminUser, Project, EpitechProject
from app.auth import hash_password, verify_password
from app.config import settings
from app.logger import log_success, log_error

INITIAL_PROJECTS = {
    "en": [
        {
            "slug": "portfolio",
            "title": "Portfolio",
            "tagline": "The website you are currently exploring — personal showcase, custom design system, interactive mountain wallpaper.",
            "stack": ["React 19", "FastAPI / Python", "Modern CSS Variables", "Full i18n"],
            "category": "personal",
            "sections": [
                {
                    "heading": "Context",
                    "body": "My personal portfolio: a showcase of my projects and curriculum at Epitech Marseille, as well as a playground to build refined front-end interfaces and robust system architectures."
                },
                {
                    "heading": "Tech Stack",
                    "body": "React 19 + React Router v7 for smooth client-side routing, modular CSS tokens with complete Dark & Light themes, full bilingual i18n support, and a lightweight FastAPI Python backend."
                },
                {
                    "heading": "What I Learned",
                    "body": "Structuring a scalable React application with a cohesive design system, managing runtime theme switching, state-driven internationalization, and optimized asset delivery."
                }
            ],
            "featured": True,
            "display_order": 1
        },
        {
            "slug": "merci-app",
            "title": "Merci-App",
            "tagline": "All-in-one media hub: music, movies, series, anime, YouTube — unified access, multiple sources.",
            "stack": ["Python / Flask", "React + TypeScript", "Nginx", "Docker Compose", "yt-dlp"],
            "category": "personal",
            "sections": [
                {
                    "heading": "Context",
                    "body": "A web platform aggregating multiple media sources into a single interface: music search via Deezer, movie/series catalog via TMDB, anime via AniList/Jikan, video downloads via yt-dlp. Features multi-user authentication (admin/user roles), local file streaming, and real-time download queue. Built for personal self-hosted usage."
                },
                {
                    "heading": "Tech Stack",
                    "body": "Flask Python backend, React + TypeScript frontend, Nginx reverse proxy, all containerized and orchestrated with Docker Compose. Engineered to spin up seamlessly with a single command on any server."
                },
                {
                    "heading": "What I Learned",
                    "body": "Designing a production-grade fullstack application communicating with multiple third-party APIs (Deezer, TMDB, AniList/Jikan), orchestrating asynchronous job queues, and containerizing multi-service micro-architectures with Docker."
                }
            ],
            "featured": True,
            "display_order": 2
        },
        {
            "slug": "auris-mp3",
            "title": "Auris-MP3",
            "tagline": "IoT MP3 Player — maker project exploring embedded hardware and firmware.",
            "stack": ["IoT", "Embedded Systems", "Documented PoC", "C++ / Microcontroller"],
            "category": "personal",
            "sections": [
                {
                    "heading": "Context",
                    "body": "Personal maker project: building an IoT MP3 audio player to learn embedded firmware and hardware fundamentals alongside my Epitech studies. Framed from day one as a professional engineering project with a structured 5-phase methodology (Initiation, Planning, Implementation, Monitoring, Closure)."
                },
                {
                    "heading": "Tech Stack",
                    "body": "Hardware component selection, I2S DAC integration, microcontroller firmware architecture, and documented project governance framework."
                },
                {
                    "heading": "What I Learned",
                    "body": "Scoping a personal engineering initiative prior to writing code: validating feasibility, setting milestones, documenting hardware trade-offs, and iterative PoC validation."
                }
            ],
            "featured": True,
            "display_order": 3
        },
        {
            "slug": "voltaire",
            "title": "Voltaire-Menu",
            "tagline": "Open-source userscript assisting Projet Voltaire — auto-completion, discrete mode, live overlay.",
            "stack": ["JavaScript", "Tampermonkey", "Python", "Docker"],
            "category": "personal",
            "sections": [
                {
                    "heading": "Context",
                    "body": "Projet Voltaire is widely used in French educational institutions and corporations with a challenging UX. KAETS-Menu is an open-source overlay that provides multiple operating modes according to user needs (AutoAnswer, Silent, Overlay, Compare)."
                },
                {
                    "heading": "Tech Stack",
                    "body": "Client-side JavaScript userscript injected via Tampermonkey in the browser, paired with a local Python backend running in Docker (port 8000) for the answer lookup database. 100% local communication, zero data leaves the machine."
                },
                {
                    "heading": "What I Learned",
                    "body": "Developing a robust browser injection script within a closed third-party web application, packaging local Python Docker backends, and maintaining open-source tools with active daily users."
                }
            ],
            "featured": True,
            "display_order": 4
        }
    ],
    "fr": [
        {
            "slug": "portfolio",
            "title": "Portfolio",
            "tagline": "Le site que tu es en train de visiter — vitrine perso, design system maison, fond interactif.",
            "stack": ["React 19", "FastAPI / Python", "Variables CSS modernes", "Full i18n"],
            "category": "personal",
            "sections": [
                {
                    "heading": "Contexte",
                    "body": "Mon portfolio perso : vitrine de mes projets et de mon parcours Epitech Marseille, mais aussi terrain de jeu pour concevoir des interfaces soignées et des architectures robustes."
                },
                {
                    "heading": "Stack technique",
                    "body": "React 19 + React Router v7 pour la navigation, design system complet avec thèmes Dark & Light dynamiques, gestion bilingue i18n et backend FastAPI Python avec SQLite."
                },
                {
                    "heading": "Ce que j'ai appris",
                    "body": "Structurer une app React maintenable avec des tokens CSS, gérer le changement de thème et de langue au runtime, et optimiser les performances de rendu."
                }
            ],
            "featured": True,
            "display_order": 1
        },
        {
            "slug": "merci-app",
            "title": "Merci-App",
            "tagline": "Hub média all-in-one : musique, films, séries, anime, YouTube — un seul endroit, plusieurs sources.",
            "stack": ["Python / Flask", "React + TypeScript", "Nginx", "Docker Compose", "yt-dlp"],
            "category": "personal",
            "sections": [
                {
                    "heading": "Contexte",
                    "body": "Une app web qui agrège plusieurs sources média en un seul endroit : recherche musicale via Deezer, catalogue films/séries via TMDB, anime via AniList/Jikan, vidéos via yt-dlp. Multi-utilisateur (rôles admin / user), streaming des fichiers locaux, queue de téléchargements en temps réel. Usage strictement perso."
                },
                {
                    "heading": "Stack technique",
                    "body": "Backend Flask en Python, frontend React + TypeScript, Nginx en reverse proxy, le tout orchestré en Docker Compose. yt-dlp embarqué pour la couche download. Stack pensée pour être lancée en une commande sur n'importe quelle machine."
                },
                {
                    "heading": "Ce que j'ai appris",
                    "body": "Designer une vraie app fullstack qui parle à plusieurs API tierces (Deezer, TMDB, AniList/Jikan), gérer une queue de jobs asynchrones, et packager une stack multi-services en Docker."
                }
            ],
            "featured": True,
            "display_order": 2
        },
        {
            "slug": "auris-mp3",
            "title": "Auris-MP3",
            "tagline": "Lecteur MP3 IoT — projet maker pour me former à l'embarqué.",
            "stack": ["IoT", "Embedded", "PoC documenté", "C++ / Microcontrôleur"],
            "category": "personal",
            "sections": [
                {
                    "heading": "Contexte",
                    "body": "Projet personnel : construire un lecteur MP3 IoT pour me former à l'embarqué et au hardware, en parallèle d'Epitech. Cadré dès le départ comme un vrai projet pro, avec une méthodologie en 5 phases (Initiation, Planification, Réalisation, Suivi, Clôture)."
                },
                {
                    "heading": "Stack technique",
                    "body": "Actuellement en phase PoC : choix matériels et logiciels en cours de validation, framework de gestion projet documenté. Première vraie incursion côté hardware après deux ans de soft."
                },
                {
                    "heading": "Ce que j'ai appris",
                    "body": "Cadrer un projet personnel avant d'écrire la moindre ligne de code : valider la faisabilité, poser les jalons, documenter les choix. Et accepter qu'un PoC est plus important que de foncer dans la prod."
                }
            ],
            "featured": True,
            "display_order": 3
        },
        {
            "slug": "voltaire",
            "title": "Voltaire-Menu",
            "tagline": "Userscript open source qui assiste Projet Voltaire — auto-réponse, mode discret, overlay live.",
            "stack": ["JavaScript", "Tampermonkey", "Python", "Docker"],
            "category": "personal",
            "sections": [
                {
                    "heading": "Contexte",
                    "body": "Projet Voltaire est imposé dans pas mal d'écoles et d'entreprises, avec une UX… discutable. KAETS-Menu est une surcouche open source qui rend l'outil utilisable, avec plusieurs modes selon le besoin (AutoAnswer, Silent, Overlay, Compare)."
                },
                {
                    "heading": "Stack technique",
                    "body": "Userscript JavaScript injecté via Tampermonkey côté navigateur, backend Python en Docker exécuté localement (port 8000) pour la base de réponses. Communication 100% locale, rien ne sort de la machine."
                },
                {
                    "heading": "Ce que j'ai appris",
                    "body": "Coder un userscript qui s'injecte dans une app que je ne contrôle pas, packager un backend Python en Docker pour un usage perso, et penser produit avec plusieurs modes d'usage. Premier projet où j'ai eu de vrais utilisateurs."
                }
            ],
            "featured": True,
            "display_order": 4
        }
    ]
}

INITIAL_EPITECH_PROJECTS = {
    "en": [
        {
            "name": "Job Aggregator",
            "category": "Web · Fullstack",
            "description": "Team project (4 members): a fullstack job search web application with an operational API and intelligent chatbot. Final defense before an academic jury.",
            "tags": ["Node.js", "React", "MariaDB", "phpMyAdmin", "Docker"],
            "repo_url": "https://github.com/EpitechBachelorPromo2028/B-YEP-200-MAR-2-1-jobaggregator-3",
            "display_order": 1
        },
        {
            "name": "Eliza",
            "category": "AI · Discord Bot",
            "description": "AI integration bot for Discord / Slack / Telegram. In a team of 3, created an « Anti-Rage » Discord bot for frustrated gamers: a private listening space to defuse tension and improve gaming experience. Self-hosted on a private server.",
            "tags": ["Python", "Discord API", "Self-hosted"],
            "repo_url": "https://github.com/EpitechBachelorPromo2028/B-AIA-210-MAR-2-1-eliza-8",
            "display_order": 2
        },
        {
            "name": "Bookworm",
            "category": "CLI · NLP",
            "description": "Python CLI tool for searching, downloading, and summarizing books via an online repository. Modules: load_book, download_book, process_text, compute_lexdiv, topics, cache.",
            "tags": ["Python", "NLP", "HTTP"],
            "repo_url": "https://github.com/EpitechBachelorPromo2028/B-AIA-200-MAR-2-1-aliceinwonderland-10",
            "display_order": 3
        },
        {
            "name": "Nextbuy",
            "category": "Data Science",
            "description": "Data science project analyzing real-world Instacart order data: processing 1.4 million raw orders into actionable business insights and training ML models to predict customer reorder behaviors.",
            "tags": ["Python", "Pandas", "ML"],
            "repo_url": "https://github.com/EpitechBachelorPromo2028/B-DAT-201-MAR-2-1-nextbuy-4",
            "display_order": 4
        },
        {
            "name": "Tardis",
            "category": "Data Science",
            "description": "Data science project in a team of 3 on SNCF train delay datasets (2018 to present). Route and station performance analysis, training ML predictive models, delivered through an interactive analytics dashboard.",
            "tags": ["Python", "ML", "Dashboard"],
            "repo_url": "https://github.com/EpitechBachelorPromo2028/B-DAT-200-MAR-2-1-tardis-7",
            "display_order": 5
        },
        {
            "name": "ProductDesign Hackathon",
            "category": "Hackathon · UX",
            "description": "Epitech × The Shifters Hackathon: designing an intuitive ecological data comparison platform for French municipalities. Eco-design approach to minimize carbon emissions during development and runtime.",
            "tags": ["UX", "Eco-design", "Open Data"],
            "repo_url": "https://github.com/EpitechBachelorPromo2028/B-TBM-100-MAR-1-1-productdesignhackathon-4",
            "display_order": 6
        },
        {
            "name": "Hack and Juice",
            "category": "Cybersecurity · Pentest",
            "description": "Pair pentesting on OWASP Juice-Shop. Discovery and exploitation of SQL injection vulnerabilities (sqlmap, base64 / URL encodings) and Stored/Reflected XSS attacks using custom and open-source payloads.",
            "tags": ["OWASP", "sqlmap", "XSS", "Pentest"],
            "repo_url": "https://github.com/EpitechBachelorPromo2028/B-SEC-100-MAR-1-1-hack_juice-10",
            "display_order": 7
        }
    ],
    "fr": [
        {
            "name": "Job Aggregator",
            "category": "Web · Fullstack",
            "description": "Projet de groupe (4 personnes) : un site web fullstack avec API et chatbot opérationnel. Présentation finale devant jury.",
            "tags": ["Node.js", "React", "MariaDB", "phpMyAdmin", "Docker"],
            "repo_url": "https://github.com/EpitechBachelorPromo2028/B-YEP-200-MAR-2-1-jobaggregator-3",
            "display_order": 1
        },
        {
            "name": "Eliza",
            "category": "IA · Bot",
            "description": "Bot IA d'intégration Slack / Discord / Telegram. En groupe de 3, on a choisi Discord pour créer un bot « Anti-Rage » destiné aux gamers frustrés : un espace de discussion privé pour se confier et éviter la catastrophe. Déployé sur serveur perso.",
            "tags": ["Python", "Discord API", "Self-hosted"],
            "repo_url": "https://github.com/EpitechBachelorPromo2028/B-AIA-210-MAR-2-1-eliza-8",
            "display_order": 2
        },
        {
            "name": "Bookworm",
            "category": "CLI · NLP",
            "description": "Outil CLI Python pour la recherche, le téléchargement et le résumé de livres via un annuaire en ligne. Modules : load_book, download_book, process_text, compute_lexdiv, topics, cache.",
            "tags": ["Python", "NLP", "HTTP"],
            "repo_url": "https://github.com/EpitechBachelorPromo2028/B-AIA-200-MAR-2-1-aliceinwonderland-10",
            "display_order": 3
        },
        {
            "name": "Nextbuy",
            "category": "Data Science",
            "description": "Projet data science sur les données réelles de commandes Instacart : transformer 1,4 million de commandes brutes en insights business actionnables et entraîner des modèles ML capables de prédire les comportements d'achat.",
            "tags": ["Python", "Pandas", "ML"],
            "repo_url": "https://github.com/EpitechBachelorPromo2028/B-DAT-201-MAR-2-1-nextbuy-4",
            "display_order": 4
        },
        {
            "name": "Tardis",
            "category": "Data Science",
            "description": "Projet data science (B-DAT-200) en équipe de 3 (Alix, Pierre, Valentin) sur les données SNCF de retards de trains (2018 → aujourd'hui). Analyse par trajet, gare et période, entraînement d'un modèle ML pour prédire les retards, le tout accessible via un dashboard interactif.",
            "tags": ["Python", "ML", "Dashboard"],
            "repo_url": "https://github.com/EpitechBachelorPromo2028/B-DAT-200-MAR-2-1-tardis-7",
            "display_order": 5
        },
        {
            "name": "ProductDesign Hackathon",
            "category": "Hackathon · UX",
            "description": "Hackathon Epitech × The Shifters : concevoir une interface intuitive pour consulter et comparer des données écologiques par commune. Démarche éco-responsable — limitation des émissions de gaz à effet de serre durant la phase de production.",
            "tags": ["UX", "Eco-design", "Open Data"],
            "repo_url": "https://github.com/EpitechBachelorPromo2028/B-TBM-100-MAR-1-1-productdesignhackathon-4",
            "display_order": 6
        },
        {
            "name": "Hack and Juice",
            "category": "Cybersécurité · Pentest",
            "description": "Pentest en binôme sur Juice-Shop, le site vulnérable d'OWASP. Découverte de failles SQL (sqlmap, base64 decoder, URL encoder) et de failles XSS Stored & Reflected. Utilisation de payloads home-made et de repos GitHub publics.",
            "tags": ["OWASP", "sqlmap", "XSS", "Pentest"],
            "repo_url": "https://github.com/EpitechBachelorPromo2028/B-SEC-100-MAR-1-1-hack_juice-10",
            "display_order": 7
        }
    ]
}

def seed_db():
    Base.metadata.create_all(bind=engine)
    db: Session = SessionLocal()
    try:
        # 1. Admin user
        admin = db.query(AdminUser).filter(AdminUser.username == settings.ADMIN_USERNAME).first()
        if not admin:
            admin = AdminUser(
                username=settings.ADMIN_USERNAME,
                hashed_password=hash_password(settings.ADMIN_PASSWORD)
            )
            db.add(admin)
            log_success("seed.py", "seed_db", f"Utilisateur admin '{settings.ADMIN_USERNAME}' initialisé")
        elif not verify_password(settings.ADMIN_PASSWORD, admin.hashed_password):
            # Le hash en base ne correspond plus au mot de passe effectif.
            #
            # Deux cas mènent ici : ADMIN_PASSWORD a été changé dans .env.local,
            # ou le fichier data/admin_credentials.json a été supprimé pendant
            # que la base survivait — auquel cas le mot de passe affiché au
            # démarrage ne permettrait plus de se connecter. On resynchronise
            # pour que ce qui est affiché soit toujours ce qui fonctionne.
            admin.hashed_password = hash_password(settings.ADMIN_PASSWORD)
            log_success("seed.py", "seed_db", f"Mot de passe de '{settings.ADMIN_USERNAME}' resynchronisé avec la configuration")

        # 2. Projets personnels
        if db.query(Project).count() == 0:
            for lang, list_proj in INITIAL_PROJECTS.items():
                for proj in list_proj:
                    p = Project(
                        slug=proj["slug"],
                        lang=lang,
                        title=proj["title"],
                        tagline=proj["tagline"],
                        stack=proj["stack"],
                        category=proj.get("category", "personal"),
                        sections=proj["sections"],
                        featured=proj.get("featured", True),
                        display_order=proj.get("display_order", 0)
                    )
                    db.add(p)
            log_success("seed.py", "seed_db", "Projets personnels importés avec succès")

        # 3. Projets Epitech
        if db.query(EpitechProject).count() == 0:
            for lang, list_proj in INITIAL_EPITECH_PROJECTS.items():
                for proj in list_proj:
                    ep = EpitechProject(
                        lang=lang,
                        name=proj["name"],
                        category=proj["category"],
                        description=proj["description"],
                        tags=proj["tags"],
                        repo_url=proj.get("repo_url"),
                        display_order=proj.get("display_order", 0)
                    )
                    db.add(ep)
            log_success("seed.py", "seed_db", "Projets académiques Epitech importés avec succès")

        db.commit()
    except Exception as e:
        log_error("seed.py", "seed_db", f"Erreur lors du seed initial: {str(e)}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    seed_db()
