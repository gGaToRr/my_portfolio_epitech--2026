import { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { getEpitechProjects } from '../../data/epitechProjects';
import { fetchEpitechProjects, trackEvent } from '../../services/api';
import translations from '../../data/translations';
import ScrollReveal from '../../components/ScrollReveal/ScrollReveal';
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
    const t = translations[lang] || translations.en;
    const [projectList, setProjectList] = useState(() => getEpitechProjects(lang));

    useEffect(() => {
        let isMounted = true;
        fetchEpitechProjects(lang).then((data) => {
            if (isMounted && data && data.length > 0) {
                setProjectList(data);
            }
        });
        return () => {
            isMounted = false;
        };
    }, [lang]);

    return (
        <section id="epitech-projects">
            <ScrollReveal animation="fade-up">
                <div className="ep-head">
                    <h2>{t.epitechProjects.title}</h2>
                    <p className="ep-intro">
                        {t.epitechProjects.intro}
                    </p>
                </div>
            </ScrollReveal>

            <div className="ep-grid">
                {projectList.map((p, i) => (
                    <ScrollReveal
                        key={p.id || i}
                        animation="fade-up"
                        delay={i * 80}
                        as="article"
                        className="ep-card"
                    >
                        <div className="ep-card__top">
                            <span className="ep-card__num">
                                {String(i + 1).padStart(2, '0')}
                            </span>
                            {p.category && (
                                <span className="ep-card__category">{p.category}</span>
                            )}
                        </div>

                        <h3 className="ep-card__name">{p.name}</h3>

                        <p className="ep-card__desc">{p.description}</p>

                        {p.tags && p.tags.length > 0 && (
                            <div className="ep-card__techs">
                                {p.tags.map((tTag, j) => (
                                    <span key={j} className="ep-card__tech">{tTag}</span>
                                ))}
                            </div>
                        )}

                        <a
                            href={buildAccessRequestUrl(p.name, t)}
                            className="ep-card__cta"
                            onClick={() => trackEvent('request_epitech_project_access', p.name)}
                        >
                            <span>{t.epitechProjects.cta}</span>
                            <span className="ep-card__cta-arrow">→</span>
                        </a>
                    </ScrollReveal>
                ))}
            </div>
        </section>
    );
}

export default EpitechProjects;
