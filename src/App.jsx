import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import GameController from './components/Game/GameController';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<GameController />} />
                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        </Router>
    );
}

export default App;
