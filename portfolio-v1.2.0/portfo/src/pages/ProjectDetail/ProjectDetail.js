import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { getProjectBySlug } from '../../data/projects';
import { fetchProjectBySlug } from '../../services/api';
import translations from '../../data/translations';
import './ProjectDetail.css';

function ProjectDetail() {
    const { slug } = useParams();
    const { lang } = useLanguage();
    const t = translations[lang] || translations.en;
    const [project, setProject] = useState(() => getProjectBySlug(slug, lang));

    useEffect(() => {
        let isMounted = true;
        fetchProjectBySlug(slug, lang).then((data) => {
            if (isMounted && data) {
                setProject(data);
            }
        });
        return () => {
            isMounted = false;
        };
    }, [slug, lang]);

    if (!project) {
        return (
            <main className="project-detail">
                <Link to="/" className="project-detail__back">{t.projectDetail.back}</Link>
                <h1>{t.projectDetail.notFoundTitle}</h1>
                <p>{t.projectDetail.notFoundDesc.replace('{slug}', slug)}</p>
            </main>
        );
    }

    return (
        <main className="project-detail">
            <Link to="/#projects" className="project-detail__back">{t.projectDetail.back}</Link>

            <header className="project-detail__header">
                <h1 className="project-detail__title">{project.title}</h1>
                <p className="project-detail__tagline">{project.tagline}</p>
                <div className="project-detail__stack">
                    {(project.stack || []).map((s, i) => (
                        <span key={i} className="project-detail__stack-item">{s}</span>
                    ))}
                </div>
            </header>

            <div className="project-detail__body">
                {(project.sections || []).map((s, i) => (
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
