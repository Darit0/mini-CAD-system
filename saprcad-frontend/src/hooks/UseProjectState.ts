// src/hooks/useProjectState.ts
import { useState, useEffect } from 'react';
import { StructureInput } from '../types/sapr.types';
import { preprocessorApi } from '../api/preprocessorApi';
import { saveProjectToFile, loadProjectFromFile } from '../utils/FileUtils';

const PROJECT_ID_KEY = 'sapr_projectId';

export const useProjectState = () => {
    const [project, setProject] = useState<StructureInput>({
        rods: [],
        nodes: [],
    });
    const [projectId, setProjectId] = useState<string | null>(() => {
        return localStorage.getItem(PROJECT_ID_KEY);
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<string[]>([]);

    // Создаём пустой проект при первом входе (если нет сохранённого)
    useEffect(() => {
        const init = async () => {
            if (!projectId) return;
            try {
                const res = await preprocessorApi.getProject(projectId);
                setProject(res.data);
            } catch (err) {
                console.warn('Не удалось загрузить сохранённый проект', err);
                localStorage.removeItem(PROJECT_ID_KEY);
                setProjectId(null);
            }
        };
        init();
    }, [projectId]);

    const saveToBackend = async (data: StructureInput): Promise<string | null> => {
        setLoading(true);
        try {
            let res;
            if (projectId) {
                res = await preprocessorApi.updateProject(projectId, data);
            } else {
                res = await preprocessorApi.submitProject(data);
            }
            const newProjectId = res.data.projectId;
            setProjectId(newProjectId);
            localStorage.setItem(PROJECT_ID_KEY, newProjectId);
            setProject(data);
            setErrors([]);
            return newProjectId;
        } catch (err: any) {
            const errMsgs = err.response?.data || ['Ошибка сохранения'];
            setErrors(Array.isArray(errMsgs) ? errMsgs : [errMsgs]);
            return null;
        } finally {
            setLoading(false);
        }
    };

    const loadFromExcel = async (file: File) => {
        setLoading(true);
        try {
            const res = await preprocessorApi.uploadExcel(file);
            const newProjectId = res.data.projectId;
            setProjectId(newProjectId);
            localStorage.setItem(PROJECT_ID_KEY, newProjectId);
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
        try {
            const res = await preprocessorApi.exportExcel(projectId);
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const a = document.createElement('a');
            a.href = url;
            a.download = `project_${projectId}.xlsx`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        } catch (err) {
            alert('Ошибка экспорта Excel');
        }
    };

    const downloadTemplate = async () => {
        try {
            const res = await preprocessorApi.downloadTemplate();
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const a = document.createElement('a');
            a.href = url;
            a.download = 'sapr_stems_template.xlsx';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        } catch (err) {
            alert('Ошибка скачивания шаблона');
        }
    };

    const saveToFile = () => {
        saveProjectToFile(project);
    };

    const loadFromFile = async (file: File) => {
        try {
            const data = await loadProjectFromFile(file);
            setProject(data);
            // Не сохраняем в бэкенд автоматически
        } catch (err: any) {
            alert(err.message);
        }
    };

    const clearProject = () => {
        setProject({ rods: [], nodes: [] });
        setProjectId(null);
        localStorage.removeItem(PROJECT_ID_KEY);
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
        clearProject,
    };
};