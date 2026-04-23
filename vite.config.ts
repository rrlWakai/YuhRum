import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import type { IncomingMessage } from 'node:http';

type Room = {
  id: string;
  name: string;
  category: string;
  description: string;
  features: string;
  price: string;
  ctaLabel: string;
  image: string;
};

type Amenity = {
  id: string;
  title: string;
  text: string;
};

const ADMIN_EMAIL = 'admin@velora.reserve';
const ADMIN_PASSWORD = 'velora123';
const ADMIN_TOKEN = 'velora-admin-token';

const rooms: Room[] = [
  {
    id: 'room-1',
    name: 'Deluxe Room',
    category: 'Suites',
    description: 'A quiet, sunlit retreat with tailored interiors and a private terrace for unhurried mornings.',
    features: '2 Guests · King Bed · Garden View · 45 sqm',
    price: 'From $780 / night',
    ctaLabel: 'View Room',
    image: 'https://images.unsplash.com/photo-1615529162924-f8605388465d?auto=format&fit=crop&w=1400&q=80',
  },
  {
    id: 'room-2',
    name: 'Ocean Suite',
    category: 'Suites',
    description: 'Floor-to-ceiling coastal views paired with a lounge made for intimate evenings and stillness.',
    features: '2 Guests · King Bed · Ocean View · 62 sqm',
    price: 'From $1,150 / night',
    ctaLabel: 'Book Now',
    image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1400&q=80',
  },
];

const amenities: Amenity[] = [
  { id: 'amenity-1', title: 'Oceanfront Suites', text: 'Panoramic horizons and private terraces designed for still mornings.' },
  { id: 'amenity-2', title: 'Sunset Dining', text: 'Chef-led tasting journeys curated around seasonal produce and candlelit nights.' },
];

function readBody(req: IncomingMessage) {
  return new Promise<Record<string, string>>((resolve) => {
    let raw = '';
    req.on('data', (chunk) => {
      raw += chunk;
    });
    req.on('end', () => {
      if (!raw) {
        resolve({});
        return;
      }
      resolve(JSON.parse(raw) as Record<string, string>);
    });
  });
}

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    {
      name: 'admin-serverless-api',
      configureServer(server) {
        server.middlewares.use('/api/admin/login', async (req, res, next) => {
          if (req.method !== 'POST') {
            next();
            return;
          }
          const body = await readBody(req);
          if (body.email === ADMIN_EMAIL && body.password === ADMIN_PASSWORD) {
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ token: ADMIN_TOKEN, email: ADMIN_EMAIL }));
            return;
          }
          res.statusCode = 401;
          res.end('Invalid admin credentials');
        });

        server.middlewares.use('/api/admin', async (req, res, next) => {
          const auth = req.headers.authorization ?? '';
          if (auth !== `Bearer ${ADMIN_TOKEN}`) {
            res.statusCode = 401;
            res.end('Unauthorized');
            return;
          }

          if (req.url === '/data' && req.method === 'GET') {
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ rooms, amenities }));
            return;
          }

          if (req.url === '/rooms' && req.method === 'POST') {
            const body = await readBody(req);
            const room = { id: `room-${Date.now()}`, ...body } as Room;
            rooms.unshift(room);
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(room));
            return;
          }

          if (req.url?.startsWith('/rooms/') && req.method === 'PUT') {
            const body = await readBody(req);
            const id = req.url.replace('/rooms/', '');
            const index = rooms.findIndex((item) => item.id === id);
            if (index === -1) {
              res.statusCode = 404;
              res.end('Room not found');
              return;
            }
            rooms[index] = { id, ...body } as Room;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(rooms[index]));
            return;
          }

          if (req.url?.startsWith('/rooms/') && req.method === 'DELETE') {
            const id = req.url.replace('/rooms/', '');
            const index = rooms.findIndex((item) => item.id === id);
            if (index !== -1) rooms.splice(index, 1);
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: true }));
            return;
          }

          if (req.url === '/amenities' && req.method === 'POST') {
            const body = await readBody(req);
            const amenity = { id: `amenity-${Date.now()}`, ...body } as Amenity;
            amenities.unshift(amenity);
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(amenity));
            return;
          }

          if (req.url?.startsWith('/amenities/') && req.method === 'PUT') {
            const body = await readBody(req);
            const id = req.url.replace('/amenities/', '');
            const index = amenities.findIndex((item) => item.id === id);
            if (index === -1) {
              res.statusCode = 404;
              res.end('Amenity not found');
              return;
            }
            amenities[index] = { id, ...body } as Amenity;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(amenities[index]));
            return;
          }

          if (req.url?.startsWith('/amenities/') && req.method === 'DELETE') {
            const id = req.url.replace('/amenities/', '');
            const index = amenities.findIndex((item) => item.id === id);
            if (index !== -1) amenities.splice(index, 1);
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: true }));
            return;
          }

          next();
        });
      },
    },
  ],
});
