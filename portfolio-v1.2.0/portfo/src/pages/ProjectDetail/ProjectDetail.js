import { Link, useParams } from 'react-router-dom';
import projects from '../../data/projects';
import './ProjectDetail.css';

function ProjectDetail() {
    const { slug } = useParams();
    const project = projects.find((p) => p.slug === slug);

    if (!project) {
        return (
            <main className="project-detail">
                <Link to="/" className="project-detail__back">← Retour au portfolio</Link>
                <h1>Projet introuvable</h1>
                <p>Le projet « {slug} » n'existe pas.</p>
            </main>
        );
    }

    return (
        <main className="project-detail">
            <Link to="/#projects" className="project-detail__back">← Retour au portfolio</Link>

            <header className="project-detail__header">
                <h1 className="project-detail__title">{project.title}</h1>
                <p className="project-detail__tagline">{project.tagline}</p>
                <div className="project-detail__stack">
                    {project.stack.map((s, i) => (
                        <span key={i} className="project-detail__stack-item">{s}</span>
                    ))}
                </div>
            </header>

            <div className="project-detail__body">
                {project.sections.map((s, i) => (
                    <section key={i} className="project-detail__section">
                        <h2>{s.heading}</h2>
                        <p>{s.body}</p>
                    </section>
                ))}
            </div>
        </main>
    );
}

export default ProjectDetail;
