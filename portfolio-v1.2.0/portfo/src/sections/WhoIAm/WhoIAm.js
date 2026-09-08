import SkillIcons from './SkillIcons';
import profilePhoto from '../../assets/me.jpeg';
import './WhoIAm.css';

function WhoIAm() {
    return (
        <section id="who">
            <h2>Who I am</h2>
            <div className="grid-presentation">
                <div className="skill-grid-brody">
                    <h3 className="skills-title">Skills</h3>
                    <SkillIcons />
                </div>

                <div className="profile-carte">
                    <div className="image-profile">
                        <img
                            src={profilePhoto}
                            alt="Pierre Untersinger"
                            decoding="async"
                            fetchPriority="high"
                            width="200"
                            height="200"
                        />
                    </div>
                    <div className="profile-info">
                        <h3>Pierre Untersinger</h3>
                        <p>Étudiant à Epitech Marseille</p>
                    </div>
                </div>

                <div className="about-texte">
                    <p>
                        Étudiant depuis septembre 2025 au sein de l'école Epitech Marseille, je suis passionné
                        et pleinement engagé par les métiers du développement et de l'informatique. J'ai déjà
                        eu l'opportunité de mener plusieurs projets complexes, aussi bien dans le cadre de mon
                        cursus qu'à titre personnel : application desktop multi-plateforme, serveur auto-hébergé,
                        outils internes, expérimentations système et réseau.
                    </p>
                    <p>
                        Souhaitant approfondir mes compétences dans les domaines du réseau et de l'infrastructure
                        Cloud, je vais prochainement effectuer un stage au sein de l'entreprise Liriscom afin de
                        confronter mes acquis à un environnement professionnel exigeant.
                    </p>
                    <p>
                        Curieux et rigoureux, je suis porté par l'envie d'apprendre, de tester, d'innover,
                        et de construire des solutions propres, maintenables et durables.
                    </p>
                    <div className="cta-container">
                        <button type="button" className="btn-cta btn-cta--primary">
                            Télécharger mon CV
                        </button>
                        <a href="#contact" className="btn-cta btn-cta--ghost">
                            Me contacter
                        </a>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default WhoIAm;
