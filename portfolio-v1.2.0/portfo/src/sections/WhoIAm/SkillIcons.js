import {
    SiReact,
    SiHtml5,
    SiJavascript,
    SiPython,
    SiLinux,
    SiGooglecloud,
    SiDocker,
    SiWireshark,
} from 'react-icons/si';
import { MdLan, MdSmartToy, MdAssignmentTurnedIn, MdSecurity } from 'react-icons/md';
import './SkillIcons.css';

const skills = [
    { name: 'Réseaux', color: '#4caf50', Icon: MdLan, category: 'Infra' },
    { name: 'Linux', color: '#fcc624', Icon: SiLinux, category: 'System' },
    { name: 'Docker', color: '#2496ed', Icon: SiDocker, category: 'DevOps' },
    { name: 'Cloud', color: '#4fc3f7', Icon: SiGooglecloud, category: 'Infra' },
    { name: 'Sécurité', color: '#f43f5e', Icon: MdSecurity, category: 'Cyber' },
    { name: 'Python', color: '#ffd43b', Icon: SiPython, category: 'Dev' },
    { name: 'React', color: '#61dafb', Icon: SiReact, category: 'Front' },
    { name: 'JS / TS', color: '#f7df1e', Icon: SiJavascript, category: 'Dev' },
    { name: 'AI & LLM', color: '#a729de', Icon: MdSmartToy, category: 'AI' },
    { name: 'Wireshark', color: '#1679a7', Icon: SiWireshark, category: 'Réseau' },
    { name: 'Gestion', color: '#ec4899', Icon: MdAssignmentTurnedIn, category: 'Agile' },
    { name: 'HTML5', color: '#e34f26', Icon: SiHtml5, category: 'Front' },
];

function SkillIcons() {
    return (
        <div className="skill-grid-icons">
            {skills.map(({ name, color, Icon, category }) => (
                <div
                    key={name}
                    className="skill-item"
                    style={{ '--accent-skill': color }}
                    title={`${name} (${category})`}
                >
                    <div className="skill-item__icon-wrap">
                        <Icon className="skill-item__icon" />
                    </div>
                    <span className="skill-item__name">{name}</span>
                    <span className="skill-item__category">{category}</span>
                </div>
            ))}
        </div>
    );
}

export default SkillIcons;
