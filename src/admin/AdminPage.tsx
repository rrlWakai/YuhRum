import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import {
  createAmenity,
  createRoom,
  deleteAmenity,
  deleteRoom,
  getAdminData,
  hasAdminToken,
  loginAdmin,
  logoutAdmin,
  updateAmenity,
  updateRoom,
} from './api';
import type { Amenity, Room } from '../types/admin';

const emptyRoom = {
  name: '',
  category: 'Suites',
  description: '',
  features: '',
  price: '',
  ctaLabel: 'View Room',
  image: '',
};

const emptyAmenity = {
  title: '',
  text: '',
};

export function AdminPage() {
  const [loggedIn, setLoggedIn] = useState(hasAdminToken());
  const [email, setEmail] = useState('admin@velora.reserve');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [tab, setTab] = useState<'rooms' | 'amenities'>('rooms');
  const [roomForm, setRoomForm] = useState(emptyRoom);
  const [amenityForm, setAmenityForm] = useState(emptyAmenity);
  const [editingRoomId, setEditingRoomId] = useState<string | null>(null);
  const [editingAmenityId, setEditingAmenityId] = useState<string | null>(null);

  const title = useMemo(() => (tab === 'rooms' ? 'Rooms Manager' : 'Amenities Manager'), [tab]);

  useEffect(() => {
    if (!loggedIn) return;
    setLoading(true);
    void getAdminData()
      .then((data) => {
        setRooms(data.rooms);
        setAmenities(data.amenities);
      })
      .catch((requestError: Error) => setError(requestError.message))
      .finally(() => setLoading(false));
  }, [loggedIn]);

  const handleLogin = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      await loginAdmin(email, password);
      setLoggedIn(true);
    } catch (requestError) {
      setError((requestError as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleRoomSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const payload = { ...roomForm };
    if (!payload.name || !payload.image) return;
    try {
      if (editingRoomId) {
        const updated = await updateRoom(editingRoomId, payload);
        setRooms((items) => items.map((room) => (room.id === updated.id ? updated : room)));
      } else {
        const created = await createRoom(payload);
        setRooms((items) => [created, ...items]);
      }
      setRoomForm(emptyRoom);
      setEditingRoomId(null);
    } catch (requestError) {
      setError((requestError as Error).message);
    }
  };

  const handleAmenitySubmit = async (event: FormEvent) => {
    event.preventDefault();
    const payload = { ...amenityForm };
    if (!payload.title || !payload.text) return;
    try {
      if (editingAmenityId) {
        const updated = await updateAmenity(editingAmenityId, payload);
        setAmenities((items) => items.map((amenity) => (amenity.id === updated.id ? updated : amenity)));
      } else {
        const created = await createAmenity(payload);
        setAmenities((items) => [created, ...items]);
      }
      setAmenityForm(emptyAmenity);
      setEditingAmenityId(null);
    } catch (requestError) {
      setError((requestError as Error).message);
    }
  };

  if (!loggedIn) {
    return (
      <main className="min-h-screen bg-white px-6 py-16 text-neutral-900 md:px-10">
        <div className="mx-auto max-w-md border border-gray-200 bg-white p-8">
          <p className="text-xs uppercase tracking-[0.2em] text-gray-500">Admin Access</p>
          <h1 className="mt-4 font-serif text-4xl text-neutral-950">Yuhrum Resort CMS</h1>
          <p className="mt-3 text-sm text-gray-600">Use your admin credentials to manage rooms and amenities.</p>
          <form onSubmit={handleLogin} className="mt-8 space-y-4">
            <input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full border border-gray-300 px-4 py-3 text-sm outline-none focus:border-neutral-900"
              placeholder="Email"
            />
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full border border-gray-300 px-4 py-3 text-sm outline-none focus:border-neutral-900"
              placeholder="Password"
            />
            <button
              disabled={loading}
              className="w-full border border-neutral-900 bg-neutral-900 px-5 py-3 text-xs uppercase tracking-[0.15em] text-white"
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>
          {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}
          <p className="mt-5 text-xs text-gray-500">Default: admin@velora.reserve / velora123</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white px-6 py-12 text-neutral-900 md:px-10">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-200 pb-6">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-gray-500">Admin Dashboard</p>
            <h1 className="mt-2 font-serif text-4xl text-neutral-950">{title}</h1>
          </div>
          <div className="flex gap-3">
            <a href="/" className="border border-gray-300 px-4 py-2 text-xs uppercase tracking-[0.15em] text-gray-700">
              View Site
            </a>
            <button
              onClick={() => {
                logoutAdmin();
                setLoggedIn(false);
              }}
              className="border border-neutral-900 bg-neutral-900 px-4 py-2 text-xs uppercase tracking-[0.15em] text-white"
            >
              Logout
            </button>
          </div>
        </div>

        <div className="mt-8 flex gap-3">
          <button
            onClick={() => setTab('rooms')}
            className={`border px-4 py-2 text-xs uppercase tracking-[0.15em] ${
              tab === 'rooms' ? 'border-neutral-900 bg-neutral-900 text-white' : 'border-gray-300 text-gray-700'
            }`}
          >
            Rooms
          </button>
          <button
            onClick={() => setTab('amenities')}
            className={`border px-4 py-2 text-xs uppercase tracking-[0.15em] ${
              tab === 'amenities' ? 'border-neutral-900 bg-neutral-900 text-white' : 'border-gray-300 text-gray-700'
            }`}
          >
            Amenities
          </button>
        </div>

        {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}
        {loading ? <p className="mt-4 text-sm text-gray-600">Loading...</p> : null}

        {tab === 'rooms' ? (
          <div className="mt-8 grid gap-8 lg:grid-cols-[360px_1fr]">
            <form onSubmit={handleRoomSubmit} className="space-y-3 border border-gray-200 p-5">
              <h2 className="font-serif text-2xl">{editingRoomId ? 'Edit Room' : 'Add Room'}</h2>
              <input
                value={roomForm.name}
                onChange={(event) => setRoomForm((v) => ({ ...v, name: event.target.value }))}
                className="w-full border border-gray-300 px-3 py-2 text-sm"
                placeholder="Room name"
              />
              <input
                value={roomForm.category}
                onChange={(event) => setRoomForm((v) => ({ ...v, category: event.target.value }))}
                className="w-full border border-gray-300 px-3 py-2 text-sm"
                placeholder="Category"
              />
              <textarea
                value={roomForm.description}
                onChange={(event) => setRoomForm((v) => ({ ...v, description: event.target.value }))}
                className="min-h-20 w-full border border-gray-300 px-3 py-2 text-sm"
                placeholder="Description"
              />
              <input
                value={roomForm.features}
                onChange={(event) => setRoomForm((v) => ({ ...v, features: event.target.value }))}
                className="w-full border border-gray-300 px-3 py-2 text-sm"
                placeholder="2 Guests · King Bed · Ocean View · 62 sqm"
              />
              <input
                value={roomForm.price}
                onChange={(event) => setRoomForm((v) => ({ ...v, price: event.target.value }))}
                className="w-full border border-gray-300 px-3 py-2 text-sm"
                placeholder="From $1,150 / night"
              />
              <input
                value={roomForm.ctaLabel}
                onChange={(event) => setRoomForm((v) => ({ ...v, ctaLabel: event.target.value }))}
                className="w-full border border-gray-300 px-3 py-2 text-sm"
                placeholder="CTA label"
              />
              <input
                value={roomForm.image}
                onChange={(event) => setRoomForm((v) => ({ ...v, image: event.target.value }))}
                className="w-full border border-gray-300 px-3 py-2 text-sm"
                placeholder="Image URL"
              />
              <button className="w-full border border-neutral-900 bg-neutral-900 py-2 text-xs uppercase tracking-[0.15em] text-white">
                {editingRoomId ? 'Update Room' : 'Create Room'}
              </button>
            </form>
            <div className="grid gap-4">
              {rooms.map((room) => (
                <article key={room.id} className="border border-gray-200 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-serif text-2xl">{room.name}</h3>
                      <p className="mt-1 text-xs uppercase tracking-[0.15em] text-gray-500">{room.category}</p>
                      <p className="mt-3 text-sm text-gray-700">{room.description}</p>
                      <p className="mt-2 text-xs text-gray-600">{room.features}</p>
                    </div>
                    <img src={room.image} alt={room.name} className="h-20 w-28 border border-gray-200 object-cover" />
                  </div>
                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={() => {
                        setEditingRoomId(room.id);
                        setRoomForm({
                          name: room.name,
                          category: room.category,
                          description: room.description,
                          features: room.features,
                          price: room.price,
                          ctaLabel: room.ctaLabel,
                          image: room.image,
                        });
                      }}
                      className="border border-gray-300 px-3 py-1 text-xs uppercase tracking-[0.12em]"
                    >
                      Edit
                    </button>
                    <button
                      onClick={async () => {
                        await deleteRoom(room.id);
                        setRooms((items) => items.filter((item) => item.id !== room.id));
                      }}
                      className="border border-red-300 px-3 py-1 text-xs uppercase tracking-[0.12em] text-red-600"
                    >
                      Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        ) : (
          <div className="mt-8 grid gap-8 lg:grid-cols-[360px_1fr]">
            <form onSubmit={handleAmenitySubmit} className="space-y-3 border border-gray-200 p-5">
              <h2 className="font-serif text-2xl">{editingAmenityId ? 'Edit Amenity' : 'Add Amenity'}</h2>
              <input
                value={amenityForm.title}
                onChange={(event) => setAmenityForm((v) => ({ ...v, title: event.target.value }))}
                className="w-full border border-gray-300 px-3 py-2 text-sm"
                placeholder="Amenity title"
              />
              <textarea
                value={amenityForm.text}
                onChange={(event) => setAmenityForm((v) => ({ ...v, text: event.target.value }))}
                className="min-h-20 w-full border border-gray-300 px-3 py-2 text-sm"
                placeholder="Amenity description"
              />
              <button className="w-full border border-neutral-900 bg-neutral-900 py-2 text-xs uppercase tracking-[0.15em] text-white">
                {editingAmenityId ? 'Update Amenity' : 'Create Amenity'}
              </button>
            </form>
            <div className="grid gap-4">
              {amenities.map((amenity) => (
                <article key={amenity.id} className="border border-gray-200 p-4">
                  <h3 className="font-serif text-2xl">{amenity.title}</h3>
                  <p className="mt-3 text-sm text-gray-700">{amenity.text}</p>
                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={() => {
                        setEditingAmenityId(amenity.id);
                        setAmenityForm({
                          title: amenity.title,
                          text: amenity.text,
                        });
                      }}
                      className="border border-gray-300 px-3 py-1 text-xs uppercase tracking-[0.12em]"
                    >
                      Edit
                    </button>
                    <button
                      onClick={async () => {
                        await deleteAmenity(amenity.id);
                        setAmenities((items) => items.filter((item) => item.id !== amenity.id));
                      }}
                      className="border border-red-300 px-3 py-1 text-xs uppercase tracking-[0.12em] text-red-600"
                    >
                      Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
