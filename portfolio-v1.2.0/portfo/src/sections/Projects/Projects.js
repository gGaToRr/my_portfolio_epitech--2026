import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { getProjects } from '../../data/projects';
import translations from '../../data/translations';
import ScrollReveal from '../../components/ScrollReveal/ScrollReveal';
import './Projects.css';

function Projects() {
    const { lang } = useLanguage();
    const t = translations[lang] || translations.en;
    const projectList = getProjects(lang);

    return (
        <section id="projects">
            <ScrollReveal animation="fade-up">
                <h2>{t.projects.title}</h2>
                <p className="projects-intro">
                    {t.projects.intro}
                </p>
            </ScrollReveal>

            <div className="projects-grid">
                {projectList.map((p, i) => (
                    <ScrollReveal
                        key={p.slug}
                        animation="fade-up"
                        delay={i * 100}
                        as="div"
                    >
                        <Link to={`/projects/${p.slug}`} className="project-card">
                            <h3 className="project-card__title">{p.title}</h3>
                            <p className="project-card__tagline">{p.tagline}</p>
                            <div className="project-card__stack">
                                {p.stack.map((s, idx) => (
                                    <span key={idx} className="project-card__stack-item">{s}</span>
                                ))}
                            </div>
                            <span className="project-card__cta">{t.projects.cta}</span>
                        </Link>
                    </ScrollReveal>
                ))}
            </div>
        </section>
    );
}

export default Projects;
