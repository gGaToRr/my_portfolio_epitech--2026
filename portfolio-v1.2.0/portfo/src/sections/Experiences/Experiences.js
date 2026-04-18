import { formations, jobExperiences } from '../../data/experiences';
import useInView from '../../hooks/useInView';
import './Experiences.css';

function RevealCard({ xp, index }) {
    const [ref, inView] = useInView({ threshold: 0.25 });
    return (
        <article
            ref={ref}
            className={`exp-card${inView ? ' is-visible' : ''}`}
            style={{ '--delay': `${index * 120}ms` }}
        >
            <div className="exp-card__head">
                <span className="exp-card__company">{xp.company}</span>
            </div>
            <h4 className="exp-card__title">{xp.title}</h4>
            <p className="exp-card__summary">{xp.summary}</p>
            <ul className="exp-card__tags">
                {xp.tags.map((tag) => (
                    <li key={tag}>{tag}</li>
                ))}
            </ul>
        </article>
    );
}

function RevealTimelineItem({ job, index }) {
    const [ref, inView] = useInView({ threshold: 0.3 });
    return (
        <li
            ref={ref}
            className={`exp-timeline__item${inView ? ' is-visible' : ''}`}
            style={{ '--delay': `${index * 100}ms` }}
        >
            <div className="exp-timeline__dot" aria-hidden="true" />
            <div className="exp-timeline__content">
                <div className="exp-timeline__meta">
                    <span className="exp-timeline__period">{job.period}</span>
                    <span className="exp-timeline__contract">{job.contract}</span>
                </div>
                <h4 className="exp-timeline__role">{job.role}</h4>
                <p className="exp-timeline__company">
                    {job.company} — <span>{job.place}</span>
                </p>
                <p className="exp-timeline__detail">{job.detail}</p>
            </div>
        </li>
    );
}

function Experiences() {
    return (
        <section id="experiences">
            <h2>My experiences</h2>

            <div className="exp-block">
                <h3 className="exp-block__title">Formations</h3>
                <div className="exp-grid">
                    {formations.map((xp, i) => (
                        <RevealCard key={xp.id} xp={xp} index={i} />
                    ))}
                </div>
            </div>

            <div className="exp-block">
                <h3 className="exp-block__title">Expériences professionnelles</h3>
                <ol className="exp-timeline">
                    {jobExperiences.map((job, i) => (
                        <RevealTimelineItem key={job.id} job={job} index={i} />
                    ))}
                </ol>
            </div>
        </section>
    );
}

export default Experiences;
