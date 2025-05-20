const request = require('supertest');
const server = require('../../index'); // Moved to top

describe('Teams API', () => {
  // beforeEach(() => {
  //   // Dynamically require the server for each test to ensure a fresh state
  //   // This also helps if the server isn't exported until it's listening.
  //   // However, our current index.js exports server after app.listen,
  //   // so we need to manage it carefully.
  //   // For supertest, it's often better to export the app from index.js
  //   // and let supertest handle the listening.
  //   // Given the current structure, we'll require it.
  //   // server = require('../../index'); // Commented out or removed
  // });

  afterEach(async () => {
    // Close the server after each test
    // Ensure mongoose connection is also closed if it was opened by the server start
    // For now, just server.close()
    if (server) {
      await new Promise((resolve) => {
        server.close(resolve);
      });
    }
  });

  describe('GET /api/teams', () => {
    it('should return 200 OK and an array of teams', async () => {
      const res = await request(server).get('/api/teams');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });
});
