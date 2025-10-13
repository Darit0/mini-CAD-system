import axios from 'axios';
import { StructureInput } from '../types/sapr.types';

const API_BASE = '/api/preprocessor';

export const preprocessorApi = {
    createEmptyProject: () => axios.post<{ projectId: string }>(`${API_BASE}/create`),

    submitProject: (data: StructureInput) =>
        axios.post<{ projectId: string }>(`${API_BASE}/submit`, data),

    getProject: (projectId: string) =>
        axios.get<StructureInput>(`${API_BASE}/project/${projectId}`),

    updateProject: (projectId: string, data: StructureInput) =>
        axios.put<{ message: string; projectId: string }>(
            `${API_BASE}/project/${projectId}`,
            data
        ),

    uploadExcel: (file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        return axios.post<{ projectId: string; project: StructureInput }>(
            `${API_BASE}/upload`,
            formData,
            { headers: { 'Content-Type': 'multipart/form-data' } }
        );
    },

    exportExcel: (projectId: string) =>
        axios.get(`${API_BASE}/export/${projectId}`, {
            responseType: 'blob',
        }),

    downloadTemplate: () =>
        axios.get(`${API_BASE}/download-template`, {
            responseType: 'blob',
        }),
};