import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { getProjects } from '../../data/projects';
import translations from '../../data/translations';
import './Projects.css';

function Projects() {
    const { lang } = useLanguage();
    const t = translations[lang] || translations.en;
    const projectList = getProjects(lang);

    return (
        <section id="projects">
            <h2>{t.projects.title}</h2>
            <p className="projects-intro">
                {t.projects.intro}
            </p>
            <div className="projects-grid">
                {projectList.map((p) => (
                    <Link to={`/projects/${p.slug}`} key={p.slug} className="project-card">
                        <h3 className="project-card__title">{p.title}</h3>
                        <p className="project-card__tagline">{p.tagline}</p>
                        <div className="project-card__stack">
                            {p.stack.map((s, i) => (
                                <span key={i} className="project-card__stack-item">{s}</span>
                            ))}
                        </div>
                        <span className="project-card__cta">{t.projects.cta}</span>
                    </Link>
                ))}
            </div>
        </section>
    );
}

export default Projects;
