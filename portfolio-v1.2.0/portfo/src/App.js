import { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home/Home';
import useTheme from './hooks/useTheme';
import './App.css';

const ProjectDetail = lazy(() => import('./pages/ProjectDetail/ProjectDetail'));
const NotFound = lazy(() => import('./pages/NotFound/NotFound'));

function PageLoader() {
    return <div className="page-loader" aria-live="polite">Chargement…</div>;
}

function App() {
    const [theme, toggleTheme] = useTheme();

    return (
        <>
            <div className="app-bg-wallpaper" />
            <div className="app-bg-overlay" />
            <div className="App">
                <Suspense fallback={<PageLoader />}>
                    <Routes>
                        <Route
                            path="/"
                            element={<Home theme={theme} onToggleTheme={toggleTheme} />}
                        />
                        <Route path="/projects/:slug" element={<ProjectDetail />} />
                        <Route path="/youtube" element={<NotFound isYouTube={true} />} />
                        <Route path="*" element={<NotFound />} />
                    </Routes>
                </Suspense>
            </div>
        </>
    );
}

export default App;
