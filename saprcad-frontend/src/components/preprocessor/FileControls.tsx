// src/components/preprocessor/FileControls.tsx
import React, { useRef } from 'react';

interface FileControlsProps {
    onUploadExcel: (file: File) => void;
    onUploadJson: (file: File) => void;
    onDownloadExcel: () => void;
    onDownloadTemplate: () => void;
    onSaveJson: () => void;
    onSaveBackend: () => void;
    disabled: boolean;
}

const FileControls: React.FC<FileControlsProps> = ({
                                                       onUploadExcel,
                                                       onUploadJson,
                                                       onDownloadExcel,
                                                       onDownloadTemplate,
                                                       onSaveJson,
                                                       onSaveBackend,
                                                       disabled,
                                                   }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.name.endsWith('.xlsx')) {
            onUploadExcel(file);
        } else if (file.name.endsWith('.json')) {
            onUploadJson(file);
        } else {
            alert('Поддерживаются только .xlsx и .json файлы');
        }
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    return (
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <input
                type="file"
                ref={fileInputRef}
                accept=".xlsx,.json"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
            />
            <button onClick={() => fileInputRef.current?.click()} disabled={disabled}>
                Загрузить (.xlsx / .json)
            </button>
            <button onClick={onDownloadTemplate} disabled={disabled}>
                Скачать шаблон Excel
            </button>
            <button onClick={onSaveJson} disabled={disabled}>
                Сохранить в .json
            </button>
            <button onClick={onDownloadExcel} disabled={disabled}>
                Экспорт в Excel
            </button>
            <button onClick={onSaveBackend} disabled={disabled} style={{ backgroundColor: '#4CAF50', color: 'white' }}>
                Сохранить в системе → Расчёт
            </button>
        </div>
    );
};

export default FileControls;