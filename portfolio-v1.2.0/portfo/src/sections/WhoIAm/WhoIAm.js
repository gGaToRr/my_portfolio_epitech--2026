import SkillIcons from './SkillIcons';
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
                        <button type="button" className="btn-cta btn-cta--primary">
                            Télécharger mon CV
                        </button>
                        <button type="button" className="btn-cta btn-cta--ghost">
                            Me contacter
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default WhoIAm;
