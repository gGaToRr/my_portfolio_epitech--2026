import { Link } from 'react-router-dom';
import projects from '../../data/projects';
import './Projects.css';

function Projects() {
    return (
        <section id="projects">
            <h2>My projects</h2>
            <p className="projects-intro">
                Quatre projets perso. Clique pour voir le détail.
            </p>
            <div className="projects-grid">
                {projects.map((p) => (
                    <Link to={`/projects/${p.slug}`} key={p.slug} className="project-card">
                        <h3 className="project-card__title">{p.title}</h3>
                        <p className="project-card__tagline">{p.tagline}</p>
                        <div className="project-card__stack">
                            {p.stack.map((s, i) => (
                                <span key={i} className="project-card__stack-item">{s}</span>
                            ))}
                        </div>
                        <span className="project-card__cta">Voir le détail →</span>
                    </Link>
                ))}
            </div>
        </section>
    );
}

export default Projects;
