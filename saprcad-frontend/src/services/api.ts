import axios from 'axios';

export const preprocessorApi = axios.create({
    baseURL: 'http://localhost:8081/api/',
});

export const processorApi = axios.create({
    baseURL: 'http://localhost:8082/api/',
});

export const postprocessorApi = axios.create({
    baseURL: 'http://localhost:8083/api/',
});