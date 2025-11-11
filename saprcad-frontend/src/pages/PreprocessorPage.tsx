// src/pages/PreprocessorPage.tsx
import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useProjectState } from '../hooks/UseProjectState';
import BeamVisualizer from '../components/preprocessor/BeamVisualizer';
import RodEditor from '../components/preprocessor/RodEditor';
import NodeEditor from '../components/preprocessor/NodeEditor';
import FileControls from '../components/preprocessor/FileControls';

const PreprocessorPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const {
        project,
        setProject,
        loading,
        errors,
        validateAndCalculate,
        saveToFile,
        loadFromFile,
        clearProject,
    } = useProjectState();

    // Загрузка project из location.state (при возврате из постпроцессора)
    useEffect(() => {
        const state = location.state as { project?: any } | null;
        if (state?.project) {
            setProject(state.project);
            // Ошибки сбрасываем — валидация будет при расчёте
        }
    }, [location.state, setProject]);

    const handleCalculate = async () => {
        const result = await validateAndCalculate();
        if (result.success && result.displacements) {
            navigate('/calculation-success', {
                state: { project, displacements: result.displacements },
            });
        }
    };

    return (
        <div style={{ padding: '1.5rem', fontFamily: 'Arial, sans-serif', maxWidth: '1400px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h2>Препроцессор: ввод данных и визуализация</h2>
                <button
                    onClick={clearProject}
                    style={{
                        padding: '6px 12px',
                        backgroundColor: '#e0e0e0',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                    }}
                >
                    Очистить проект
                </button>
            </div>

            {errors.length > 0 && (
                <div style={{ color: 'red', marginBottom: '1.2rem', padding: '0.8rem', backgroundColor: '#ffebee', borderRadius: '4px' }}>
                    <strong>Ошибки валидации:</strong>
                    <ul style={{ margin: 0, paddingLeft: '1.2rem' }}>
                        {errors.map((e, i) => (
                            <li key={i}>{e}</li>
                        ))}
                    </ul>
                </div>
            )}

            <FileControls
                onUploadJson={(file) => loadFromFile(file)}
                onSaveJson={saveToFile}
                onCalculate={handleCalculate}
                disabled={loading}
            />

            <div style={{ display: 'flex', gap: '2rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '400px', overflowX: 'auto' }}>
                    <h3>Стержни</h3>
                    <RodEditor
                        rods={project.rods}
                        onChange={(rods) => setProject({ ...project, rods })}
                    />
                </div>
                <div style={{ flex: 1, minWidth: '400px', overflowX: 'auto' }}>
                    <h3>Узлы</h3>
                    <NodeEditor
                        nodes={project.nodes}
                        onChange={(nodes) => setProject({ ...project, nodes })} rods={[]}
                    />
                </div>
            </div>

            <h3 style={{ marginTop: '2rem', marginBottom: '1rem' }}>Визуализация конструкции</h3>
            <BeamVisualizer project={project} />
        </div>
    );
};

export default PreprocessorPage;