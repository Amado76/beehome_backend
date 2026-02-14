import type express from 'express';
import request from 'supertest';

import { createApp } from '../../../src/app';

export function createTestApp(): express.Express {
  return createApp();
}

export function createTestClient(app?: express.Express) {
  return request(app ?? createTestApp());
}
