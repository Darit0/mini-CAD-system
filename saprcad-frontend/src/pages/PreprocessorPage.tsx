// src/pages/PreprocessorPage.tsx
import React, { useRef } from 'react';
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
        projectId,
        loading,
        errors,
        saveToBackend,
        loadFromExcel,
        downloadExcel,
        downloadTemplate,
        saveToFile,
        loadFromFile,
    } = useProjectState();

    const handleSaveAndGoToProcessor = async () => {
        const id = await saveToBackend(project);
        if (id) {
            navigate('/processor', { state: { projectId: id } });
        }
    };

    return (
        <div style={{ padding: '1rem', fontFamily: 'Arial, sans-serif' }}>
            <h2>Препроцессор</h2>

            {errors.length > 0 && (
                <div style={{ color: 'red', marginBottom: '1rem' }}>
                    <strong>Ошибки валидации:</strong>
                    <ul>
                        {errors.map((e, i) => (
                            <li key={i}>{e}</li>
                        ))}
                    </ul>
                </div>
            )}

            <FileControls
                onUploadExcel={(file) => loadFromExcel(file)}
                onUploadJson={(file) => loadFromFile(file)}
                onDownloadExcel={downloadExcel}
                onDownloadTemplate={downloadTemplate}
                onSaveJson={saveToFile}
                onSaveBackend={handleSaveAndGoToProcessor}
                disabled={loading}
                hasProjectId={!!projectId}
            />

            <div style={{ display: 'flex', gap: '2rem', marginTop: '1rem' }}>
                <div style={{ flex: 1 }}>
                    <h3>Стержни</h3>
                    <RodEditor
                        rods={project.rods}
                        onChange={(rods) => setProject({ ...project, rods })}
                    />
                </div>
                <div style={{ flex: 1 }}>
                    <h3>Узлы</h3>
                    <NodeEditor
                        nodes={project.nodes}
                        onChange={(nodes) => setProject({...project, nodes})} rods={[]}                    />
                </div>
            </div>

            <h3 style={{ marginTop: '2rem' }}>Визуализация</h3>
            <BeamVisualizer project={project} />
        </div>
    );
};

export default PreprocessorPage;