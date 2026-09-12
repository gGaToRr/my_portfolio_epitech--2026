import { useLanguage } from '../../context/LanguageContext';
import { useEditableContent } from '../../context/EditableContentContext';
import { EditCardTrigger, AddSectionItemButton } from '../../components/EditTrigger/EditCardTrigger';
import MarkdownView from '../../components/MarkdownView/MarkdownView';
import { trackEvent } from '../../services/api';
import ScrollReveal from '../../components/ScrollReveal/ScrollReveal';
import { isSafeUrl } from '../../utils/urlSafety';
import './EpitechProjects.css';

const CONTACT_EMAIL = 'pierre.untersinger2@gmail.com';

function buildAccessRequestUrl(projectName, t) {
    const subject = encodeURIComponent(`${t.epitechProjects.mailSubject}${projectName}`);
    const body = encodeURIComponent(
        `${t.epitechProjects.mailBodyGreeting}\n\n${t.epitechProjects.mailBodyContent} « ${projectName} ».\n\n${t.epitechProjects.mailBodyGithub} \n\n${t.epitechProjects.mailBodyThanks}`
    );
    return `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
}

function EpitechProjects() {
    const { lang } = useLanguage();
    const {
        translations,
        epitechProjects,
        cardStyles,
        openEditDrawer,
        createEpitechProject,
        deleteEpitechProject,
        getFieldColor,
        isEditMode,
    } = useEditableContent();

    const t = translations[lang] || translations.en;
    const projectList = epitechProjects[lang] || epitechProjects.en || [];
    const projectsFr = epitechProjects.fr || [];
    const projectsEn = epitechProjects.en || [];

    const handleEditEpitechProject = (name) => {
        const itemFr = projectsFr.find((p) => p.name === name) || {};
        const itemEn = projectsEn.find((p) => p.name === name) || {};
        const customStyle = cardStyles?.[`ep-${name}`] || {};

        openEditDrawer({
            cardId: name,
            sectionId: 'epitech-projects',
            sectionLabel: 'Section 06 • Projet Epitech',
            title: `Édition : ${itemFr.name || ''}`,
            type: 'epitechProject',
            colors: customStyle,
            fields: [
                { key: 'name', label: 'Nom du projet', valueFr: itemFr.name, valueEn: itemEn.name, color: getFieldColor(`ep-${name}`, 'name') },
                { key: 'category', label: 'Catégorie (Web, IA, Data, Cyber…)', valueFr: itemFr.category, valueEn: itemEn.category, color: getFieldColor(`ep-${name}`, 'category') },
                { key: 'description', label: 'Description (Markdown)', type: 'textarea', rows: 3, valueFr: itemFr.description, valueEn: itemEn.description, color: getFieldColor(`ep-${name}`, 'description') },
                { key: 'tags', label: 'Technologies & Tags', isArray: true, valueFr: itemFr.tags || [], valueEn: itemEn.tags || [] },
                { key: 'repoUrl', label: 'Lien GitHub / Repo', type: 'url', valueFr: itemFr.repoUrl, valueEn: itemEn.repoUrl },
            ],
        });
    };

    const handleAddNewEpitechProject = () => {
        const name = `Epitech-Module-${Date.now().toString().slice(-4)}`;
        createEpitechProject(
            {
                name,
                category: 'C / Système',
                description: 'Projet académique réalisé dans le cadre du cursus Epitech.',
                tags: ['C', 'Unix', 'Makefile'],
                repoUrl: '',
            },
            {
                name,
                category: 'C / Systems',
                description: 'Academic project completed as part of the Epitech curriculum.',
                tags: ['C', 'Unix', 'Makefile'],
                repoUrl: '',
            }
        );
    };

    return (
        <section id="epitech-projects">
            <ScrollReveal animation="fade-up">
                <div className="ep-head">
                    <div className="section-head-with-action">
                        <h2>{t.epitechProjects.title}</h2>
                        {isEditMode && (
                            <AddSectionItemButton
                                onClick={handleAddNewEpitechProject}
                                label="+ Ajouter un projet Epitech"
                            />
                        )}
                    </div>
                    <p className="ep-intro">
                        <MarkdownView text={t.epitechProjects.intro} />
                    </p>
                </div>
            </ScrollReveal>

            <div className="ep-grid">
                {projectList.map((p, i) => {
                    const customStyle = cardStyles?.[`ep-${p.name}`] || {};
                    // repoUrl est un champ texte libre édité via le drawer : sans ce
                    // contrôle, un lien "javascript:" saisi là s'exécuterait au clic
                    // pour tout visiteur de la section, comme pour les réseaux sociaux.
                    const hasRepoUrl = Boolean(p.repoUrl && isSafeUrl(p.repoUrl));

                    return (
                        <ScrollReveal
                            key={p.id || p.name || i}
                            animation="fade-up"
                            delay={i * 80}
                            as="article"
                            className="ep-card"
                            style={{
                                position: 'relative',
                                ...(customStyle.accentColor ? { '--accent': customStyle.accentColor } : {}),
                            }}
                        >
                            {isEditMode && (
                                <EditCardTrigger
                                    onClick={() => handleEditEpitechProject(p.name)}
                                    onDelete={() => deleteEpitechProject(p.name)}
                                    label="Éditer"
                                    deleteLabel="Supprimer le projet"
                                />
                            )}

                            <div className="ep-card__top">
                                <span
                                    className="ep-card__num"
                                    style={customStyle.accentColor ? { color: customStyle.accentColor } : {}}
                                >
                                    {String(i + 1).padStart(2, '0')}
                                </span>
                                {p.category && (
                                    <span
                                        className="ep-card__category"
                                        style={{ color: getFieldColor(`ep-${p.name}`, 'category') || undefined }}
                                    >
                                        {p.category}
                                    </span>
                                )}
                            </div>

                            <h3
                                className="ep-card__name"
                                style={{ color: getFieldColor(`ep-${p.name}`, 'name') || undefined }}
                            >
                                {p.name}
                            </h3>

                            <p
                                className="ep-card__desc"
                                style={{ color: getFieldColor(`ep-${p.name}`, 'description') || undefined }}
                            >
                                <MarkdownView text={p.description} />
                            </p>

                            {p.tags && p.tags.length > 0 && (
                                <div className="ep-card__techs">
                                    {p.tags.map((tTag, j) => {
                                        const tagColor = getFieldColor(`ep-${p.name}`, `tags-${j}`);
                                        return (
                                            <span
                                                key={j}
                                                className="ep-card__tech"
                                                style={tagColor ? { color: tagColor, borderColor: tagColor } : {}}
                                            >
                                                {tTag}
                                            </span>
                                        );
                                    })}
                                </div>
                            )}

                            <a
                                href={hasRepoUrl ? p.repoUrl : buildAccessRequestUrl(p.name, t)}
                                className="ep-card__cta"
                                target={hasRepoUrl ? '_blank' : undefined}
                                rel={hasRepoUrl ? 'noopener noreferrer' : undefined}
                                onClick={() => trackEvent('request_epitech_project_access', p.name, { source_file: 'EpitechProjects.js', source_func: 'onClick' })}
                            >
                                <span>{t.epitechProjects.cta}</span>
                                <span className="ep-card__cta-arrow">→</span>
                            </a>
                        </ScrollReveal>
                    );
                })}
            </div>
        </section>
    );
}

export default EpitechProjects;
