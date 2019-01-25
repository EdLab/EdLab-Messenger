module.exports = {
  apps: [
    {
      name: '***REMOVED***-dev',
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
      name: '***REMOVED***-int',
      node_args: '--max-old-space-size=2048',
      script: 'dist/index.js',
      env: {
        NODE_ENV: 'integration',
      },
    }, {
      name: '***REMOVED***-prod',
      node_args: '--max-old-space-size=2048',
      source_map_support: false,
      max_memory_restart: '4G',
      script: 'dist/index.js',
      vizion: false,
      env: {
        NODE_ENV: 'production',
        BLUEBIRD_WARNINGS: 0,
        PORT: 8000,
      },
      exec_mode: 'cluster',
      instances: 'max',
    },
  ]
}
