import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import { EditableContentProvider } from './context/EditableContentContext';
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <BrowserRouter>
            <LanguageProvider>
                <EditableContentProvider>
                    <App />
                </EditableContentProvider>
            </LanguageProvider>
        </BrowserRouter>
    </React.StrictMode>
);
