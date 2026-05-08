module.exports = {
  apps: [
    {
      name: "sales-bot",
      script: "bun",
      args: "run start",
      cwd: "/root/bot",
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      error_file: "logs/error.log",
      out_file: "logs/out.log",
      time: true,
    },
  ],
};
