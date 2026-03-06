import axios from "axios";

const baseUrl = import.meta.env.VITE_API_BASE || "http://localhost:3000";

const request = axios.create({
    baseURL: baseUrl,
})

export default request;