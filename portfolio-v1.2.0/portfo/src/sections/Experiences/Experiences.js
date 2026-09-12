import { FaGraduationCap, FaBriefcase, FaMapMarkerAlt, FaCalendarAlt, FaTrophy } from 'react-icons/fa';
import { useLanguage } from '../../context/LanguageContext';
import { useEditableContent } from '../../context/EditableContentContext';
import { EditCardTrigger, AddSectionItemButton } from '../../components/EditTrigger/EditCardTrigger';
import MarkdownView from '../../components/MarkdownView/MarkdownView';
import useInView from '../../hooks/useInView';
import ScrollReveal from '../../components/ScrollReveal/ScrollReveal';
import './Experiences.css';

function FormationCard({ xp, index, isEditMode, onEdit, onDelete, getFieldColor, customStyle = {} }) {
    const [ref, inView] = useInView({ threshold: 0.15 });

    return (
        <article
            ref={ref}
            className={`exp-formation-card ${inView ? 'is-visible' : ''}`}
            style={{
                '--delay': `${index * 120}ms`,
                ...(customStyle.accentColor ? { '--accent': customStyle.accentColor } : {}),
            }}
        >
            {isEditMode && (
                <EditCardTrigger
                    onClick={onEdit}
                    onDelete={onDelete}
                    label="Éditer Formation"
                    deleteLabel="Supprimer la formation"
                />
            )}

            <div className="formation-card__header">
                <div
                    className="formation-icon-wrap"
                    style={customStyle.accentColor ? { color: customStyle.accentColor, borderColor: customStyle.accentColor } : {}}
                >
                    <FaGraduationCap className="formation-icon" />
                </div>
                <div className="formation-school-meta">
                    <span
                        className="formation-company"
                        style={{ color: getFieldColor(`formation-${xp.id}`, 'company') || undefined }}
                    >
                        {xp.company}
                    </span>
                    <h4
                        className="formation-title"
                        style={{ color: getFieldColor(`formation-${xp.id}`, 'title') || undefined }}
                    >
                        {xp.title}
                    </h4>
                </div>
            </div>

            <p
                className="formation-summary"
                style={{ color: getFieldColor(`formation-${xp.id}`, 'summary') || undefined }}
            >
                <MarkdownView text={xp.summary} />
            </p>

            <div className="formation-tags">
                {(xp.tags || []).map((tag, tagIdx) => {
                    const tagColor = getFieldColor(`formation-${xp.id}`, `tags-${tagIdx}`);
                    return (
                        <span
                            key={tagIdx}
                            className="formation-tag"
                            style={tagColor ? { color: tagColor, borderColor: tagColor } : {}}
                        >
                            {tag}
                        </span>
                    );
                })}
            </div>
        </article>
    );
}

function TimelineItem({ job, index, awardedLabel, isEditMode, onEdit, onDelete, getFieldColor, customStyle = {} }) {
    const [ref, inView] = useInView({ threshold: 0.18 });
    const isAwarded = job.detail && (job.detail.toLowerCase().includes('employé du mois') || job.detail.toLowerCase().includes('employee of the month'));

    return (
        <li
            ref={ref}
            className={`timeline-item ${inView ? 'is-visible' : ''}`}
            style={{ '--delay': `${index * 90}ms` }}
        >
            <div className="timeline-node">
                <div
                    className="timeline-dot"
                    style={customStyle.accentColor ? { background: customStyle.accentColor, boxShadow: `0 0 10px ${customStyle.accentColor}` } : {}}
                />
            </div>

            <div
                className="timeline-card"
                style={customStyle.accentColor ? { borderColor: customStyle.accentColor } : {}}
            >
                {isEditMode && (
                    <EditCardTrigger
                        onClick={onEdit}
                        onDelete={onDelete}
                        label="Éditer Poste"
                        deleteLabel="Supprimer le poste"
                    />
                )}

                <div className="timeline-header">
                    <div className="timeline-meta-row">
                        <span
                            className="timeline-period"
                            style={{ color: getFieldColor(`job-${job.id}`, 'period') || undefined }}
                        >
                            <FaCalendarAlt className="timeline-meta-icon" /> {job.period}
                        </span>
                        <span
                            className="timeline-contract-badge"
                            style={{ color: getFieldColor(`job-${job.id}`, 'contract') || undefined }}
                        >
                            {job.contract}
                        </span>
                    </div>
                    <h4
                        className="timeline-role"
                        style={{ color: getFieldColor(`job-${job.id}`, 'role') || undefined }}
                    >
                        {job.role}
                    </h4>
                    <div className="timeline-company-row">
                        <span
                            className="timeline-company"
                            style={{ color: getFieldColor(`job-${job.id}`, 'company') || undefined }}
                        >
                            {job.company}
                        </span>
                        <span
                            className="timeline-location"
                            style={{ color: getFieldColor(`job-${job.id}`, 'place') || undefined }}
                        >
                            <FaMapMarkerAlt /> {job.place}
                        </span>
                    </div>
                </div>

                <p
                    className="timeline-detail"
                    style={{ color: getFieldColor(`job-${job.id}`, 'detail') || undefined }}
                >
                    <MarkdownView text={job.detail} />
                </p>

                {isAwarded && (
                    <div className="timeline-highlight-badge">
                        <FaTrophy className="trophy-icon" /> {awardedLabel}
                    </div>
                )}
            </div>
        </li>
    );
}

