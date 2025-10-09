// src/services/rolesService.js
import api from '@/utils/axios'

// Fetch all roles with permissions
export async function fetchRoles() {
  const { data } = await api.get('/roles')
  return data
}

// Fetch all permissions
export async function fetchPermissions() {
  const { data } = await api.get('/permissions')
  return data
}

// Get single role by ID
export async function fetchRole(id) {
  const { data } = await api.get(`/roles/${id}`)
  return data
}

// Create a new role
export async function createRole(role) {
  const { data } = await api.post('/roles', role)
  return data
}

// Update an existing role
export async function updateRole(id, payload) {
  const { data } = await api.put(`/roles/${id}`, payload)
  return data
}

// Delete a role
export async function deleteRole(id) {
  const { data } = await api.delete(`/roles/${id}`)
  return data
}
