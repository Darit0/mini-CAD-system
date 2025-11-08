// src/pages/PreprocessorPage.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useProjectState } from '../hooks/UseProjectState';
import BeamVisualizer from '../components/preprocessor/BeamVisualizer';
import RodEditor from '../components/preprocessor/RodEditor';
import NodeEditor from '../components/preprocessor/NodeEditor';
import FileControls from '../components/preprocessor/FileControls';

const PreprocessorPage: React.FC = () => {
    const navigate = useNavigate();
    const {
        project,
        setProject,
        loading,
        errors,
        validateAndCalculate,
        saveToFile,
        loadFromFile,
    } = useProjectState();

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
            <h2 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>Препроцессор: ввод данных и визуализация</h2>

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
                        onChange={(nodes) => setProject({...project, nodes})} rods={[]}
                    />
                </div>
            </div>

            <h3 style={{ marginTop: '2rem', marginBottom: '1rem' }}>Визуализация конструкции</h3>
            <BeamVisualizer project={project} />
        </div>
    );
};

export default PreprocessorPage;