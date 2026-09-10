import { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home/Home';
import useTheme from './hooks/useTheme';
import { usePageViewTracker } from './hooks/useAnalytics';
import './App.css';

const ProjectDetail = lazy(() => import('./pages/ProjectDetail/ProjectDetail'));
const NotFound = lazy(() => import('./pages/NotFound/NotFound'));
const Admin = lazy(() => import('./pages/Admin/Admin'));
const AdminGame = lazy(() => import('./pages/AdminGame/AdminGame'));
const AdminProtectedRoute = lazy(() => import('./components/AdminProtectedRoute/AdminProtectedRoute'));

function PageLoader() {
    return <div className="page-loader" aria-live="polite">Chargement…</div>;
}

function App() {
    const [theme, toggleTheme] = useTheme();
    usePageViewTracker();

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
                        <Route path="/panelAdmin" element={<Admin theme={theme} onToggleTheme={toggleTheme} />} />
                        <Route
                            path="/panelAdmin/game"
                            element={
                                <AdminProtectedRoute>
                                    <AdminGame theme={theme} onToggleTheme={toggleTheme} />
                                </AdminProtectedRoute>
                            }
                        />
                        <Route
                            path="/admin/game"
                            element={
                                <AdminProtectedRoute>
                                    <AdminGame theme={theme} onToggleTheme={toggleTheme} />
                                </AdminProtectedRoute>
                            }
                        />
                        <Route path="/youtube" element={<NotFound isYouTube={true} />} />
                        <Route path="*" element={<NotFound />} />
                    </Routes>
                </Suspense>
            </div>
        </>
    );
}

export default App;
