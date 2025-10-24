// src/pages/ProcessorPage.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import CalculationSpinner from '../components/processor/CalculationSpinner';
import { processorApi, CalculationResponse } from '../api/processorApi';

interface LocationState {
    projectId?: string;
}

const ProcessorPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [error, setError] = useState<string | null>(null);

    const projectId = (location.state as LocationState | null)?.projectId;


    useEffect(() => {
        if (!projectId) {
            alert('Нет данных для расчёта. Вернитесь в препроцессор.');
            navigate('/preprocessor', { replace: true });
            return;
        }

        const performCalculation = async () => {
            try {
                const response: { data: CalculationResponse } = await processorApi.calculate({ projectId });
                const { displacements } = response.data;

                // Передаём и projectId, и результат расчёта в постпроцессор
                navigate('/postprocessor', {
                    state: { projectId, displacements },
                    replace: true,
                });
            } catch (err: any) {
                console.error('Ошибка расчёта:', err);
                let errorMsg = 'Неизвестная ошибка при выполнении расчёта.';

                if (err.response) {
                    // Ошибка от бэкенда (4xx, 5xx)
                    const data = err.response.data;
                    errorMsg = data.message || data.error || JSON.stringify(data);
                } else if (err.request) {
                    // Нет ответа (CORS, offline, неверный URL)
                    errorMsg = 'Не удаётся подключиться к микросервису процессора. Проверьте, запущен ли он на http://localhost:8082.';
                }

                setError(errorMsg);
            }
        };

        performCalculation();
    }, [projectId, navigate]);

    if (error) {
        return (
            <div style={{ padding: '2rem', color: 'red', maxWidth: '800px', margin: '0 auto' }}>
                <h2> Ошибка расчёта</h2>
                <p><strong>Причина:</strong></p>
                <pre style={{ backgroundColor: '#ffebee', padding: '1rem', borderRadius: '4px', overflowX: 'auto' }}>
          {error}
        </pre>
                <div style={{ marginTop: '1.5rem' }}>
                    <button onClick={() => navigate('/preprocessor')} style={{ marginRight: '1rem' }}>
                        ← Вернуться в препроцессор
                    </button>
                    <button onClick={() => window.location.reload()}>
                        Повторить попытку
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div style={{ padding: '2rem' }}>
            <h2>Процессор</h2>
            <p>Выполняется расчёт вектора перемещений узлов ∆...</p>
            <CalculationSpinner />
        </div>
    );
};

export default ProcessorPage;