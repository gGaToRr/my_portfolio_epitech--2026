import React from 'react';
import {
    SiReact,
    SiPython,
    SiJavascript,
    SiTypescript,
    SiHtml5,
    SiC,
    SiCplusplus,
    SiRust,
    SiGo,
    SiPhp,
    SiLinux,
    SiDocker,
    SiKubernetes,
    SiGooglecloud,
    SiTerraform,
    SiAnsible,
    SiNginx,
    SiWireshark,
    SiGit,
    SiMongodb,
    SiPostgresql,
    SiMysql,
    SiSqlite,
    SiRedis,
} from 'react-icons/si';
import {
    FaGithub,
    FaLinkedin,
    FaYoutube,
    FaTwitter,
    FaDiscord,
    FaEnvelope,
    FaGlobe,
    FaInstagram,
    FaTwitch,
    FaServer,
    FaTerminal,
    FaDatabase,
    FaNetworkWired,
    FaBrain,
    FaTasks,
    FaShieldAlt,
    FaCloud,
    FaGraduationCap,
    FaBriefcase,
    FaTrophy,
    FaCode,
    FaLock,
    FaKey,
    FaCubes,
    FaFileCode,
    FaCss3Alt,
    FaAws,
} from 'react-icons/fa';
import {
    MdLan,
    MdSmartToy,
    MdAssignmentTurnedIn,
    MdSecurity,
    MdCloudQueue,
    MdMemory,
    MdDeveloperMode,
} from 'react-icons/md';

// Custom Epitech Logo SVG Component
export function EpitechLogo({ size = 20, className = '', style = {} }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
            style={style}
            aria-hidden="true"
        >
            <rect width="100" height="100" rx="20" fill="currentColor" fillOpacity="0.15" />
            <path
                d="M26 26H76V38H40V46H70V58H40V66H76V78H26V26Z"
                fill="currentColor"
            />
        </svg>
    );
}

export const ICON_MAP = {
    // Languages & Frontend
    react: SiReact,
    python: SiPython,
    javascript: SiJavascript,
    typescript: SiTypescript,
    html5: SiHtml5,
    css3: FaCss3Alt,
    c: SiC,
    cpp: SiCplusplus,
    rust: SiRust,
    go: SiGo,
    php: SiPhp,

    // Infra & Systems
    linux: SiLinux,
    docker: SiDocker,
    kubernetes: SiKubernetes,
    googlecloud: SiGooglecloud,
    aws: FaAws,
    terraform: SiTerraform,
    ansible: SiAnsible,
    nginx: SiNginx,
    wireshark: SiWireshark,
    git: SiGit,
    database: FaDatabase,
    mongodb: SiMongodb,
    postgresql: SiPostgresql,
    mysql: SiMysql,
    sqlite: SiSqlite,
    redis: SiRedis,

    // Domains & Capabilities
    network: MdLan,
    network_wired: FaNetworkWired,
    cloud: FaCloud,
    cloud_queue: MdCloudQueue,
    security: MdSecurity,
    shield: FaShieldAlt,
    ai: MdSmartToy,
    brain: FaBrain,
    project: MdAssignmentTurnedIn,
    tasks: FaTasks,
    server: FaServer,
    terminal: FaTerminal,
    code: FaCode,
    memory: MdMemory,
    cubes: FaCubes,
    devmode: MdDeveloperMode,
    filecode: FaFileCode,
    trophy: FaTrophy,
    graduation: FaGraduationCap,
    briefcase: FaBriefcase,
    lock: FaLock,
    key: FaKey,

    // Socials & Links
    github: FaGithub,
    linkedin: FaLinkedin,
    youtube: FaYoutube,
    epitech: EpitechLogo,
    twitter: FaTwitter,
    discord: FaDiscord,
    mail: FaEnvelope,
    globe: FaGlobe,
    instagram: FaInstagram,
    twitch: FaTwitch,
};

