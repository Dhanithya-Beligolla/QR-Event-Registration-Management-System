module.exports = {
  apps: [
    {
      name: 'qr-event-server',
      script: 'server.js',
      exec_mode: 'fork',
      instances: 1,
      watch: false,
      env: {
        NODE_ENV: 'production'
      }
    }
  ]
};
