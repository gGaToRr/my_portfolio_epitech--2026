import './App.css';
import burger_menu from '../src/components/pictures/burger-bar(1).png';
import croix_menu from '../src/components/pictures/croix.png';
import { useState, useEffect } from 'react';

function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // 1. Centralisation des liens
  const menuLinks = [
    { name: "Who I am.", href: "#who" },
    { name: "My objectives", href: "#objectives" },
    { name: "My experiences", href: "#experiences" },
    { name: "Contact me", href: "#contact" },
  ];

  // 2. Bloquer le scroll quand le menu est ouvert
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isMenuOpen]);

  return (
    <div className="App">
      <header className="App-header">
        <div className={`App-header-container ${isMenuOpen ? 'clicked' : ''}`}>
          <h1>Pierre Untersinger</h1>
          
          <nav className='link-pc'>
            {menuLinks.map((link) => (
              <a key={link.href} href={link.href}>
                <button>{link.name}</button>
              </a>
            ))}
          </nav>

          <button onClick={() => setIsMenuOpen(true)} className="hamburger-button">
            <img className='App-header-img' src={burger_menu} alt="Menu" />
          </button>
        </div>
      </header>

      {/* Menu Mobile */}
      {isMenuOpen && (
        <div className='test-menu open'>
          <div className='title-menu'>
            <h2>Menu</h2>
            <button onClick={() => setIsMenuOpen(false)} className='croix'>
              <img className='App-header-img' src={croix_menu} alt="Fermer" />
            </button>
          </div>
          <nav className='link'>
            {menuLinks.map((link) => (
              <a key={link.href} href={link.href} onClick={() => setIsMenuOpen(false)}>
                <button>{link.name}</button>
              </a>
            ))}
          </nav>
        </div>
      )}

      <main className='App-Main'>

        {/* SECTION: WHO I AM */}
        <section id="who">
          <h2>Who I am</h2>
          <div className="grid-presentation">
            <div className="profile-carte">
              <div className="image-profile">
                <span>Ma photo</span>
              </div>
              <div className="profile-info">
                <h3>Pierre Untersinger</h3>
                <p>Étudiant à Epitech Marseille</p>
              </div>
            </div>

            <div className="about-texte">
              <p>
                Étudiant depuis septembre 2025, je suis passionné et pleinement engagé 
                par les métiers du développement et de l'informatique. J'ai déjà eu l'opportunité de réaliser plusieurs projets 
                informatiques complexes, aussi bien dans le cadre de mon cursus qu'à titre personnel.
              </p>
              <div className="cta-container">
                <button className="btn-cv">Télécharger mon CV</button>
              </div>
            </div>

            <div className="skill-grid-brody">
              <div className="skill-tag">Web</div>
              <div className="skill-tag">Réseaux</div>
              <div className="skill-tag">AI</div>
              <div className="skill-tag">Gestion / Organisation</div>
            </div>
          </div>
        </section>
        
        {/* SECTION: OBJECTIVES (Texte corrigé et structuré) */}
        <section id="objectives">
          <h2>My objectives</h2>
          <div className="objectives-container">
            
            <div className="objective-card">
              <div className="obj-header">
                <span className="obj-number">01</span>
                <h3>Réseaux & Infrastructures</h3>
              </div>
              <p>
                Je suis particulièrement motivé à accroître mes capacités dans le domaine du réseau. 
                Je souhaite intégrer une structure professionnelle afin de parfaire mes connaissances. 
                Depuis le début de mes études, je gère mon propre serveur personnel sur lequel je pratique quotidiennement.
              </p>
              <ul>
                <li>Protocoles (TCP/IP, UDP, Telnet, SSH)</li>
                <li>Outils de supervision (Wireshark, Zabbix)</li>
                <li>Sécurité et optimisation des performances</li>
              </ul>
            </div>

            <div className="objective-card">
              <div className="obj-header">
                <span className="obj-number">02</span>
                <h3>Cloud Computing</h3>
              </div>
              <p>
                Le monde du Cloud m'intéresse vivement et constitue l'un de mes objectifs majeurs. 
                Convaincu que ce secteur est l'avenir de notre infrastructure, je souhaite 
                être à la pointe des technologies de déploiement et de gestion à distance.
              </p>
              <ul>
                <li>Maîtrise des plateformes (AWS, Azure, GCP)</li>
                <li>Automatisation (Terraform, Ansible)</li>
                <li>Gestion d'infrastructures scalables</li>
              </ul>
            </div>

            <div className="objective-card">
              <div className="obj-header">
                <span className="obj-number">03</span>
                <h3>Intelligence Artificielle</h3>
              </div>
              <p>
                Grâce à mon cursus, je manipule des modèles génératifs depuis mes débuts. 
                C'est un secteur en pleine mutation qui exige des connaissances approfondies, 
                ce qui me pousse à m'investir davantage dans la compréhension des modèles LLM.
              </p>
              <ul>
                <li>Modèles Open-source (Mistral, Llama, Qwen)</li>
                <li>Automatisation et analyse de données via l'IA</li>
                <li>Veille technologique sur le Machine Learning</li>
              </ul>
            </div>

            <div className="objective-card">
              <div className="obj-header">
                <span className="obj-number">04</span>
                <h3>Gestion de Projet</h3>
              </div>
              <p>
                Je souhaite me perfectionner dans l'organisation et la gestion de projet. 
                C'est un pilier souvent sous-estimé, pourtant crucial pour la réussite 
                d'une solution technique. Mon but est de piloter des projets efficacement de A à Z.
              </p>
              <ul>
                <li>Méthodologies Agiles (Scrum, Kanban)</li>
                <li>Outils collaboratifs (GitHub, Jira, Trello)</li>
                <li>Communication d'équipe et respect des délais</li>
              </ul>
            </div>

          </div>
        </section>

        <section id="experiences">
          <h2>My experiences</h2>
          {/* À compléter plus tard */}
        </section>

        <section id="contact">
          <h2>Contact Me</h2>
          {/* À compléter plus tard */}
        </section>
      </main>
    </div>
  );
}

export default App;