function Experiences() {
    const { lang } = useLanguage();
    const {
        translations,
        formations,
        jobs,
        cardStyles,
        openEditDrawer,
        createFormation,
        deleteFormation,
        createJob,
        deleteJob,
        getFieldColor,
        isEditMode,
    } = useEditableContent();

    const t = translations[lang] || translations.en;
    const formationsList = formations[lang] || formations.en || [];
    const formationsFr = formations.fr || [];
    const formationsEn = formations.en || [];

    const jobsList = jobs[lang] || jobs.en || [];
    const jobsFr = jobs.fr || [];
    const jobsEn = jobs.en || [];

    const handleEditFormation = (fId) => {
        const itemFr = formationsFr.find((f) => String(f.id) === String(fId)) || {};
        const itemEn = formationsEn.find((f) => String(f.id) === String(fId)) || {};
        const customStyle = cardStyles?.[`formation-${fId}`] || {};

        openEditDrawer({
            cardId: fId,
            sectionId: 'experiences',
            sectionLabel: 'Section 04 • Formation / Diplôme',
            title: `Édition : Formation — ${itemFr.title || ''}`,
            type: 'formation',
            colors: customStyle,
            fields: [
                { key: 'title', label: 'Titre de la formation', valueFr: itemFr.title, valueEn: itemEn.title, color: getFieldColor(`formation-${fId}`, 'title') },
                { key: 'company', label: 'Établissement / École', valueFr: itemFr.company, valueEn: itemEn.company, color: getFieldColor(`formation-${fId}`, 'company') },
                { key: 'summary', label: 'Résumé & Acquis (Markdown)', type: 'textarea', rows: 3, valueFr: itemFr.summary, valueEn: itemEn.summary, color: getFieldColor(`formation-${fId}`, 'summary') },
                { key: 'tags', label: 'Tags / Compétences', isArray: true, valueFr: itemFr.tags || [], valueEn: itemEn.tags || [] },
            ],
        });
    };

    const handleAddNewFormation = () => {
        createFormation(
            {
                company: 'Nouvel Établissement',
                title: 'Nouvelle Formation / Diplôme',
                summary: 'Description des cours et technologies abordées.',
                tags: ['Compétence 1', 'Compétence 2'],
            },
            {
                company: 'New School / Institution',
                title: 'New Degree / Program',
                summary: 'Overview of courses and technical learning.',
                tags: ['Skill 1', 'Skill 2'],
            }
        );
    };

    const handleEditJob = (jId) => {
        const itemFr = jobsFr.find((j) => String(j.id) === String(jId)) || {};
        const itemEn = jobsEn.find((j) => String(j.id) === String(jId)) || {};
        const customStyle = cardStyles?.[`job-${jId}`] || {};

        openEditDrawer({
            cardId: jId,
            sectionId: 'experiences',
            sectionLabel: 'Section 04 • Expérience Professionnelle',
            title: `Édition : Poste — ${itemFr.role || ''}`,
            type: 'job',
            colors: customStyle,
            fields: [
                { key: 'role', label: 'Poste / Rôle', valueFr: itemFr.role, valueEn: itemEn.role, color: getFieldColor(`job-${jId}`, 'role') },
                { key: 'company', label: 'Entreprise / Structure', valueFr: itemFr.company, valueEn: itemEn.company, color: getFieldColor(`job-${jId}`, 'company') },
                { key: 'place', label: 'Lieu / Ville', valueFr: itemFr.place, valueEn: itemEn.place, color: getFieldColor(`job-${jId}`, 'place') },
                { key: 'period', label: 'Période / Dates', valueFr: itemFr.period, valueEn: itemEn.period, color: getFieldColor(`job-${jId}`, 'period') },
                { key: 'contract', label: 'Type de contrat (Stage / CDI…)', valueFr: itemFr.contract, valueEn: itemEn.contract, color: getFieldColor(`job-${jId}`, 'contract') },
                { key: 'detail', label: 'Missions & Réalisations (Markdown)', type: 'textarea', rows: 3, valueFr: itemFr.detail, valueEn: itemEn.detail, color: getFieldColor(`job-${jId}`, 'detail') },
            ],
        });
    };

    const handleAddNewJob = () => {
        createJob(
            {
                role: 'Nouveau Poste',
                company: 'Nouvelle Entreprise',
                place: 'Marseille, FR',
                period: '2026',
                contract: 'Stage',
                detail: 'Description détaillée des missions accomplies.',
            },
            {
                role: 'New Position',
                company: 'New Company',
                place: 'Marseille, FR',
                period: '2026',
                contract: 'Internship',
                detail: 'Detailed description of achievements and tasks.',
            }
        );
    };

    return (
        <section id="experiences">
            <ScrollReveal animation="fade-up">
                <div className="section-head">
                    <span className="section-subtitle">{t.experiences.subtitle}</span>
                    <h2 className="section-title">{t.experiences.title}</h2>
                </div>
            </ScrollReveal>

            {/* 1. Formations */}
            <div className="exp-subsection">
                <ScrollReveal animation="fade-up" delay={50}>
                    <div className="subsection-title-row">
                        <FaGraduationCap className="subsection-icon" />
                        <h3 className="subsection-title">{t.experiences.sectionFormations}</h3>
                        {isEditMode && (
                            <AddSectionItemButton
                                onClick={handleAddNewFormation}
                                label="+ Ajouter une formation"
                            />
                        )}
                    </div>
                </ScrollReveal>
                <div className="formations-grid">
                    {formationsList.map((xp, i) => (
                        <FormationCard
                            key={xp.id}
                            xp={xp}
                            index={i}
                            isEditMode={isEditMode}
                            onEdit={() => handleEditFormation(xp.id)}
                            onDelete={() => deleteFormation(xp.id)}
                            getFieldColor={getFieldColor}
                            customStyle={cardStyles?.[`formation-${xp.id}`]}
                        />
                    ))}
                </div>
            </div>

            {/* 2. Expériences */}
            <div className="exp-subsection">
                <ScrollReveal animation="fade-up" delay={50}>
                    <div className="subsection-title-row">
                        <FaBriefcase className="subsection-icon" />
                        <h3 className="subsection-title">{t.experiences.sectionJobs}</h3>
                        {isEditMode && (
                            <AddSectionItemButton
                                onClick={handleAddNewJob}
                                label="+ Ajouter un poste / expérience"
                            />
                        )}
                    </div>
                </ScrollReveal>
                <ol className="exp-timeline-list">
                    {jobsList.map((job, i) => (
                        <TimelineItem
                            key={job.id}
                            job={job}
                            index={i}
                            awardedLabel={t.experiences.awardedBadge}
                            isEditMode={isEditMode}
                            onEdit={() => handleEditJob(job.id)}
                            onDelete={() => deleteJob(job.id)}
                            getFieldColor={getFieldColor}
                            customStyle={cardStyles?.[`job-${job.id}`]}
                        />
                    ))}
                </ol>
            </div>
        </section>
    );
}

export default Experiences;
