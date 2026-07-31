import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json({ limit: '20mb' }));

const DB_FILE = path.join(__dirname, 'db.json');

// Helper to read DB
const readDB = () => {
    try {
        const data = fs.readFileSync(DB_FILE, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        return { trips: [], heroSlides: [], testimonials: [], users: [] };
    }
};

// Helper to write DB
const writeDB = (data) => {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
};

// Initialize DB if empty
if (!fs.existsSync(DB_FILE)) {
    writeDB({ trips: [], heroSlides: [], testimonials: [], users: [] });
}

// REST Routes for Trips
app.get('/api/trips', (req, res) => {
    const db = readDB();
    res.json(db.trips);
});

app.get('/api/trips/:id', (req, res) => {
    const db = readDB();
    const trip = db.trips.find(t => t.id === parseInt(req.params.id));
    if (trip) res.json(trip);
    else res.status(404).json({ message: 'Not found' });
});

app.post('/api/trips', (req, res) => {
    const db = readDB();
    const newTrip = { ...req.body, id: Math.max(0, ...db.trips.map(t => t.id)) + 1 };
    db.trips.push(newTrip);
    writeDB(db);
    res.json(newTrip);
});

app.put('/api/trips/:id', (req, res) => {
    const db = readDB();
    const index = db.trips.findIndex(t => t.id === parseInt(req.params.id));
    if (index !== -1) {
        db.trips[index] = { ...db.trips[index], ...req.body };
        writeDB(db);
        res.json(db.trips[index]);
    } else {
        res.status(404).json({ message: 'Not found' });
    }
});

app.delete('/api/trips/:id', (req, res) => {
    const db = readDB();
    db.trips = db.trips.filter(t => t.id !== parseInt(req.params.id));
    writeDB(db);
    res.json({ success: true });
});

// REST Routes for Hero Slides
app.get('/api/heroSlides', (req, res) => {
    const db = readDB();
    res.json(db.heroSlides);
});

app.post('/api/heroSlides', (req, res) => {
    const db = readDB();
    db.heroSlides = req.body;
    writeDB(db);
    res.json({ success: true });
});

// REST Routes for testimonials. Media is stored as a data URL to keep this
// lightweight project self-contained; individual uploads are capped at 8 MB in the UI.
app.get('/api/testimonials', (req, res) => {
    const db = readDB();
    res.json(db.testimonials || []);
});

app.post('/api/testimonials', (req, res) => {
    const db = readDB();
    const testimonials = db.testimonials || [];
    const newTestimonial = { ...req.body, id: Date.now() };
    testimonials.unshift(newTestimonial);
    db.testimonials = testimonials;
    writeDB(db);
    res.json(newTestimonial);
});

app.delete('/api/testimonials/:id', (req, res) => {
    const db = readDB();
    db.testimonials = (db.testimonials || []).filter(t => String(t.id) !== String(req.params.id));
    writeDB(db);
    res.json({ success: true });
});

app.get('/api/users', (req, res) => {
    const db = readDB();
    res.json(db.users || []);
});

app.post('/api/users', (req, res) => {
    const db = readDB();
    const users = db.users || [];
    const email = String(req.body.email || '').trim().toLowerCase();
    if (!email) return res.status(400).json({ message: 'Email is required' });

    const now = new Date().toISOString();
    const index = users.findIndex(user => String(user.email || '').toLowerCase() === email);
    const existing = users[index];
    const user = {
        id: existing?.id || `user-${Date.now()}`,
        name: String(req.body.name || existing?.name || email.split('@')[0]).trim(),
        email,
        joinedAt: existing?.joinedAt || now,
        lastLoginAt: now
    };
    if (index >= 0) users[index] = user;
    else users.unshift(user);
    db.users = users;
    writeDB(db);
    res.json(user);
});

app.get('/api/community-galleries', (req, res) => {
    const db = readDB();
    if (!Array.isArray(db.communityGalleries)) return res.status(404).json({ message: 'No gallery data yet' });
    res.json(db.communityGalleries);
});

app.put('/api/community-galleries', (req, res) => {
    if (!Array.isArray(req.body)) return res.status(400).json({ message: 'Gallery data must be an array' });
    const db = readDB();
    db.communityGalleries = req.body;
    writeDB(db);
    res.json({ success: true });
});

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Backend Server API running on http://localhost:${PORT}`);
});
