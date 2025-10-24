// src/pages/HomePage.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

const HomePage: React.FC = () => {
    const navigate = useNavigate();
    const projectId = localStorage.getItem('sapr_projectId');

    const handleProcessorClick = () => {
        if (!projectId) {
            alert('Сначала создайте или загрузите проект в препроцессоре.');
            navigate('/preprocessor');
        } else {
            navigate('/processor', { state: { projectId } });
        }
    };

    const handlePostprocessorClick = () => {
        if (!projectId) {
            alert('Сначала выполните расчёт в процессоре.');
            navigate('/preprocessor');
        } else {
            navigate('/postprocessor', { state: { resultId: projectId } });
        }
    };

    return (
        <div style={{ padding: '2rem', fontFamily: 'Arial, sans-serif' }}>
            <h1>САПР: Расчёт стержневых систем</h1>
            <p>Выберите модуль для работы:</p>
            <ul style={{ listStyle: 'none', padding: 0 }}>
                <li style={{ margin: '0.8rem 0' }}>
                    <button
                        onClick={() => navigate('/preprocessor')}
                        style={{ padding: '10px 16px', fontSize: '1rem' }}
                    >
                        Препроцессор
                    </button>
                    &nbsp;— ввод данных, визуализация, формирование проекта
                </li>
                <li style={{ margin: '0.8rem 0' }}>
                    <button
                        onClick={handleProcessorClick}
                        style={{ padding: '10px 16px', fontSize: '1rem' }}
                    >
                        Процессор
                    </button>
                    &nbsp;— расчёт перемещений узлов
                </li>
                <li style={{ margin: '0.8rem 0' }}>
                    <button
                        onClick={handlePostprocessorClick}
                        style={{ padding: '10px 16px', fontSize: '1rem' }}
                    >
                        Постпроцессор
                    </button>
                    &nbsp;— эпюры, таблицы, анализ НДС
                </li>
            </ul>
        </div>
    );
};

export default HomePage;