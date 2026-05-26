import { useState } from 'react';
import Header from '../../components/Header/Header';
import MobileMenu from '../../components/MobileMenu/MobileMenu';
import Footer from '../../components/Footer/Footer';
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
