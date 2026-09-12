import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import translationsData from '../data/translations';
import { objectivesData } from '../data/objectives';
import { formationsData, jobExperiencesData } from '../data/experiences';
import { projectsData } from '../data/projects';
import { epitechProjectsData } from '../data/epitechProjects';
import defaultProfilePhoto from '../assets/me.jpeg';
import defaultSetupPhoto from '../assets/pierre-setup.jpeg';
import { verifyAdminAuth } from '../services/api';

const STORAGE_KEY = 'PORTFOLIO_LIVE_EDIT_V2';

export const DEFAULT_SKILLS = [
    { id: 'sk-1', nameFr: 'Réseaux', nameEn: 'Networks', color: '#4caf50', iconKey: 'network', categoryFr: 'Infra', categoryEn: 'Infra' },
    { id: 'sk-2', nameFr: 'Linux', nameEn: 'Linux', color: '#fcc624', iconKey: 'linux', categoryFr: 'Système', categoryEn: 'System' },
    { id: 'sk-3', nameFr: 'Docker', nameEn: 'Docker', color: '#2496ed', iconKey: 'docker', categoryFr: 'DevOps', categoryEn: 'DevOps' },
    { id: 'sk-4', nameFr: 'Cloud', nameEn: 'Cloud', color: '#4fc3f7', iconKey: 'googlecloud', categoryFr: 'Infra', categoryEn: 'Infra' },
    { id: 'sk-5', nameFr: 'Sécurité', nameEn: 'Security', color: '#f43f5e', iconKey: 'security', categoryFr: 'Cyber', categoryEn: 'Cyber' },
    { id: 'sk-6', nameFr: 'Python', nameEn: 'Python', color: '#ffd43b', iconKey: 'python', categoryFr: 'Dev', categoryEn: 'Dev' },
    { id: 'sk-7', nameFr: 'React', nameEn: 'React', color: '#61dafb', iconKey: 'react', categoryFr: 'Front', categoryEn: 'Front' },
    { id: 'sk-8', nameFr: 'JS / TS', nameEn: 'JS / TS', color: '#f7df1e', iconKey: 'javascript', categoryFr: 'Dev', categoryEn: 'Dev' },
    { id: 'sk-9', nameFr: 'IA & LLM', nameEn: 'AI & LLM', color: '#a729de', iconKey: 'ai', categoryFr: 'IA', categoryEn: 'AI' },
    { id: 'sk-10', nameFr: 'Wireshark', nameEn: 'Wireshark', color: '#1679a7', iconKey: 'wireshark', categoryFr: 'Réseau', categoryEn: 'Network' },
    { id: 'sk-11', nameFr: 'Gestion', nameEn: 'Management', color: '#ec4899', iconKey: 'project', categoryFr: 'Agile', categoryEn: 'Agile' },
    { id: 'sk-12', nameFr: 'HTML5', nameEn: 'HTML5', color: '#e34f26', iconKey: 'html5', categoryFr: 'Front', categoryEn: 'Front' },
];

export const DEFAULT_SOCIALS = [
    { id: 'soc-github', name: 'GitHub', url: 'https://github.com/gGaToRr', iconKey: 'github', color: '#f0f6fc', title: 'GitHub (@gGaToRr)' },
    { id: 'soc-linkedin', name: 'LinkedIn', url: 'https://www.linkedin.com/in/pierre-untersinger-406685253/', iconKey: 'linkedin', color: '#0a66c2', title: 'LinkedIn (Pierre Untersinger)' },
    { id: 'soc-youtube', name: 'YouTube', url: '/youtube', iconKey: 'youtube', color: '#ff0000', title: 'YouTube' },
    { id: 'soc-epitech', name: 'Epitech', url: 'https://www.epitech.eu/', iconKey: 'epitech', color: '#0055ff', title: 'Epitech Marseille' },
];

