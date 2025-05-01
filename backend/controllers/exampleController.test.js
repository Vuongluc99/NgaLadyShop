const request = require('supertest');
const express = require('express');
const { getExample } = require('./exampleController');

const app = express();
app.get('/example', getExample);

describe('GET /example', () => {
  it('should return a success message', async () => {
    const response = await request(app).get('/example');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: 'Example route working!' });
  });
});
