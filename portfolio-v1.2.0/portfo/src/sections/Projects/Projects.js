import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useEditableContent } from '../../context/EditableContentContext';
import { EditCardTrigger, AddSectionItemButton } from '../../components/EditTrigger/EditCardTrigger';
import MarkdownView from '../../components/MarkdownView/MarkdownView';
import { trackEvent } from '../../services/api';
import ScrollReveal from '../../components/ScrollReveal/ScrollReveal';
import './Projects.css';

function Projects() {
    const { lang } = useLanguage();
    const {
        translations,
        projects,
        cardStyles,
        openEditDrawer,
        createProject,
        deleteProject,
        getFieldColor,
        isEditMode,
    } = useEditableContent();

    const t = translations[lang] || translations.en;
    const projectList = projects[lang] || projects.en || [];
    const projectsFr = projects.fr || [];
    const projectsEn = projects.en || [];

    const handleEditProject = (slug) => {
        const itemFr = projectsFr.find((p) => p.slug === slug) || {};
        const itemEn = projectsEn.find((p) => p.slug === slug) || {};
        const customStyle = cardStyles?.[`proj-${slug}`] || {};

        openEditDrawer({
            cardId: slug,
            sectionId: 'projects',
            sectionLabel: 'Section 05 • Projet Personnel',
            title: `Édition : Projet — ${itemFr.title || ''}`,
            type: 'project',
            colors: customStyle,
            fields: [
                { key: 'title', label: 'Titre du projet', valueFr: itemFr.title, valueEn: itemEn.title, color: getFieldColor(`proj-${slug}`, 'title') },
                { key: 'tagline', label: 'Description courte / Tagline (Markdown)', type: 'textarea', rows: 3, valueFr: itemFr.tagline, valueEn: itemEn.tagline, color: getFieldColor(`proj-${slug}`, 'tagline') },
                { key: 'stack', label: 'Stack technique (Tags)', isArray: true, valueFr: itemFr.stack || [], valueEn: itemEn.stack || [] },
            ],
        });
    };

    const handleAddNewProject = () => {
        const slug = `nouveau-projet-${Date.now()}`;
        createProject(
            {
                slug,
                title: 'Nouveau Projet',
                tagline: 'Description courte du nouveau projet réalisé.',
                stack: ['React', 'Node.js', 'Docker'],
            },
            {
                slug,
                title: 'New Project',
                tagline: 'Short description of the new completed project.',
                stack: ['React', 'Node.js', 'Docker'],
            }
        );
    };

    return (
        <section id="projects">
            <ScrollReveal animation="fade-up">
                <div className="section-head-with-action">
                    <h2>{t.projects.title}</h2>
                    {isEditMode && (
                        <AddSectionItemButton
                            onClick={handleAddNewProject}
                            label="+ Ajouter un projet"
                        />
                    )}
                </div>
                <p className="projects-intro">
                    <MarkdownView text={t.projects.intro} />
                </p>
            </ScrollReveal>

            <div className="projects-grid">
                {projectList.map((p, i) => {
                    const customStyle = cardStyles?.[`proj-${p.slug}`] || {};

                    return (
                        <ScrollReveal
                            key={p.slug || i}
                            animation="fade-up"
                            delay={i * 100}
                            as="div"
                            style={{ position: 'relative' }}
                        >
                            {isEditMode && (
                                <EditCardTrigger
                                    onClick={() => handleEditProject(p.slug)}
                                    onDelete={() => deleteProject(p.slug)}
                                    label="Éditer Projet"
                                    deleteLabel="Supprimer le projet"
                                />
                            )}

                            <Link
                                to={`/projects/${p.slug}`}
                                className="project-card"
                                style={customStyle.accentColor ? { '--accent': customStyle.accentColor } : {}}
                                onClick={() => trackEvent('click_project_card', p.slug, { source_file: 'Projects.js', source_func: 'onClick' })}
                            >
                                <h3
                                    className="project-card__title"
                                    style={{ color: getFieldColor(`proj-${p.slug}`, 'title') || undefined }}
                                >
                                    {p.title}
                                </h3>
                                <p
                                    className="project-card__tagline"
                                    style={{ color: getFieldColor(`proj-${p.slug}`, 'tagline') || undefined }}
                                >
                                    <MarkdownView text={p.tagline} />
                                </p>
                                <div className="project-card__stack">
                                    {(p.stack || []).map((s, idx) => {
                                        const tagColor = getFieldColor(`proj-${p.slug}`, `stack-${idx}`);
                                        return (
                                            <span
                                                key={idx}
                                                className="project-card__stack-item"
                                                style={tagColor ? { color: tagColor, borderColor: tagColor } : {}}
                                            >
                                                {s}
                                            </span>
                                        );
                                    })}
                                </div>
                                <span className="project-card__cta">{t.projects.cta}</span>
                            </Link>
                        </ScrollReveal>
                    );
                })}
            </div>
        </section>
    );
}

export default Projects;
