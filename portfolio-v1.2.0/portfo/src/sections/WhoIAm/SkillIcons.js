import {
    SiReact,
    SiHtml5,
    SiJavascript,
    SiPython,
    SiLinux,
    SiSublimetext,
    SiGooglecloud,
} from 'react-icons/si';
import { MdLan, MdSmartToy, MdAssignmentTurnedIn } from 'react-icons/md';
import './SkillIcons.css';

const skills = [
    { name: 'React', color: '#61dafb', Icon: SiReact },
    { name: 'HTML', color: '#e34f26', Icon: SiHtml5 },
    { name: 'JS', color: '#f7df1e', Icon: SiJavascript },
    { name: 'Python', color: '#ffd43b', Icon: SiPython },
    { name: 'Linux', color: '#fcc624', Icon: SiLinux },
    { name: 'Sublime', color: '#ff9800', Icon: SiSublimetext },
    { name: 'Cloud', color: '#4fc3f7', Icon: SiGooglecloud },
    { name: 'Réseaux', color: '#4caf50', Icon: MdLan },
    { name: 'AI', color: '#a729de', Icon: MdSmartToy },
    { name: 'Gestion', color: '#e91e63', Icon: MdAssignmentTurnedIn },
];

function SkillIcons() {
    return (
        <div className="skill-grid-icons">
            {skills.map(({ name, color, Icon }) => (
                <div key={name} className="skill-item" style={{ '--accent': color }}>
                    <Icon />
                    <span>{name}</span>
                </div>
            ))}
        </div>
    );
}

export default SkillIcons;
