import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import express from 'express';
import footprintRoutes from '../routes/footprintRoutes.js';

const app = express();
app.use(express.json());
app.use('/api/footprint', footprintRoutes);

// Mock Firebase Admin
vi.mock('firebase-admin/firestore', () => ({
  getFirestore: vi.fn(() => ({
    collection: vi.fn(() => ({
      doc: vi.fn(() => ({
        collection: vi.fn(() => ({
          add: vi.fn().mockResolvedValue({ id: 'mock-doc-id' }),
          orderBy: vi.fn(() => ({
            limit: vi.fn(() => ({
              get: vi.fn().mockResolvedValue({
                empty: false,
                forEach: (cb) => {
                  cb({
                    id: 'test-1',
                    data: () => ({ scores: { total: 1500 } }),
                  });
                }
              })
            }))
          }))
        }))
      }))
    }))
  }))
}));

describe('Footprint API Endpoints', () => {
  it('should return 404 if user ID is missing on GET', async () => {
    // If we omit userId, it hits /api/footprint/history which is not a defined GET route
    const res = await request(app).get('/api/footprint/history');
    expect(res.statusCode).toBe(404);
  });

  it('should fetch history successfully for valid user', async () => {
    const res = await request(app).get('/api/footprint/test-user/history');
    expect(res.statusCode).toBe(200);
    expect(res.body.history.length).toBe(1);
    expect(res.body.history[0].scores.total).toBe(1500);
  });

  it('should return 400 if footprint body is missing on POST', async () => {
    const res = await request(app).post('/api/footprint').send({});
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe('Valid userId string is required.');
  });

  it('should successfully log footprint data', async () => {
    const validData = {
      userId: 'test-user',
      scores: { total: 500, transport: 100, energy: 200, food: 100, water: 50, waste: 50 },
      inputs: { transport: { milesDriven: 100, flightsTaken: 0 } }
    };
    const res = await request(app).post('/api/footprint').send(validData);
    expect(res.statusCode).toBe(201);
    expect(res.body.message).toBe('Footprint saved successfully.');
  });
});
