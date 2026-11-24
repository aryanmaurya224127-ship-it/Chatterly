const assert = require('node:assert/strict');
const net = require('node:net');
const { getNextAvailablePort } = require('../utils/port');

(async () => {
  const occupiedServer = net.createServer();
  await new Promise((resolve) => occupiedServer.listen(4100, resolve));

  try {
    const nextPort = await getNextAvailablePort(4100);
    assert.equal(nextPort, 4101, 'Should skip the occupied port and pick the next free one.');
    console.log('port fallback test passed');
  } finally {
    await new Promise((resolve, reject) => occupiedServer.close((err) => (err ? reject(err) : resolve())));
  }
})();
