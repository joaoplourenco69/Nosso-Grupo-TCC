import axios from 'axios';

//ip Felipe Python
const IP_PYTHON = '192.168.1.80'; 

export const api = axios.create({
  baseURL: `http://${IP_PYTHON}:8000/api`,
  timeout: 5000,
});