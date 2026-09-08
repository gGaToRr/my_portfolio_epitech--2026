import { useState, useEffect } from 'react';
import Header from '../../components/Header/Header';
import MobileMenu from '../../components/MobileMenu/MobileMenu';
import Footer from '../../components/Footer/Footer';
import Hero from '../../sections/Hero/Hero';
import WhoIAm from '../../sections/WhoIAm/WhoIAm';
import Objectives from '../../sections/Objectives/Objectives';
import Experiences from '../../sections/Experiences/Experiences';
import Projects from '../../sections/Projects/Projects';
import EpitechProjects from '../../sections/EpitechProjects/EpitechProjects';
import Contact from '../../sections/Contact/Contact';
import useBodyScrollLock from '../../hooks/useBodyScrollLock';

function Home({ theme, onToggleTheme }) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    useBodyScrollLock(isMenuOpen);

    useEffect(() => {
        if (!window.location.hash || window.location.hash === '#home') {
            window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
        }
    }, []);

    return (
        <>
            <Header
                isMenuOpen={isMenuOpen}
                onOpenMenu={() => setIsMenuOpen(true)}
                theme={theme}
                onToggleTheme={onToggleTheme}
            />
            <MobileMenu open={isMenuOpen} onClose={() => setIsMenuOpen(false)} />

            <main className="App-Main">
                <Hero />
                <WhoIAm />
                <Objectives />
                <Experiences />
                <Projects />
                <EpitechProjects />
                <Contact />
                <Footer />
            </main>
        </>
    );
}

export default Home;
