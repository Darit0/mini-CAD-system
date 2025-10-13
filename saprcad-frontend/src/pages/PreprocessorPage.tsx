import React, { useRef } from 'react';
import { useProjectState } from '../hooks/UseProjectState';
import BeamVisualizer from '../components/preprocessor/BeamVisualizer';
import RodEditor from '../components/preprocessor/RodEditor';
import NodeEditor from '../components/preprocessor/NodeEditor';
import FileControls from '../components/preprocessor/FileControls';

const PreprocessorPage: React.FC = () => {
    const {
        project,
        setProject,
        loading,
        errors,
        saveToBackend,
        loadFromExcel,
        downloadExcel,
        downloadTemplate,
        saveToFile,
        loadFromFile,
    } = useProjectState();

    const fileInputRef = useRef<HTMLInputElement>(null);

    return (
        <div style={{ padding: '1rem', fontFamily: 'Arial, sans-serif' }}>
            <h2>Препроцессор</h2>

            {errors.length > 0 && (
                <div style={{ color: 'red', marginBottom: '1rem' }}>
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
                onSaveBackend={() => saveToBackend(project)}
                disabled={loading}
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
                        rods={project.rods} // Передаем rods для проверок
                        onChange={(nodes) => setProject({ ...project, nodes })}
                    />
                </div>
            </div>

            <h3 style={{ marginTop: '2rem' }}>Визуализация</h3>
            <BeamVisualizer project={project} />

            <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                        if (file.name.endsWith('.xlsx')) {
                            loadFromExcel(file);
                        } else if (file.name.endsWith('.json')) {
                            loadFromFile(file);
                        }
                    }
                }}
            />
        </div>
    );
};

export default PreprocessorPage;