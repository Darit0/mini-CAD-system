// src/hooks/useProjectState.ts
import { useState, useEffect } from 'react';
import { StructureInput, Rod, Node } from '../types/sapr.types';
import { preprocessorApi } from '../api/preprocessorApi';
import { saveProjectToFile, loadProjectFromFile } from '../utils/FileUtils';

export const useProjectState = () => {
    const [project, setProject] = useState<StructureInput>({
        rods: [],
        nodes: [],
    });
    const [projectId, setProjectId] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<string[]>([]);

    // Создаём пустой проект при первом входе
    useEffect(() => {
        const init = async () => {
            setLoading(true);
            try {
                const res = await preprocessorApi.createEmptyProject();
                setProjectId(res.data.projectId);
                setProject({ rods: [], nodes: [] });
            } catch (err) {
                console.error('Не удалось создать проект', err);
            } finally {
                setLoading(false);
            }
        };
        init();
    }, []);

    const saveToBackend = async (data: StructureInput) => {
        setLoading(true);
        try {
            if (projectId) {
                const res = await preprocessorApi.updateProject(projectId, data);
                setProject(data);
                setErrors([]);
            } else {
                const res = await preprocessorApi.submitProject(data);
                setProjectId(res.data.projectId);
                setProject(data);
                setErrors([]);
            }
        } catch (err: any) {
            const errMsgs = err.response?.data || ['Ошибка сохранения'];
            setErrors(Array.isArray(errMsgs) ? errMsgs : [errMsgs]);
        } finally {
            setLoading(false);
        }
    };

    const loadFromExcel = async (file: File) => {
        setLoading(true);
        try {
            const res = await preprocessorApi.uploadExcel(file);
            setProjectId(res.data.projectId);
            setProject(res.data.project);
            setErrors([]);
        } catch (err: any) {
            const errMsgs = err.response?.data || ['Ошибка загрузки Excel'];
            setErrors(Array.isArray(errMsgs) ? errMsgs : [errMsgs]);
        } finally {
            setLoading(false);
        }
    };

    const downloadExcel = async () => {
        if (!projectId) return;
        const res = await preprocessorApi.exportExcel(projectId);
        const url = window.URL.createObjectURL(new Blob([res.data]));
        const a = document.createElement('a');
        a.href = url;
        a.download = `project_${projectId}.xlsx`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    };

    const downloadTemplate = async () => {
        const res = await preprocessorApi.downloadTemplate();
        const url = window.URL.createObjectURL(new Blob([res.data]));
        const a = document.createElement('a');
        a.href = url;
        a.download = 'sapr_stems_template.xlsx';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    };

    const saveToFile = () => {
        saveProjectToFile(project);
    };

    const loadFromFile = async (file: File) => {
        try {
            const data = await loadProjectFromFile(file);
            setProject(data);
            // Не отправляем в бэкенд автоматически — пусть пользователь нажмёт "Сохранить"
        } catch (err: any) {
            alert(err.message);
        }
    };

    return {
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
    };
};