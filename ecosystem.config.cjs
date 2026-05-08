module.exports = {
  apps: [
    {
      name: "sales-bot-demo",
      script: "bun",
      args: "run start",
      cwd: "/root/proj/bot",
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      error_file: "logs/error.log",
      out_file: "logs/out.log",
      time: true,
    },
  ],
};
