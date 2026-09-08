import { FaGraduationCap, FaBriefcase, FaMapMarkerAlt, FaCalendarAlt, FaTrophy } from 'react-icons/fa';
import { useLanguage } from '../../context/LanguageContext';
import { getFormations, getJobExperiences } from '../../data/experiences';
import translations from '../../data/translations';
import useInView from '../../hooks/useInView';
import ScrollReveal from '../../components/ScrollReveal/ScrollReveal';
import './Experiences.css';

function FormationCard({ xp, index }) {
    const [ref, inView] = useInView({ threshold: 0.15 });

    return (
        <article
            ref={ref}
            className={`exp-formation-card ${inView ? 'is-visible' : ''}`}
            style={{ '--delay': `${index * 120}ms` }}
        >
            <div className="formation-card__header">
                <div className="formation-icon-wrap">
                    <FaGraduationCap className="formation-icon" />
                </div>
                <div className="formation-school-meta">
                    <span className="formation-company">{xp.company}</span>
                    <h4 className="formation-title">{xp.title}</h4>
                </div>
            </div>

            <p className="formation-summary">{xp.summary}</p>

            <div className="formation-tags">
                {xp.tags.map((tag) => (
                    <span key={tag} className="formation-tag">
                        {tag}
                    </span>
                ))}
            </div>
        </article>
    );
}

function TimelineItem({ job, index, awardedLabel }) {
    const [ref, inView] = useInView({ threshold: 0.18 });
    const isAwarded = job.detail && (job.detail.toLowerCase().includes('employé du mois') || job.detail.toLowerCase().includes('employee of the month'));

    return (
        <li
            ref={ref}
            className={`timeline-item ${inView ? 'is-visible' : ''}`}
            style={{ '--delay': `${index * 90}ms` }}
        >
            <div className="timeline-node">
                <div className="timeline-dot" />
            </div>

            <div className="timeline-card">
                <div className="timeline-header">
                    <div className="timeline-meta-row">
                        <span className="timeline-period">
                            <FaCalendarAlt className="timeline-meta-icon" /> {job.period}
                        </span>
                        <span className="timeline-contract-badge">{job.contract}</span>
                    </div>
                    <h4 className="timeline-role">{job.role}</h4>
                    <div className="timeline-company-row">
                        <span className="timeline-company">{job.company}</span>
                        <span className="timeline-location">
                            <FaMapMarkerAlt /> {job.place}
                        </span>
                    </div>
                </div>

                <p className="timeline-detail">{job.detail}</p>

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
    const t = translations[lang] || translations.en;
    const formationsList = getFormations(lang);
    const jobsList = getJobExperiences(lang);

    return (
        <section id="experiences">
            <ScrollReveal animation="fade-up">
                <div className="section-head">
                    <span className="section-subtitle">{t.experiences.subtitle}</span>
                    <h2 className="section-title">{t.experiences.title}</h2>
                </div>
            </ScrollReveal>

            {/* 1. Formations & Diplômes */}
            <div className="exp-subsection">
                <ScrollReveal animation="fade-up" delay={50}>
                    <div className="subsection-title-row">
                        <FaGraduationCap className="subsection-icon" />
                        <h3 className="subsection-title">{t.experiences.sectionFormations}</h3>
                    </div>
                </ScrollReveal>
                <div className="formations-grid">
                    {formationsList.map((xp, i) => (
                        <FormationCard key={xp.id} xp={xp} index={i} />
                    ))}
                </div>
            </div>

            {/* 2. Expériences Professionnelles */}
            <div className="exp-subsection">
                <ScrollReveal animation="fade-up" delay={50}>
                    <div className="subsection-title-row">
                        <FaBriefcase className="subsection-icon" />
                        <h3 className="subsection-title">{t.experiences.sectionJobs}</h3>
                    </div>
                </ScrollReveal>
                <ol className="exp-timeline-list">
                    {jobsList.map((job, i) => (
                        <TimelineItem
                            key={job.id}
                            job={job}
                            index={i}
                            awardedLabel={t.experiences.awardedBadge}
                        />
                    ))}
                </ol>
            </div>
        </section>
    );
}

export default Experiences;
