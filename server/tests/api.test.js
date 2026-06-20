import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import express from 'express';
import footprintRoutes from '../routes/footprintRoutes.js';

// Setup basic express app for testing routes
const app = express();
app.use(express.json());
app.use('/api/footprint', footprintRoutes);

// Mock the firebase db to prevent real network calls
vi.mock('../config/firebase.js', () => ({
  db: {
    collection: vi.fn(() => ({
      doc: vi.fn(() => ({
        collection: vi.fn(() => ({
          add: vi.fn().mockResolvedValue({ id: 'test-doc-123' }),
          orderBy: vi.fn().mockReturnThis(),
          limit: vi.fn().mockReturnThis(),
          get: vi.fn().mockResolvedValue({
            empty: false,
            forEach: (cb) => cb({
              id: 'doc1',
              data: () => ({
                month: 'Jan',
                scores: { total: 500 }
              })
            })
          })
        }))
      }))
    }))
  }
}));

describe('Footprint API Endpoints', () => {
  it('should return 400 if footprint payload is missing data', async () => {
    const res = await request(app)
      .post('/api/footprint')
      .send({ userId: 'testUser' }); // Missing inputs and scores

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe('Inputs and scores must be valid objects.');
  });

  it('should successfully save a footprint when payload is valid', async () => {
    const res = await request(app)
      .post('/api/footprint')
      .send({
        userId: 'testUser',
        inputs: { transport: { milesDriven: 10 } },
        scores: { total: 100 }
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.message).toBe('Footprint saved successfully.');
  });

  it('should fetch history for a user', async () => {
    const res = await request(app).get('/api/footprint/testUser/history');
    
    expect(res.statusCode).toBe(200);
    expect(res.body.history).toBeDefined();
    expect(res.body.history.length).toBeGreaterThan(0);
    expect(res.body.history[0].scores.total).toBe(500);
  });
});
