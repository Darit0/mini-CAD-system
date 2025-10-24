// src/api/processorApi.ts
import axios from 'axios';

const PROCESSOR_API_BASE = 'http://localhost:8082/api/processor';

export interface CalculationRequest {
    projectId: string;
}

export interface CalculationResponse {
    displacements: number[];
}

export const processorApi = {
    calculate: ( data: CalculationRequest) =>
        axios.post<CalculationResponse>(
            `${PROCESSOR_API_BASE}/calculate`,
            data,
            {
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        ),
};