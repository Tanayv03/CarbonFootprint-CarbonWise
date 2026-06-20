import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import express from 'express';
import aiRoutes from '../routes/aiRoutes.js';

// Setup basic express app for testing routes
const app = express();
app.use(express.json());
app.use('/api/ai', aiRoutes);

// Mock the AI service
vi.mock('../services/gemini.js', () => ({
  generateFootprintInsights: vi.fn().mockResolvedValue([
    {
      title: "Reduce Meat Consumption",
      description: "Swap 2 meals for plant-based alternatives.",
      savings: "50kg CO2e",
      iconName: "Leaf"
    }
  ])
}));

describe('AI API Endpoints', () => {
  it('should return 400 if footprintData is missing', async () => {
    const res = await request(app).post('/api/ai/analyze').send({});
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe('Footprint data must be an array.');
  });

  it('should return 400 if footprintData is too large', async () => {
    const largeArray = new Array(25).fill({ test: 'data' });
    const res = await request(app)
      .post('/api/ai/analyze')
      .send({ footprintData: largeArray });
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe('Footprint data history is too large.');
  });

  it('should return AI recommendations for valid payload', async () => {
    const res = await request(app)
      .post('/api/ai/analyze')
      .send({ footprintData: [{ scores: { total: 500 } }] });
    
    expect(res.statusCode).toBe(200);
    expect(res.body.recommendations).toBeDefined();
    expect(res.body.recommendations.length).toBeGreaterThan(0);
    expect(res.body.recommendations[0].title).toBe("Reduce Meat Consumption");
  });
});
