const net = require('node:net');

async function getNextAvailablePort(startPort = 5001) {
  let candidate = Number(startPort) || 5001;

  while (true) {
    const isAvailable = await new Promise((resolve) => {
      const tester = net.createServer();

      tester.once('error', () => resolve(false));
      tester.once('listening', () => {
        tester.close(() => resolve(true));
      });

      tester.listen(candidate, '::');
    });

    if (isAvailable) {
      return candidate;
    }

    candidate += 1;
  }
}

module.exports = {
  getNextAvailablePort,
};
