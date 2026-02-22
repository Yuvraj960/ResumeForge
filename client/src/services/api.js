import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:5000/api' });

export const getUser = () => API.get('/user');
export const saveUser = (data) => API.post('/user', data);
export const patchUser = (data) => API.patch('/user', data);
export const generateResume = (jd) => API.post('/generate', { jd });
export const deleteResume = (resumeId) => API.delete(`/resume/${resumeId}`);

