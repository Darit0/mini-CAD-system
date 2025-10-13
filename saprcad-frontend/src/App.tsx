import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import PreprocessorPage from './pages/PreprocessorPage';
import ProcessorPage from './pages/ProcessorPage';
import PostprocessorPage from './pages/PostprocessorPage';

const App: React.FC = () => {
    return (
        <Router>
            <div className="App">
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/preprocessor" element={<PreprocessorPage />} />
                    <Route path="/processor" element={<ProcessorPage />} />
                    <Route path="/postprocessor" element={<PostprocessorPage />} />
                </Routes>
            </div>
        </Router>
    );
};

export default App;