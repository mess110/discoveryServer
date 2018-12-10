module.exports = {
  apps : [{
    name: 'discoveryServer',
    script: '../src/server.js',

    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      DS_PORT: 443,
      DS_KEY: '/etc/letsencrypt/live/mesh.opinie-publica.ro/privkey.pem',
      DS_CERT: '/etc/letsencrypt/live/mesh.opinie-publica.ro/fullchain.pem'
    }
  }],
};
