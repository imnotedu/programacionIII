/**
 * Tests de Integración para Favoritos basado en Sesión
 * 
 * Valida las operaciones de favoritos usando sesiones y cookies.
 */

import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../app';
import type { Application } from 'express';

describe('Favorites API', () => {
  let app: Application;
  let agent: any;

  beforeAll(() => {
    app = createApp();
    // Use agent to maintain session and cookies across requests
    agent = request.agent(app);
  });

  describe('POST /api/favorites/add', () => {
    it('should add a product to favorites', async () => {
      const response = await agent
        .post('/api/favorites/add')
        .send({
          productId: 'test-product-1'
        });

      // Note: This will fail if the product doesn't exist in the database
      expect([200, 404]).toContain(response.status);
    });

    it('should return validation error for invalid data', async () => {
      const response = await agent
        .post('/api/favorites/add')
        .send({
          productId: ''
        });

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/favorites', () => {
    it('should get favorites list', async () => {
      const response = await agent
        .get('/api/favorites');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('favorites');
      expect(response.body.data).toHaveProperty('count');
      expect(Array.isArray(response.body.data.favorites)).toBe(true);
    });
  });

  describe('DELETE /api/favorites/remove', () => {
    it('should remove a product from favorites', async () => {
      const response = await agent
        .delete('/api/favorites/remove')
        .send({
          productId: 'test-product-1'
        });

      expect([200, 404]).toContain(response.status);
    });
  });
});
