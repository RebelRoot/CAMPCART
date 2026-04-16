module.exports = {
  apps: [
    {
      name: "campcart-api",
      cwd: "./api",
      script: "server.js",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "production",
      },
    },
    {
      name: "campcart-client",
      cwd: "./client",
      script: "npm",
      args: "run dev",
      autorestart: true,
      watch: false,
    },
    {
      name: "chat-service",
      cwd: "./chat-service",
      script: "/usr/local/go/bin/go",
      args: "run main.go",
      autorestart: true,
      watch: false,
    },
    {
      name: "cloudflare-tunnel",
      script: "./bin/cloudflared",
      args: "tunnel --config cloudflared-config.yaml run",
      autorestart: true,
      watch: false,
    },
  ],
};