export const AVAILABLE_SKILL_ICONS = [
    { key: 'network', label: 'Réseaux (MdLan)', category: 'Infra', defaultColor: '#4caf50' },
    { key: 'linux', label: 'Linux (Tux)', category: 'System', defaultColor: '#fcc624' },
    { key: 'docker', label: 'Docker', category: 'DevOps', defaultColor: '#2496ed' },
    { key: 'googlecloud', label: 'Google Cloud', category: 'Cloud', defaultColor: '#4fc3f7' },
    { key: 'aws', label: 'AWS Cloud', category: 'Cloud', defaultColor: '#ff9900' },
    { key: 'kubernetes', label: 'Kubernetes', category: 'DevOps', defaultColor: '#326ce5' },
    { key: 'security', label: 'Cybersécurité (Shield)', category: 'Cyber', defaultColor: '#f43f5e' },
    { key: 'wireshark', label: 'Wireshark', category: 'Réseau', defaultColor: '#1679a7' },
    { key: 'python', label: 'Python', category: 'Dev', defaultColor: '#ffd43b' },
    { key: 'react', label: 'React', category: 'Front', defaultColor: '#61dafb' },
    { key: 'javascript', label: 'JavaScript / TS', category: 'Dev', defaultColor: '#f7df1e' },
    { key: 'typescript', label: 'TypeScript', category: 'Dev', defaultColor: '#3178c6' },
    { key: 'c', label: 'Langage C', category: 'System', defaultColor: '#a8b9cc' },
    { key: 'cpp', label: 'C++', category: 'System', defaultColor: '#00599c' },
    { key: 'rust', label: 'Rust', category: 'System', defaultColor: '#dea584' },
    { key: 'go', label: 'Go (Golang)', category: 'Dev', defaultColor: '#00add8' },
    { key: 'ai', label: 'IA & LLM (Robot)', category: 'AI', defaultColor: '#a729de' },
    { key: 'brain', label: 'Brain / Intelligence', category: 'AI', defaultColor: '#ec4899' },
    { key: 'database', label: 'Base de données', category: 'Data', defaultColor: '#00e5ff' },
    { key: 'postgresql', label: 'PostgreSQL', category: 'Data', defaultColor: '#336791' },
    { key: 'sqlite', label: 'SQLite', category: 'Data', defaultColor: '#003b57' },
    { key: 'redis', label: 'Redis', category: 'Data', defaultColor: '#dc382d' },
    { key: 'terraform', label: 'Terraform (IaC)', category: 'Infra', defaultColor: '#844fba' },
    { key: 'ansible', label: 'Ansible', category: 'DevOps', defaultColor: '#ee0000' },
    { key: 'nginx', label: 'Nginx Reverse Proxy', category: 'Infra', defaultColor: '#009639' },
    { key: 'terminal', label: 'Terminal / Bash', category: 'System', defaultColor: '#4ade80' },
    { key: 'server', label: 'Serveur Dédié', category: 'Infra', defaultColor: '#38bdf8' },
    { key: 'git', label: 'Git & Versioning', category: 'Tools', defaultColor: '#f05032' },
    { key: 'project', label: 'Gestion & Agilité', category: 'Agile', defaultColor: '#ec4899' },
    { key: 'html5', label: 'HTML5 & Sémantique', category: 'Front', defaultColor: '#e34f26' },
    { key: 'css3', label: 'CSS3 Moderne', category: 'Front', defaultColor: '#264de4' },
];

export const AVAILABLE_SOCIAL_ICONS = [
    { key: 'github', label: 'GitHub', defaultColor: '#f0f6fc' },
    { key: 'linkedin', label: 'LinkedIn', defaultColor: '#0a66c2' },
    { key: 'youtube', label: 'YouTube', defaultColor: '#ff0000' },
    { key: 'epitech', label: 'Epitech', defaultColor: '#0055ff' },
    { key: 'twitter', label: 'Twitter / X', defaultColor: '#1da1f2' },
    { key: 'discord', label: 'Discord', defaultColor: '#5865f2' },
    { key: 'mail', label: 'Email / Contact', defaultColor: '#38bdf8' },
    { key: 'globe', label: 'Site Web / Portfolio', defaultColor: '#10b981' },
    { key: 'instagram', label: 'Instagram', defaultColor: '#e1306c' },
    { key: 'twitch', label: 'Twitch', defaultColor: '#9146ff' },
];

export const AVAILABLE_OBJECTIVE_ICONS = [
    { key: 'network', label: 'Réseaux & Protocoles (MdLan)' },
    { key: 'network_wired', label: 'Infrastructure Câblée (FaNetworkWired)' },
    { key: 'cloud', label: 'Cloud Computing (FaCloud)' },
    { key: 'cloud_queue', label: 'Services Cloud (MdCloudQueue)' },
    { key: 'ai', label: 'Intelligence Artificielle (MdSmartToy)' },
    { key: 'brain', label: 'LLMs & Machine Learning (FaBrain)' },
    { key: 'project', label: 'Gestion de Projet (MdAssignmentTurnedIn)' },
    { key: 'tasks', label: 'Tâches & Organisation (FaTasks)' },
    { key: 'security', label: 'Cybersécurité (MdSecurity)' },
    { key: 'shield', label: 'Protection & OWASP (FaShieldAlt)' },
    { key: 'server', label: 'Administration Serveurs (FaServer)' },
    { key: 'database', label: 'Bases de données (FaDatabase)' },
    { key: 'terminal', label: 'Automatisation & CLI (FaTerminal)' },
];

export function renderIcon(iconKey, props = {}) {
    const Component = ICON_MAP[iconKey] || FaCode;
    return <Component {...props} />;
}

export default renderIcon;
