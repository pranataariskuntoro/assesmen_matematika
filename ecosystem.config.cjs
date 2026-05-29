module.exports = {
  apps: [
    {
      name: "assesmen-matematika",
      cwd: __dirname,
      script: "node_modules/next/dist/bin/next",
      args: "start -p 3333",
      env: {
        NODE_ENV: "production",
        PORT: "3333"
      },
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      max_restarts: 10,
      time: true
    }
  ]
};
