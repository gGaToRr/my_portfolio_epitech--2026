import React from 'react';
import './App.css';
import NetworkAnimation from './components/animations/NetworkAnimation';
import SkillIcons from './components/animations/SkillIcons';
import ObjectiveDetails from './components/animations/ObjectiveDetails';
import burger_menu from '../src/components/pictures/burger-bar(1).png';
import croix_menu from '../src/components/pictures/croix.png';
import { useState, useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';
import NET from 'vanta/dist/vanta.net.min';
import { waapi } from 'animejs';

function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeObjective, setActiveObjective] = useState(null);
  const vantaBgRef = useRef(null);
  const vantaEffect = useRef(null);

  useEffect(() => {
    if (!vantaEffect.current && vantaBgRef.current) {
      vantaEffect.current = NET({
        el: vantaBgRef.current,
        THREE,
        mouseControls: true,
        touchControls: true,
        gyroControls: false,
        minHeight: 200.00,
        minWidth: 200.00,
        scale: 1.00,
        scaleMobile: 1.00,
        maxDistance: 20.00,
        color: 0xa729de,
        backgroundColor: 0xd1224,
        spacing: 20.00
      });
    }
    return () => {
      if (vantaEffect.current) {
        vantaEffect.current.destroy();
        vantaEffect.current = null;
      }
    };
  }, []);

  // Centralisation des liens
  const menuLinks = [
    { name: "Who I am.", href: "#who" },
    { name: "My objectives", href: "#objectives" },
    { name: "My experiences", href: "#experiences" },
    { name: "Contact me", href: "#contact" },
  ];

  // Bloquer le scroll quand le menu est ouvert
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isMenuOpen]);

  const toggleObjective = useCallback((id) => {
    const isClosing = activeObjective === id;

    if (isClosing) {
      const detailEl = document.querySelector(`.full-width-details[data-id="${id}"]`);
      if (detailEl) {
        waapi.animate(detailEl, {
          opacity: [1, 0],
          translateY: [0, -10],
          scale: [1, 0.96],
          duration: 200,
          ease: 'inExpo',
        });
        setTimeout(() => setActiveObjective(null), 200);
      } else {
        setActiveObjective(null);
      }
    } else {
      const cardEl = document.querySelector(`.objective-card[data-id="${id}"]`);
      if (cardEl) {
        waapi.animate(cardEl, {
          scale: [1, 0.96, 1],
          duration: 450,
          ease: 'outElastic(1, .6)',
        });
      }
      setActiveObjective(id);
      requestAnimationFrame(() => {
        const detailEl = document.querySelector(`.full-width-details[data-id="${id}"]`);
        if (detailEl) {
          waapi.animate(detailEl, {
            opacity: [0, 1],
            translateY: [-20, 0],
            scale: [0.95, 1],
            duration: 450,
            ease: 'outExpo',
          });
        }
      });
    }
  }, [activeObjective]);

  return (
    <>
      <div className="vanta-bg" ref={vantaBgRef} />
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
                <SkillIcons />
            </div>
          </div>
          <div className="animation-card">
            <NetworkAnimation />
          </div>
        </section>
        
        {/* SECTION: OBJECTIVES */}
        <section id="objectives">
          <h2>My objectives</h2>
          <div className="objectives-container">
            {[
              { id: 1, number: "01", title: "Réseaux & Infrastructures",
                desc: "Je suis particulièrement motivé à accroître mes capacités dans le domaine du réseau. Je souhaite intégrer une structure professionnelle afin de parfaire mes connaissances. Depuis le début de mes études, je gère mon propre serveur personnel sur lequel je pratique quotidiennement.",
                items: ["Protocoles (TCP/IP, UDP, Telnet, SSH)", "Outils de supervision (Wireshark, Zabbix)", "Sécurité et optimisation des performances"] },
              { id: 2, number: "02", title: "Cloud Computing",
                desc: "Le monde du Cloud m'intéresse vivement et constitue l'un de mes objectifs majeurs. Convaincu que ce secteur est l'avenir de notre infrastructure, je souhaite être à la pointe des technologies de déploiement et de gestion à distance.",
                items: ["Maîtrise des plateformes (AWS, Azure, GCP)", "Automatisation (Terraform, Ansible)", "Gestion d'infrastructures scalables"] },
              { id: 3, number: "03", title: "Intelligence Artificielle",
                desc: "Grâce à mon cursus, je manipule des modèles génératifs depuis mes débuts. C'est un secteur en pleine mutation qui exige des connaissances approfondies, ce qui me pousse à m'investir davantage dans la compréhension des modèles LLM.",
                items: ["Modèles Open-source (Mistral, Llama, Qwen)", "Automatisation et analyse de données via l'IA", "Veille technologique sur le Machine Learning"] },
              { id: 4, number: "04", title: "Gestion de Projet",
                desc: "Je souhaite me perfectionner dans l'organisation et la gestion de projet. C'est un pilier souvent sous-estimé, pourtant crucial pour la réussite d'une solution technique. Mon but est de piloter des projets efficacement de A à Z.",
                items: ["Méthodologies Agiles (Scrum, Kanban)", "Outils collaboratifs (GitHub, Jira, Trello)", "Communication d'équipe et respect des délais"] },
            ].map(obj => (
              <React.Fragment key={obj.id}>
                <div
                  className={`objective-card ${activeObjective === obj.id ? 'active' : ''}`}
                  data-id={obj.id}
                  onClick={() => toggleObjective(obj.id)}
                >
                  <div className="obj-header">
                    <span className="obj-number">{obj.number}</span>
                    <h3>{obj.title}</h3>
                  </div>
                  <p>{obj.desc}</p>
                  <ul>
                    {obj.items.map((item, i) => <li key={i}>{item}</li>)}
                  </ul>
                </div>
                {activeObjective === obj.id && <ObjectiveDetails objId={obj.id} />}
              </React.Fragment>
            ))}
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
    </>
  );
}

export default App;