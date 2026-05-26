import epitechProjects from '../../data/epitechProjects';
import './EpitechProjects.css';

const CONTACT_EMAIL = 'pierre.untersinger2@gmail.com';

function buildAccessRequestUrl(projectName) {
    const subject = encodeURIComponent(`Demande d'accès au repo Epitech — ${projectName}`);
    const body = encodeURIComponent(
        `Bonjour Pierre,\n\nJe souhaiterais consulter le code du projet « ${projectName} ».\n\nMon profil GitHub : \n\nMerci !`
    );
    return `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
}

function EpitechProjects() {
    return (
        <section id="epitech-projects">
            <div className="ep-head">
                <h2>Projets Epitech</h2>
                <p className="ep-intro">
                    Les projets réalisés à Epitech sont soumis à la politique anti-plagiat de l'école :
                    le code ne peut pas être public. Pour un recruteur ou un curieux,
                    je donne l'accès en lecture sur demande.
                </p>
            </div>

            <div className="ep-grid">
                {epitechProjects.map((p, i) => (
                    <article key={i} className="ep-card">
                        <div className="ep-card__top">
                            <span className="ep-card__num">
                                {String(i + 1).padStart(2, '0')}
                            </span>
                            {p.category && (
                                <span className="ep-card__category">{p.category}</span>
                            )}
                        </div>

                        <h3 className="ep-card__name">{p.name}</h3>

                        <p className="ep-card__desc">{p.description}</p>

                        {p.tags && p.tags.length > 0 && (
                            <div className="ep-card__techs">
                                {p.tags.map((t, j) => (
                                    <span key={j} className="ep-card__tech">{t}</span>
                                ))}
                            </div>
                        )}

                        <a
                            href={buildAccessRequestUrl(p.name)}
                            className="ep-card__cta"
                        >
                            <span>Demander l'accès</span>
                            <span className="ep-card__cta-arrow">→</span>
                        </a>
                    </article>
                ))}
            </div>
        </section>
    );
}

export default EpitechProjects;
