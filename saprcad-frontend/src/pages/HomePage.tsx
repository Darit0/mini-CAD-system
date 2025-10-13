// src/pages/HomePage.tsx
import React from 'react';
import { Link } from 'react-router-dom';

const HomePage: React.FC = () => {
    return (
        <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
            <h1>САПР: Расчёт стержневых систем</h1>
            <p>Выберите модуль для работы:</p>
            <ul>
                <li><Link to="/preprocessor">Препроцессор</Link> — ввод данных и визуализация</li>
                <li><Link to="/processor">Процессор</Link> — расчёт перемещений</li>
                <li><Link to="/postprocessor">Постпроцессор</Link> — анализ результатов и эпюры</li>
            </ul>
        </div>
    );
};

export default HomePage;