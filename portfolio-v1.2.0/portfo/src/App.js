import './App.css';
import burger_menu from '../src/components/pictures/burger-bar(1).png';
import croix_menu from '../src/components/pictures/croix.png'
import { useState, useEffect } from 'react'; // Importe useEffect aussi

function App() {

  const [currentValue, setCurrentValue] = useState(0);
  const ok = () => {
    setCurrentValue(1);
  };
  const oknon = () => {
    setCurrentValue(0);
  }

  return (
    <div className="App">
      <header className="App-header">
        <div className='App-header-container'>
          <h1>Pierre Untersinger</h1>
          <nav className='link'>
            <a href="#who"><button>Who I am.</button></a>
            <a href="#objectives"><button>My objectives</button></a>
            <a href="#experiences"><button>My experiences</button></a>
            <a href="#contact"><button>Contact me</button></a>
        </nav>
          <button onClick={ok} className='hamburger-button'>
            <img className='App-header-img' src={burger_menu} alt="Menu" />
          </button>
        </div>
      </header>
      {/*Ne pas toucher en dessous*/}
          {currentValue === 1 && (
            <div className='test-menu'>
              <div className='title-menu'>
                <h2>Menu</h2>
                <button onClick={oknon} className='croix'><img className='App-header-img' src={croix_menu} /></button>
              </div>
              <nav className='link'>
                  <a href="#who"><button>Who I am.</button></a>
                  <a href="#objectives"><button>My objectives</button></a>
                  <a href="#experiences"><button>My experiences</button></a>
                  <a href="#contact"><button>Contact me</button></a>
                </nav>
            </div>
          )}
      <main className='App-Main'>
        <h2>Here my main section</h2>
      </main>
      <footer>
        <h2>Here is my footer</h2>
      </footer>
    </div>
  );
}

export default App;
