// src/services/warehouseService.js
import api from '@/utils/axios'

const API_URL = '/warehouses'

export default {
  // 📦 Fetch all warehouses
  async getAll() {
    const res = await api.get(API_URL)
    return res.data
  },

  // ✏️ Update warehouse
  async update(id, data) {
    const res = await api.put(`${API_URL}/${id}`, data)
    return res.data
  },

  // 🗑 Delete warehouse
  async delete(id) {
    const res = await api.delete(`${API_URL}/${id}`)
    return res.data
  },
}
