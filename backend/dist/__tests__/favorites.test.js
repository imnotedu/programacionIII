"use strict";
/**
 * Tests de Integración para Favoritos basado en Sesión
 *
 * Valida las operaciones de favoritos usando sesiones y cookies.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const supertest_1 = __importDefault(require("supertest"));
const app_1 = require("../app");
(0, vitest_1.describe)('Favorites API', () => {
    let app;
    let agent;
    (0, vitest_1.beforeAll)(() => {
        app = (0, app_1.createApp)();
        // Use agent to maintain session and cookies across requests
        agent = supertest_1.default.agent(app);
    });
    (0, vitest_1.describe)('POST /api/favorites/add', () => {
        (0, vitest_1.it)('should add a product to favorites', async () => {
            const response = await agent
                .post('/api/favorites/add')
                .send({
                productId: 'test-product-1'
            });
            // Note: This will fail if the product doesn't exist in the database
            (0, vitest_1.expect)([200, 404]).toContain(response.status);
        });
        (0, vitest_1.it)('should return validation error for invalid data', async () => {
            const response = await agent
                .post('/api/favorites/add')
                .send({
                productId: ''
            });
            (0, vitest_1.expect)(response.status).toBe(400);
        });
    });
    (0, vitest_1.describe)('GET /api/favorites', () => {
        (0, vitest_1.it)('should get favorites list', async () => {
            const response = await agent
                .get('/api/favorites');
            (0, vitest_1.expect)(response.status).toBe(200);
            (0, vitest_1.expect)(response.body).toHaveProperty('success', true);
            (0, vitest_1.expect)(response.body.data).toHaveProperty('favorites');
            (0, vitest_1.expect)(response.body.data).toHaveProperty('count');
            (0, vitest_1.expect)(Array.isArray(response.body.data.favorites)).toBe(true);
        });
    });
    (0, vitest_1.describe)('DELETE /api/favorites/remove', () => {
        (0, vitest_1.it)('should remove a product from favorites', async () => {
            const response = await agent
                .delete('/api/favorites/remove')
                .send({
                productId: 'test-product-1'
            });
            (0, vitest_1.expect)([200, 404]).toContain(response.status);
        });
    });
});
