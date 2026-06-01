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
      // Cluster mode: manfaatkan semua vCPU yang tersedia
      instances: 2,            // sesuai jumlah vCPU VPS 2 KVM
      exec_mode: "cluster",    // load balance otomatis antar core

      // Memory guard — restart otomatis sebelum OOM
      max_memory_restart: "1200M",

      // Restart policy
      autorestart: true,
      max_restarts: 15,
      restart_delay: 3000,     // tunggu 3 detik sebelum restart

      // Graceful shutdown — beri waktu finish request yang sedang berjalan
      kill_timeout: 5000,

      // Logging
      time: true,
      log_date_format: "YYYY-MM-DD HH:mm:ss",
      error_file: "./logs/pm2-error.log",
      out_file: "./logs/pm2-out.log",
      merge_logs: true,
    }
  ]
};
