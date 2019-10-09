const { WEB_CONCURRENCY = 1, WEB_MEMORY = 512, PORT = 8000 } = process.env

module.exports = {
  apps: [
    {
      name: 'messenger-dev',
      node_args: '--max-old-space-size=2048',
      script: 'server/index.js',
      watch: true,
      ignore_watch: ['node_modules', '.git', 'tmp'],
      watch_options: {
        followSymlinks: false,
        useFsEvents: false,
      },
      env: {
        DEBUG: 'Client*',
        NODE_ENV: 'development',
        BLUEBIRD_WARNINGS: 0,
      },
    }, {
      name: 'app',
      source_map_support: false,
      script: 'dist/index.js',
      vizion: false,
      max_memory_restart: `${WEB_MEMORY}M`,
      env: {
        NODE_ENV: 'production',
        BLUEBIRD_WARNINGS: 0,
        PORT: PORT,
      },
      exec_mode: 'cluster',
      instances: WEB_CONCURRENCY,
    },
  ],
}
