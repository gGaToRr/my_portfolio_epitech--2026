// react-router-dom v7 est distribue en ESM pur, avec un champ "main" casse
// (fichier absent) pour les resolveurs qui ignorent "exports" -- dont le
// Jest 27 embarque par react-scripts 5. Le probleme se propage ensuite dans
// les sous-chemins internes du paquet (react-router/dom...), donc rafistoler
// la resolution plutot que de la remplacer ici tournerait au jeu de
// chamboule-tout. Ce mock ne couvre que ce que les tests utilisent
// reellement : routage memoire et lecture des parametres d'URL.
import { createContext, useContext } from 'react';

const LocationContext = createContext({ pathname: '/', search: '' });

function parseEntry(entry) {
    if (typeof entry !== 'string') return { pathname: '/', search: '' };
    const [pathname, search = ''] = entry.split('?');
    return { pathname: pathname || '/', search: search ? `?${search}` : '' };
}

export function MemoryRouter({ initialEntries = ['/'], children }) {
    const location = parseEntry(initialEntries[0]);
    return <LocationContext.Provider value={location}>{children}</LocationContext.Provider>;
}

export const BrowserRouter = MemoryRouter;

export function useSearchParams() {
    const { search } = useContext(LocationContext);
    const params = new URLSearchParams(search);
    // Le vrai hook renvoie aussi un setter ; aucun test actuel ne navigue, un
    // no-op suffit plutot que de simuler un vrai changement de route.
    return [params, () => {}];
}

export function useLocation() {
    return useContext(LocationContext);
}

export function useNavigate() {
    return () => {};
}

export function Link({ to, children, ...props }) {
    return (
        <a href={typeof to === 'string' ? to : '#'} {...props}>
            {children}
        </a>
    );
}