function getInitialState() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            const parsed = JSON.parse(saved);
            return {
                translations: parsed.translations || JSON.parse(JSON.stringify(translationsData)),
                objectives: parsed.objectives || JSON.parse(JSON.stringify(objectivesData)),
                formations: parsed.formations || JSON.parse(JSON.stringify(formationsData)),
                jobs: parsed.jobs || JSON.parse(JSON.stringify(jobExperiencesData)),
                projects: parsed.projects || JSON.parse(JSON.stringify(projectsData)),
                epitechProjects: parsed.epitechProjects || JSON.parse(JSON.stringify(epitechProjectsData)),
                skills: parsed.skills || JSON.parse(JSON.stringify(DEFAULT_SKILLS)),
                socials: parsed.socials || JSON.parse(JSON.stringify(DEFAULT_SOCIALS)),
                assets: parsed.assets || { profilePhoto: defaultProfilePhoto, setupPhoto: defaultSetupPhoto },
                cardStyles: parsed.cardStyles || {},
            };
        }
    } catch (err) {
        console.warn('Could not read portfolio state from localStorage:', err);
    }

    return {
        translations: JSON.parse(JSON.stringify(translationsData)),
        objectives: JSON.parse(JSON.stringify(objectivesData)),
        formations: JSON.parse(JSON.stringify(formationsData)),
        jobs: JSON.parse(JSON.stringify(jobExperiencesData)),
        projects: JSON.parse(JSON.stringify(projectsData)),
        epitechProjects: JSON.parse(JSON.stringify(epitechProjectsData)),
        skills: JSON.parse(JSON.stringify(DEFAULT_SKILLS)),
        socials: JSON.parse(JSON.stringify(DEFAULT_SOCIALS)),
        assets: { profilePhoto: defaultProfilePhoto, setupPhoto: defaultSetupPhoto },
        cardStyles: {},
    };
}

const EditableContentContext = createContext(null);

