import axios from "axios";

const baseUrl = import.meta.env.VITE_API_BASE || "http://localhost:3000";

const request = axios.create({
    baseURL: baseUrl,
})

// 配置 axios 拦截器 - 每次请求前从 localStorage 读取 token
request.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('admin_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// 响应拦截器
request.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error('API Error:', error.response?.data);
        return Promise.reject(error);
    }
);

export default request;