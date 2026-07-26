/**
 * Express + Vite Server with OpenAPI / Swagger Documentation
 * Architecture "Global Bridge" API Server
 */

import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { globalVesselAggregator } from './src/lib/providers/AggregateVesselProvider';
import { SHARED_TOURS_DATA } from './src/data/vessels';
import { CURRENCY_RATES } from './src/lib/currency';
import { MARKET_REGION_PROFILES } from './src/lib/regionConfig';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // CORS headers for external API consumers
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
  });

  // --- API ROUTES ---

  /**
   * GET /api/health
   */
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'JIV Global Bridge API Engine',
      timestamp: new Date().toISOString()
    });
  });

  /**
   * GET /api/vessels
   * Fetches normalized vessel listings across Data Providers (LocalDB, FarPost, Yandex, Airbnb)
   */
  app.get('/api/vessels', async (req, res) => {
    try {
      const { category, source, capacity, maxPrice, search } = req.query;

      const filters = {
        category: category ? (category as any) : undefined,
        sourceType: source ? (source as any) : undefined,
        minCapacity: capacity ? Number(capacity) : undefined,
        maxPriceHour: maxPrice ? Number(maxPrice) : undefined,
        searchQuery: search ? String(search) : undefined
      };

      const vessels = await globalVesselAggregator.getAllVessels(filters);
      res.json({
        success: true,
        count: vessels.length,
        filtersApplied: filters,
        data: vessels
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: 'Failed to fetch vessels from data adapters',
        details: error?.message || 'Unknown error'
      });
    }
  });

  /**
   * GET /api/vessels/:id
   */
  app.get('/api/vessels/:id', async (req, res) => {
    try {
      const vessel = await globalVesselAggregator.getVesselById(req.params.id);
      if (!vessel) {
        return res.status(404).json({
          success: false,
          error: 'Vessel not found in any registered Data Provider'
        });
      }
      res.json({
        success: true,
        data: vessel
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: 'Failed to fetch vessel details',
        details: error?.message || 'Unknown error'
      });
    }
  });

  /**
   * GET /api/tours
   */
  app.get('/api/tours', (req, res) => {
    res.json({
      success: true,
      count: SHARED_TOURS_DATA.length,
      data: SHARED_TOURS_DATA
    });
  });

  /**
   * GET /api/rates
   */
  app.get('/api/rates', (req, res) => {
    res.json({
      success: true,
      base: 'RUB',
      rates: CURRENCY_RATES
    });
  });

  /**
   * GET /api/regions
   */
  app.get('/api/regions', (req, res) => {
    res.json({
      success: true,
      regions: MARKET_REGION_PROFILES
    });
  });

  /**
   * GET /api/openapi.json — OpenAPI 3.0 Specification
   */
  app.get('/api/openapi.json', (req, res) => {
    const openApiSpec = {
      openapi: '3.0.3',
      info: {
        title: 'JIV Global Bridge API',
        version: '1.0.0',
        description:
          'API платформа аренды флота, катеров и гидкроциклов «Journey In Vladivostok» с поддержкой мультипровайдерных адаптеров (FarPost, Яндекс Путешествия, Airbnb Luxe).'
      },
      servers: [
        {
          url: 'http://localhost:3000',
          description: 'Development Server'
        }
      ],
      paths: {
        '/api/vessels': {
          get: {
            summary: 'Получить список судов от всех Data Providers',
            parameters: [
              { name: 'category', in: 'query', schema: { type: 'string', enum: ['yacht', 'boat', 'jetski', 'taxi', 'catamaran'] } },
              { name: 'source', in: 'query', schema: { type: 'string', enum: ['internal', 'farpost', 'yandex', 'airbnb'] } },
              { name: 'capacity', in: 'query', schema: { type: 'integer' } },
              { name: 'maxPrice', in: 'query', schema: { type: 'number' } },
              { name: 'search', in: 'query', schema: { type: 'string' } }
            ],
            responses: {
              '200': {
                description: 'Успешный ответ со списком судов',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        success: { type: 'boolean' },
                        count: { type: 'integer' },
                        data: {
                          type: 'array',
                          items: { $ref: '#/components/schemas/Vessel' }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        '/api/vessels/{id}': {
          get: {
            summary: 'Получить судно по уникальному идентификатору',
            parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
            responses: {
              '200': { description: 'Детали судна' },
              '404': { description: 'Судно не найдено' }
            }
          }
        },
        '/api/tours': {
          get: {
            summary: 'Список сборных туров и морских экскурсий',
            responses: { '200': { description: 'Список туров' } }
          }
        },
        '/api/rates': {
          get: {
            summary: 'Курсы валют (RUB, USD, CNY)',
            responses: { '200': { description: 'Текущие курсы валют' } }
          }
        }
      },
      components: {
        schemas: {
          Vessel: {
            type: 'object',
            required: ['id', 'source_type', 'source_name', 'original_url', 'vessel_type', 'geo_coordinates', 'name', 'capacity', 'rating'],
            properties: {
              id: { type: 'string' },
              source_type: { type: 'string', enum: ['internal', 'farpost', 'yandex', 'airbnb'] },
              source_name: { type: 'string' },
              original_url: { type: 'string' },
              vessel_type: { type: 'string' },
              geo_coordinates: {
                type: 'object',
                properties: {
                  lat: { type: 'number' },
                  lng: { type: 'number' }
                }
              },
              name: { type: 'string' },
              priceHour: { type: 'number' },
              priceDay: { type: 'number' },
              currency: { type: 'string', enum: ['RUB', 'USD', 'CNY'] },
              capacity: { type: 'integer' },
              rating: { type: 'number' }
            }
          }
        }
      }
    };
    res.json(openApiSpec);
  });

  /**
   * GET /api/docs — Interactive Swagger / OpenAPI Documentation
   */
  app.get('/api/docs', (req, res) => {
    const swaggerHtml = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>JIV Global Bridge API Documentation</title>
        <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css">
        <style>
          body { margin: 0; padding: 0; background-color: #0f172a; color: #f8fafc; font-family: sans-serif; }
          .swagger-ui { filter: invert(88%) hue-rotate(180deg); }
          .swagger-ui .topbar { display: none; }
          .header-banner { background: linear-[#0f172a, #1e293b]; padding: 24px; border-bottom: 1px solid rgba(255,255,255,0.1); text-align: center; }
          .header-banner h1 { margin: 0; color: #38bdf8; font-size: 24px; }
          .header-banner p { margin: 6px 0 0 0; color: #94a3b8; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="header-banner">
          <h1>⚓ JIV Global Bridge — Interactive Swagger API</h1>
          <p>Модульная архитектура Data Providers: LocalDB, FarPost.ru, Яндекс Путешествия, Airbnb Luxe Marine</p>
        </div>
        <div id="swagger-ui"></div>
        <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
        <script>
          window.onload = () => {
            SwaggerUIBundle({
              url: '/api/openapi.json',
              dom_id: '#swagger-ui',
              deepLinking: true
            });
          };
        </script>
      </body>
      </html>
    `;
    res.send(swaggerHtml);
  });

  // --- Vite Middleware or Static Production Serving ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[JIV Server] Running on http://0.0.0.0:${PORT}`);
    console.log(`[JIV API Docs] Interactive Swagger UI available at http://localhost:${PORT}/api/docs`);
  });
}

startServer();
