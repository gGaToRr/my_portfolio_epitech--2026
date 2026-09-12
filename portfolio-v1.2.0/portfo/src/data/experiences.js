const formationsData = {
    en: [
        {
            id: "epitech",
            title: "Epitech Student Projects",
            company: "Epitech Marseille",
            summary: "Renowned curriculum, diverse projects including cybersecurity (OWASP) and systems architecture.",
            tags: ["Curriculum", "Security", "OWASP"],
        },
        {
            id: "apple-simplon",
            title: "Apple Foundation & Extended Program",
            company: "Simplon",
            summary: "Certified training: Agile project management, collaborative coding, iOS foundation.",
            tags: ["Project Management", "Collaboration", "Certification"],
        },
        {
            id: "hackathon-isen",
            title: "ISEN Hackathon — The Night of Code",
            company: "ISEN · Crédit Agricole",
            summary: "Competitive hackathon, timed delivery under strict constraints for a corporate client (Crédit Agricole).",
            tags: ["Hackathon", "Real Client", "Teamwork"],
        },
    ],
    fr: [
        {
            id: "epitech",
            title: "Projets étudiants Epitech",
            company: "Epitech Marseille",
            summary: "Cadre scolaire reconnu, projets variés dont sécurité (OWASP).",
            tags: ["Cursus", "Sécurité", "OWASP"],
        },
        {
            id: "apple-simplon",
            title: "Apple Foundation & Extended Program",
            company: "Simplon",
            summary: "Formation certifiée : gestion de projet, collaboration, cadre officiel.",
            tags: ["Gestion de projet", "Collaboration", "Certification"],
        },
        {
            id: "hackathon-isen",
            title: "Hackathon ISEN — La Nuit Du Code",
            company: "ISEN · Crédit Agricole",
            summary: "Compétition réelle, livraison sous contrainte de temps pour un client (Crédit Agricole).",
            tags: ["Hackathon", "Client réel", "Équipe"],
        },
    ],
};

const jobExperiencesData = {
    en: [
        {
            id: "liriscom",
            role: "Network & Cloud Infrastructure Technician",
            company: "Liriscom",
            place: "Marseille",
            period: "2026",
            contract: "Internship",
            detail: "Administration and configuration of network infrastructures, Cloud deployment, equipment maintenance, and connectivity optimization.",
        },
        {
            id: "bk",
            role: "Versatile Team Member",
            company: "Burger King",
            place: "Bassens",
            period: "July 2023 → November 2024",
            contract: "Permanent",
            detail: "Awarded Employee of the Month 3 times.",
        },
        {
            id: "nextone",
            role: "Network Sales Representative",
            company: "Next-One",
            place: "La Motte-Servolex",
            period: "October 2022 → January 2023",
            contract: "14 weeks",
            detail: "Cold calling, customer relationship management (CRM), network maintenance, on-site client visits.",
        },
        {
            id: "gessien",
            role: "Real Estate Transaction & Management",
            company: "Cabinet Immobilier Gessien",
            place: "Divonne-les-Bains",
            period: "November 2021 → March 2022",
            contract: "10 weeks",
            detail: "Client relations, property visits, contractor and client communications.",
        },
        {
            id: "maison-rouge",
            role: "Dining Service & Hospitality Sales",
            company: "La Maison Rouge",
            place: "Chambéry",
            period: "June 2021",
            contract: "4 weeks",
            detail: "Restaurant service, hotel front desk, reservations, outreach, and local advertising.",
        },
        {
            id: "manor",
            role: "Customer Reception, Advisory & Sales",
            company: "Manor",
            place: "Geneva",
            period: "March 2021",
            contract: "2 weeks",
            detail: "Ready-to-wear apparel and consumer electronics departments.",
        },
        {
            id: "migros",
            role: "Inventory Management & Logistics",
            company: "Migros",
            place: "Meyrin",
            period: "December 2020",
            contract: "3 weeks",
            detail: "Stock management, product shelving, facing, customer assistance.",
        },
    ],
    fr: [
        {
            id: "liriscom",
            role: "Technicien Infrastructure Réseau & Cloud",
            company: "Liriscom",
            place: "Marseille",
            period: "2026",
            contract: "Stage",
            detail: "Administration et configuration d'infrastructures réseaux, déploiement Cloud, maintenance d'équipements et optimisation de la connectivité.",
        },
        {
            id: "bk",
            role: "Équipier polyvalent",
            company: "Burger King",
            place: "Bassens",
            period: "Juillet 2023 → Novembre 2024",
            contract: "CDI",
            detail: "Récompensé employé du mois à 3 reprises.",
        },
        {
            id: "nextone",
            role: "Commercial réseaux",
            company: "Next-One",
            place: "La Motte-Servolex",
            period: "Octobre 2022 → Janvier 2023",
            contract: "14 semaines",
            detail: "Phoning, suivi clientèle (GRC), maintenance réseaux, déplacements.",
        },
        {
            id: "gessien",
            role: "Transaction, gestion et location de biens",
            company: "Cabinet Immobilier Gessien",
            place: "Divonne-les-Bains",
            period: "Novembre 2021 → Mars 2022",
            contract: "10 semaines",
            detail: "Fidélisation client, visites de biens, contact artisans/clients.",
        },
        {
            id: "maison-rouge",
            role: "Service en salle & commercial",
            company: "La Maison Rouge",
            place: "Chambéry",
            period: "Juin 2021",
            contract: "4 semaines",
            detail: "Service restaurant, réception hôtel, réservations, prospection, publicité.",
        },
        {
            id: "manor",
            role: "Accueil, conseil et vente",
            company: "Manor",
            place: "Genève",
            period: "Mars 2021",
            contract: "2 semaines",
            detail: "Rayons prêt-à-porter et électronique.",
        },
        {
            id: "migros",
            role: "Gestion des stocks",
            company: "Migros",
            place: "Meyrin",
            period: "Décembre 2020",
            contract: "3 semaines",
            detail: "Mise en rayon, facing, réassort, accueil clientèle.",
        },
    ],
};

export const getFormations = (lang = 'en') => formationsData[lang] || formationsData.en;
export const getJobExperiences = (lang = 'en') => jobExperiencesData[lang] || jobExperiencesData.en;

export { formationsData, jobExperiencesData };
export const formations = formationsData.en;
export const jobExperiences = jobExperiencesData.en;

