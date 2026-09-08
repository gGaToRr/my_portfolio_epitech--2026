import { FaGraduationCap, FaBriefcase, FaMapMarkerAlt, FaCalendarAlt, FaTrophy } from 'react-icons/fa';
import { formations, jobExperiences } from '../../data/experiences';
import useInView from '../../hooks/useInView';
import './Experiences.css';

function FormationCard({ xp, index }) {
    const [ref, inView] = useInView({ threshold: 0.2 });

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

function TimelineItem({ job, index }) {
    const [ref, inView] = useInView({ threshold: 0.25 });
    const isAwarded = job.detail && job.detail.toLowerCase().includes('employé du mois');

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
                        <FaTrophy className="trophy-icon" /> 3x Employé du mois
                    </div>
                )}
            </div>
        </li>
    );
}

function Experiences() {
    return (
        <section id="experiences">
            <div className="section-head">
                <span className="section-subtitle">Parcours & Formations</span>
                <h2 className="section-title">My experiences</h2>
            </div>

            {/* 1. Formations & Diplômes */}
            <div className="exp-subsection">
                <div className="subsection-title-row">
                    <FaGraduationCap className="subsection-icon" />
                    <h3 className="subsection-title">Formations & Certifications</h3>
                </div>
                <div className="formations-grid">
                    {formations.map((xp, i) => (
                        <FormationCard key={xp.id} xp={xp} index={i} />
                    ))}
                </div>
            </div>

            {/* 2. Expériences Professionnelles */}
            <div className="exp-subsection">
                <div className="subsection-title-row">
                    <FaBriefcase className="subsection-icon" />
                    <h3 className="subsection-title">Expériences Professionnelles</h3>
                </div>
                <ol className="exp-timeline-list">
                    {jobExperiences.map((job, i) => (
                        <TimelineItem key={job.id} job={job} index={i} />
                    ))}
                </ol>
            </div>
        </section>
    );
}

export default Experiences;
