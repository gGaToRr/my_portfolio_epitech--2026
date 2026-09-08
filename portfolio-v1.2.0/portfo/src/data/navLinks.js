const navLinks = {
    en: [
        { name: "Home", href: "#home" },
        { name: "Who I am", href: "#who" },
        { name: "My objectives", href: "#objectives" },
        { name: "My experiences", href: "#experiences" },
        { name: "My projects", href: "#projects" },
        { name: "Epitech", href: "#epitech-projects" },
        { name: "Contact me", href: "#contact" },
    ],
    fr: [
        { name: "Accueil", href: "#home" },
        { name: "À propos de moi", href: "#who" },
        { name: "Mes objectifs", href: "#objectives" },
        { name: "Mes expériences", href: "#experiences" },
        { name: "Mes projets", href: "#projects" },
        { name: "Epitech", href: "#epitech-projects" },
        { name: "Me contacter", href: "#contact" },
    ],
};

export const getNavLinks = (lang = 'en') => navLinks[lang] || navLinks.en;
export default navLinks.en;
