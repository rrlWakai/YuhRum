import type { Amenity, Room } from '../types/admin';

const TOKEN_KEY = 'velora_admin_token';

type AdminPayload = {
  rooms: Room[];
  amenities: Amenity[];
};

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = localStorage.getItem(TOKEN_KEY);
  const headers = new Headers(init?.headers);
  headers.set('Content-Type', 'application/json');
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(path, { ...init, headers });
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || 'Request failed');
  }
  return response.json() as Promise<T>;
}

export async function loginAdmin(email: string, password: string) {
  const response = await request<{ token: string; email: string }>('/api/admin/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  localStorage.setItem(TOKEN_KEY, response.token);
  return response;
}

export function logoutAdmin() {
  localStorage.removeItem(TOKEN_KEY);
}

export function hasAdminToken() {
  return Boolean(localStorage.getItem(TOKEN_KEY));
}

export function getAdminData() {
  return request<AdminPayload>('/api/admin/data');
}

export function createRoom(room: Omit<Room, 'id'>) {
  return request<Room>('/api/admin/rooms', { method: 'POST', body: JSON.stringify(room) });
}

export function updateRoom(id: string, room: Omit<Room, 'id'>) {
  return request<Room>(`/api/admin/rooms/${id}`, { method: 'PUT', body: JSON.stringify(room) });
}

export function deleteRoom(id: string) {
  return request<{ success: true }>(`/api/admin/rooms/${id}`, { method: 'DELETE' });
}

export function createAmenity(amenity: Omit<Amenity, 'id'>) {
  return request<Amenity>('/api/admin/amenities', { method: 'POST', body: JSON.stringify(amenity) });
}

export function updateAmenity(id: string, amenity: Omit<Amenity, 'id'>) {
  return request<Amenity>(`/api/admin/amenities/${id}`, {
    method: 'PUT',
    body: JSON.stringify(amenity),
  });
}

export function deleteAmenity(id: string) {
  return request<{ success: true }>(`/api/admin/amenities/${id}`, { method: 'DELETE' });
}