export function EditableContentProvider({ children }) {
    const [initial] = useState(getInitialState);

    const [translations, setTranslations] = useState(initial.translations);
    const [objectives, setObjectives] = useState(initial.objectives);
    const [formations, setFormations] = useState(initial.formations);
    const [jobs, setJobs] = useState(initial.jobs);
    const [projects, setProjects] = useState(initial.projects);
    const [epitechProjects, setEpitechProjects] = useState(initial.epitechProjects);
    const [skills, setSkills] = useState(initial.skills);
    const [socials, setSocials] = useState(initial.socials);
    const [assets, setAssets] = useState(initial.assets);
    const [cardStyles, setCardStyles] = useState(initial.cardStyles);

    // État du Bottom Drawer d'édition
    const [activeEditTarget, setActiveEditTarget] = useState(null);
    const [isClosingDrawer, setIsClosingDrawer] = useState(false);

    // Mode édition : ?edit=true seul ne suffit pas à l'activer, sans quoi
    // n'importe quel visiteur public y accéderait en tapant l'URL. On exige en
    // plus une session admin valide, vérifiée serveur via le cookie HttpOnly
    // (même contrôle que /panelAdmin). Faux par défaut tant que la vérification
    // n'a pas répondu : en cas de doute, les actions d'édition restent cachées.
    const [searchParams] = useSearchParams();
    const wantsEditMode = searchParams.get('edit') === 'true' || searchParams.get('mode') === 'edit';
    const [isEditMode, setIsEditMode] = useState(false);

    useEffect(() => {
        if (!wantsEditMode) {
            setIsEditMode(false);
            return;
        }
        let active = true;
        verifyAdminAuth().then((ok) => {
            if (active) setIsEditMode(Boolean(ok));
        });
        return () => {
            active = false;
        };
    }, [wantsEditMode]);

    // Sauvegarde automatique dans localStorage pour persistance durant la session
    useEffect(() => {
        try {
            const dataToSave = {
                translations,
                objectives,
                formations,
                jobs,
                projects,
                epitechProjects,
                skills,
                socials,
                assets,
                cardStyles,
            };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
        } catch (err) {
            console.warn('Could not persist portfolio state to localStorage:', err);
        }
    }, [translations, objectives, formations, jobs, projects, epitechProjects, skills, socials, assets, cardStyles]);

    // Ouverture et fermeture du Drawer
    const openEditDrawer = useCallback((config) => {
        setIsClosingDrawer(false);
        setActiveEditTarget(config);
    }, []);

    const closeEditDrawer = useCallback(() => {
        setIsClosingDrawer(true);
        setTimeout(() => {
            setActiveEditTarget(null);
            setIsClosingDrawer(false);
        }, 280);
    }, []);

    // Récupérer la couleur d'un champ précis ou couleur d'accent de la carte
    const getFieldColor = useCallback((targetId, fieldKey, fallback = '') => {
        if (!cardStyles || !cardStyles[targetId]) return fallback;
        const target = cardStyles[targetId];
        if (target.fieldColors && target.fieldColors[fieldKey]) {
            return target.fieldColors[fieldKey];
        }
        if (fieldKey && target[fieldKey]) {
            return target[fieldKey];
        }
        if (!fieldKey && target.accentColor) {
            return target.accentColor;
        }
        return fallback;
    }, [cardStyles]);

    // 1. Mise à jour de champs de traduction (Hero, WhoIAm, Contact, etc.)
    const updateTranslationFields = useCallback((sectionKey, fieldUpdates, newStyles, fieldColors) => {
        setTranslations((prev) => {
            const next = JSON.parse(JSON.stringify(prev));
            if (!next.fr[sectionKey]) next.fr[sectionKey] = {};
            if (!next.en[sectionKey]) next.en[sectionKey] = {};

            Object.entries(fieldUpdates).forEach(([field, { fr, en }]) => {
                next.fr[sectionKey][field] = fr;
                next.en[sectionKey][field] = en;
            });
            return next;
        });

        if (newStyles || fieldColors) {
            setCardStyles((prev) => ({
                ...prev,
                [sectionKey]: {
                    ...(prev[sectionKey] || {}),
                    ...(newStyles || {}),
                    fieldColors: {
                        ...(prev[sectionKey]?.fieldColors || {}),
                        ...(fieldColors || {}),
                    },
                },
            }));
        }
    }, []);

    // 2. Objectifs CRUD
    const updateObjective = useCallback((objId, dataFr, dataEn, newStyles, fieldColors) => {
        const updateList = (list, data) =>
            list.map((item) => (String(item.id) === String(objId) ? { ...item, ...data } : item));

        setObjectives((prev) => ({
            fr: updateList(prev.fr || [], dataFr),
            en: updateList(prev.en || [], dataEn),
        }));

        if (newStyles || fieldColors) {
            setCardStyles((prev) => ({
                ...prev,
                [`obj-${objId}`]: {
                    ...(prev[`obj-${objId}`] || {}),
                    ...(newStyles || {}),
                    fieldColors: {
                        ...(prev[`obj-${objId}`]?.fieldColors || {}),
                        ...(fieldColors || {}),
                    },
                },
            }));
        }
    }, []);

    const createObjective = useCallback((newObjFr, newObjEn) => {
        const nextId = Date.now();
        const objFr = { id: nextId, number: String((newObjFr.number || 5)).padStart(2, '0'), ...newObjFr };
        const objEn = { id: nextId, number: String((newObjEn.number || 5)).padStart(2, '0'), ...newObjEn };

        setObjectives((prev) => ({
            fr: [...(prev.fr || []), objFr],
            en: [...(prev.en || []), objEn],
        }));
    }, []);

    const deleteObjective = useCallback((objId) => {
        setObjectives((prev) => ({
            fr: (prev.fr || []).filter((o) => String(o.id) !== String(objId)),
            en: (prev.en || []).filter((o) => String(o.id) !== String(objId)),
        }));
    }, []);

    // 3. Formations CRUD
    const updateFormation = useCallback((formationId, dataFr, dataEn, newStyles, fieldColors) => {
        const updateList = (list, data) =>
            list.map((item) => (String(item.id) === String(formationId) ? { ...item, ...data } : item));

        setFormations((prev) => ({
            fr: updateList(prev.fr || [], dataFr),
            en: updateList(prev.en || [], dataEn),
        }));

        if (newStyles || fieldColors) {
            setCardStyles((prev) => ({
                ...prev,
                [`formation-${formationId}`]: {
                    ...(prev[`formation-${formationId}`] || {}),
                    ...(newStyles || {}),
                    fieldColors: {
                        ...(prev[`formation-${formationId}`]?.fieldColors || {}),
                        ...(fieldColors || {}),
                    },
                },
            }));
        }
    }, []);

    const createFormation = useCallback((newFormationFr, newFormationEn) => {
        const nextId = `form-${Date.now()}`;
        setFormations((prev) => ({
            fr: [{ id: nextId, ...newFormationFr }, ...(prev.fr || [])],
            en: [{ id: nextId, ...newFormationEn }, ...(prev.en || [])],
        }));
    }, []);

    const deleteFormation = useCallback((formationId) => {
        setFormations((prev) => ({
            fr: (prev.fr || []).filter((f) => String(f.id) !== String(formationId)),
            en: (prev.en || []).filter((f) => String(f.id) !== String(formationId)),
        }));
    }, []);

    // 4. Jobs / Expériences CRUD
    const updateJob = useCallback((jobId, dataFr, dataEn, newStyles, fieldColors) => {
        const updateList = (list, data) =>
            list.map((item) => (String(item.id) === String(jobId) ? { ...item, ...data } : item));

        setJobs((prev) => ({
            fr: updateList(prev.fr || [], dataFr),
            en: updateList(prev.en || [], dataEn),
        }));

        if (newStyles || fieldColors) {
            setCardStyles((prev) => ({
                ...prev,
                [`job-${jobId}`]: {
                    ...(prev[`job-${jobId}`] || {}),
                    ...(newStyles || {}),
                    fieldColors: {
                        ...(prev[`job-${jobId}`]?.fieldColors || {}),
                        ...(fieldColors || {}),
                    },
                },
            }));
        }
    }, []);

    const createJob = useCallback((newJobFr, newJobEn) => {
        const nextId = `job-${Date.now()}`;
        setJobs((prev) => ({
            fr: [{ id: nextId, ...newJobFr }, ...(prev.fr || [])],
            en: [{ id: nextId, ...newJobEn }, ...(prev.en || [])],
        }));
    }, []);

    const deleteJob = useCallback((jobId) => {
        setJobs((prev) => ({
            fr: (prev.fr || []).filter((j) => String(j.id) !== String(jobId)),
            en: (prev.en || []).filter((j) => String(j.id) !== String(jobId)),
        }));
    }, []);

    // 5. Projets Personnels CRUD
    const updateProject = useCallback((slug, dataFr, dataEn, newStyles, fieldColors) => {
        const updateList = (list, data) =>
            list.map((item) => (item.slug === slug ? { ...item, ...data } : item));

        setProjects((prev) => ({
            fr: updateList(prev.fr || [], dataFr),
            en: updateList(prev.en || [], dataEn),
        }));

        if (newStyles || fieldColors) {
            setCardStyles((prev) => ({
                ...prev,
                [`proj-${slug}`]: {
                    ...(prev[`proj-${slug}`] || {}),
                    ...(newStyles || {}),
                    fieldColors: {
                        ...(prev[`proj-${slug}`]?.fieldColors || {}),
                        ...(fieldColors || {}),
                    },
                },
            }));
        }
    }, []);

    const createProject = useCallback((newProjectFr, newProjectEn) => {
        const slug = newProjectFr.slug || `proj-${Date.now()}`;
        setProjects((prev) => ({
            fr: [{ slug, ...newProjectFr }, ...(prev.fr || [])],
            en: [{ slug, ...newProjectEn }, ...(prev.en || [])],
        }));
    }, []);

    const deleteProject = useCallback((slug) => {
        setProjects((prev) => ({
            fr: (prev.fr || []).filter((p) => p.slug !== slug),
            en: (prev.en || []).filter((p) => p.slug !== slug),
        }));
    }, []);

    // 6. Projets Epitech CRUD
    const updateEpitechProject = useCallback((projectName, dataFr, dataEn, newStyles, fieldColors) => {
        const updateList = (list, data) =>
            list.map((item) => (item.name === projectName ? { ...item, ...data } : item));

        setEpitechProjects((prev) => ({
            fr: updateList(prev.fr || [], dataFr),
            en: updateList(prev.en || [], dataEn),
        }));

        if (newStyles || fieldColors) {
            setCardStyles((prev) => ({
                ...prev,
                [`ep-${projectName}`]: {
                    ...(prev[`ep-${projectName}`] || {}),
                    ...(newStyles || {}),
                    fieldColors: {
                        ...(prev[`ep-${projectName}`]?.fieldColors || {}),
                        ...(fieldColors || {}),
                    },
                },
            }));
        }
    }, []);

    const createEpitechProject = useCallback((newProjectFr, newProjectEn) => {
        const name = newProjectFr.name || `Projet-${Date.now()}`;
        setEpitechProjects((prev) => ({
            fr: [{ name, ...newProjectFr }, ...(prev.fr || [])],
            en: [{ name, ...newProjectEn }, ...(prev.en || [])],
        }));
    }, []);

    const deleteEpitechProject = useCallback((name) => {
        setEpitechProjects((prev) => ({
            fr: (prev.fr || []).filter((p) => p.name !== name),
            en: (prev.en || []).filter((p) => p.name !== name),
        }));
    }, []);

    // 7. Compétences / SVG Icons CRUD
    const updateSkills = useCallback((newSkillsList) => {
        setSkills(newSkillsList);
    }, []);

    const addSkill = useCallback((newSkill) => {
        const id = `sk-${Date.now()}`;
        setSkills((prev) => [...prev, { id, ...newSkill }]);
    }, []);

    const deleteSkill = useCallback((skillId) => {
        setSkills((prev) => prev.filter((s) => s.id !== skillId));
    }, []);

    // 8. Réseaux Sociaux / SVG Icons CRUD
    const updateSocials = useCallback((newSocialsList) => {
        setSocials(newSocialsList);
    }, []);

    const addSocial = useCallback((newSocial) => {
        const id = `soc-${Date.now()}`;
        setSocials((prev) => [...prev, { id, ...newSocial }]);
    }, []);

    const deleteSocial = useCallback((socialId) => {
        setSocials((prev) => prev.filter((s) => s.id !== socialId));
    }, []);

    // 9. Assets & Photos
    const updateAsset = useCallback((assetKey, newUrl) => {
        setAssets((prev) => ({
            ...prev,
            [assetKey]: newUrl,
        }));
    }, []);

    // 10. Styles directs de carte
    const setCardStyle = useCallback((cardId, styles) => {
        setCardStyles((prev) => ({
            ...prev,
            [cardId]: {
                ...(prev[cardId] || {}),
                ...styles,
            },
        }));
    }, []);

    // 11. Réinitialisation globale aux valeurs par défaut
    const resetToDefaults = useCallback(() => {
        try {
            localStorage.removeItem(STORAGE_KEY);
        } catch (err) {
            console.warn(err);
        }
        setTranslations(JSON.parse(JSON.stringify(translationsData)));
        setObjectives(JSON.parse(JSON.stringify(objectivesData)));
        setFormations(JSON.parse(JSON.stringify(formationsData)));
        setJobs(JSON.parse(JSON.stringify(jobExperiencesData)));
        setProjects(JSON.parse(JSON.stringify(projectsData)));
        setEpitechProjects(JSON.parse(JSON.stringify(epitechProjectsData)));
        setSkills(JSON.parse(JSON.stringify(DEFAULT_SKILLS)));
        setSocials(JSON.parse(JSON.stringify(DEFAULT_SOCIALS)));
        setAssets({ profilePhoto: defaultProfilePhoto, setupPhoto: defaultSetupPhoto });
        setCardStyles({});
    }, []);

    const value = {
        translations,
        objectives,
        formations,
        jobs,
        projects,
        epitechProjects,
        skills,
        socials,
        assets,
        cardStyles,
        isEditMode,
        activeEditTarget,
        isClosingDrawer,
        openEditDrawer,
        closeEditDrawer,
        getFieldColor,
        setCardStyle,
        updateTranslationFields,
        updateObjective,
        createObjective,
        deleteObjective,
        updateFormation,
        createFormation,
        deleteFormation,
        updateJob,
        createJob,
        deleteJob,
        updateProject,
        createProject,
        deleteProject,
        updateEpitechProject,
        createEpitechProject,
        deleteEpitechProject,
        updateSkills,
        addSkill,
        deleteSkill,
        updateSocials,
        addSocial,
        deleteSocial,
        updateAsset,
        resetToDefaults,
    };

    return (
        <EditableContentContext.Provider value={value}>
            {children}
        </EditableContentContext.Provider>
    );
}

export function useEditableContent() {
    const context = useContext(EditableContentContext);
    if (!context) {
        throw new Error('useEditableContent must be used within an EditableContentProvider');
    }
    return context;
}
