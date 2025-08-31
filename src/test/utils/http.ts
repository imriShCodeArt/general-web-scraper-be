import request from 'supertest';
import app from '../../server';

export const http = {
  agent() {
    return request(app);
  },
  async getJson(path: string) {
    const res = await request(app).get(path);
    return res;
  },
  async postJson(path: string, body: Record<string, unknown> | string | undefined) {
    const res = await request(app).post(path).send(body);
    return res;
  },
  async delete(path: string) {
    const res = await request(app).delete(path);
    return res;
  },
};


