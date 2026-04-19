import { useState } from 'react';
import Header from './components/Header/Header';
import MobileMenu from './components/MobileMenu/MobileMenu';
import Footer from './components/Footer/Footer';
import WhoIAm from './sections/WhoIAm/WhoIAm';
import Objectives from './sections/Objectives/Objectives';
import Experiences from './sections/Experiences/Experiences';
import Projects from './sections/Projects/Projects';
import Contact from './sections/Contact/Contact';
import useVantaBackground from './hooks/useVantaBackground';
import useBodyScrollLock from './hooks/useBodyScrollLock';
import './App.css';

function App() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const vantaBgRef = useVantaBackground();
    useBodyScrollLock(isMenuOpen);

    return (
        <>
            <div className="vanta-bg" ref={vantaBgRef} />
            <div className="App">
                <Header isMenuOpen={isMenuOpen} onOpenMenu={() => setIsMenuOpen(true)} />
                <MobileMenu open={isMenuOpen} onClose={() => setIsMenuOpen(false)} />

                <main className="App-Main">
                    <WhoIAm />
                    <Objectives />
                    <Experiences />
                    <Projects />
                    <Contact />
                    <Footer />
                </main>
            </div>
        </>
    );
}

export default App;
