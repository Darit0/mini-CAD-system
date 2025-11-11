// src/pages/PostprocessorPage.tsx
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { StructureInput } from '../types/sapr.types';
import { FullResult } from '../types/sapr.types';
import { saprApi } from '../api/saprApi';
import ResultTable from '../components/postprocessor/ResultTable';
import ConstructionWithEpures from '../components/postprocessor/ConstructionWithEpures';
import SectionCalculator from '../components/postprocessor/SectionCalculator';
import EpurePlot from '../components/postprocessor/EpurePlot';
import ExportHtmlModal from '../components/postprocessor/ExportHtmlModal';

interface LocationState {
    project?: StructureInput;
    displacements?: number[];
}

const PostprocessorPage: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [result, setResult] = useState<FullResult | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showHtmlModal, setShowHtmlModal] = useState(false);
    const [lastSectionCalc, setLastSectionCalc] = useState<any>(null);

    const state = location.state as LocationState | null;

    const handleSectionCalc = (data: any) => {
        setLastSectionCalc(data);
    };

    useEffect(() => {
        const fetchData = async () => {
            if (!state?.project) {
                alert('Нет данных для расчёта');
                navigate('/preprocessor');
                return;
            }

            try {
                const res = await saprApi.fullCalculation(state.project);
                setResult(res.data);
            } catch (err: any) {
                setError('Ошибка расчёта НДС: ' + (err.message || 'неизвестно'));
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [state, navigate]);

    if (loading) {
        return (
            <div style={{ padding: '2rem', textAlign: 'center' }}>
                <h2>Выполняется расчёт НДС...</h2>
                <div className="spinner" style={{
                    width: '40px', height: '40px', margin: '2rem auto',
                    border: '4px solid #f3f3f3', borderTop: '4px solid #4a90e2',
                    borderRadius: '50%', animation: 'spin 1s linear infinite'
                }} />
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ padding: '2rem', color: 'red' }}>
                <h2>Ошибка</h2>
                <p>{error}</p>
                <button onClick={() => navigate('/preprocessor')}>← Вернуться в препроцессор</button>
            </div>
        );
    }

    if (!result) return null;

    // Блоки по умолчанию
    const selectedBlocks = {
        construction: true,
        table: true,
        epureN: true,
        epureSigma: true,
        epureU: true,
        displacements: true,
        sectionCalc: !!lastSectionCalc,
    };

    return (
        <div style={{ padding: '1.5rem', fontFamily: 'Arial, sans-serif', maxWidth: '1400px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2>Постпроцессор: анализ НДС</h2>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button
                        onClick={() => setShowHtmlModal(true)}
                        title="Сформировать автономный HTML-отчёт со всеми графиками и таблицами"
                        style={{
                            padding: '8px 16px',
                            backgroundColor: '#2e7d32',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                        }}
                    >
                        HTML-отчёт
                    </button>
                    <button
                        onClick={() => navigate('/preprocessor', { state: { project: state?.project } })}
                        style={{
                            padding: '8px 20px',
                            fontSize: '1rem',
                            backgroundColor: '#90a4ae',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                        }}
                    >
                        ← Вернуться в препроцессор
                    </button>
                </div>
            </div>

            <section style={{ marginBottom: '2rem' }}>
                <h3>Узловые перемещения ∆</h3>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    {result.displacements.map((u, i) => (
                        <div key={i} style={{
                            padding: '0.5rem 1rem',
                            backgroundColor: '#e3f2fd',
                            borderRadius: '4px',
                            minWidth: '100px',
                            textAlign: 'center'
                        }}>
                            <strong>Узел {i}</strong><br />
                            <span style={{ fontSize: '1.2em' }}>{u.toFixed(6)}</span> м
                        </div>
                    ))}
                </div>
            </section>

            <ConstructionWithEpures rods={result.resultOutput} />

            <ResultTable result={result} />

            <SectionCalculator rods={result.resultOutput} onCalculate={handleSectionCalc} />

            <div style={{ marginTop: '3rem' }}>
                <h3>Эпюры вдоль конструкции</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                    <div>
                        <h4>Продольные силы N(x)</h4>
                        <EpurePlot
                            rods={result.resultOutput}
                            getValue={(rod, x) => rod.axialForceCoeffs.a0 + rod.axialForceCoeffs.a1 * x}
                            ylabel="N(x), Н"
                            color="#e53935"
                        />
                    </div>
                    <div>
                        <h4>Напряжения σ(x)</h4>
                        <EpurePlot
                            rods={result.resultOutput}
                            getValue={(rod, x) => rod.stressCoeffs.a0 + rod.stressCoeffs.a1 * x}
                            ylabel="σ(x), Па"
                            color="#1e88e5"
                            showAllowable={true}
                            allowableStress={result.resultOutput[0]?.allowableStress}
                        />
                    </div>
                    <div>
                        <h4>Перемещения u(x)</h4>
                        <EpurePlot
                            rods={result.resultOutput}
                            getValue={(rod, x) =>
                                rod.displacementCoeffs.a0 +
                                rod.displacementCoeffs.a1 * x +
                                rod.displacementCoeffs.a2 * x * x
                            }
                            ylabel="u(x), м"
                            color="#43a047"
                        />
                    </div>
                </div>
            </div>

            {showHtmlModal && (
                <ExportHtmlModal
                    rods={result.resultOutput}
                    displacements={result.displacements}
                    lastSectionCalc={lastSectionCalc}
                    selectedBlocks={selectedBlocks}
                    onClose={() => setShowHtmlModal(false)}
                />
            )}

            <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                <button
                    onClick={() => navigate('/preprocessor', { state: { project: state?.project } })}
                    style={{
                        padding: '8px 20px',
                        fontSize: '1rem',
                        backgroundColor: '#90a4ae',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                    }}
                >
                    ← Вернуться в препроцессор для редактирования
                </button>
            </div>
        </div>
    );
};

export default PostprocessorPage;