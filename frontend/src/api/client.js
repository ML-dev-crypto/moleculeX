import axios from 'axios'

const API_BASE_URL = '/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

export const submitQuery = async (query) => {
  const response = await api.post('/query', { query })
  return response.data
}

export const getJobStatus = async (jobId) => {
  const response = await api.get(`/status/${jobId}`)
  return response.data
}

export const getJobResult = async (jobId) => {
  const response = await api.get(`/result/${jobId}`)
  return response.data
}

export default api
