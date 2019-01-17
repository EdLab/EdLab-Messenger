const configs = {
  'default': {
    HTTP_BODY_LIMIT: '50mb',
    ENABLE_SENTRY_IO: false,
    DISPLAY_ERROR_STACKTREE: true,
    LOG_LEVEL: 'debug',
  },
  'development': {
    HOST_URL: 'http://localhost:3000',
  },
  'test': {
    LOG_LEVEL: 'fatal',
    DISABLE_SEND_EMAIL: true,
  },
  'integration': {
    HOST_URL: 'https://***REMOVED***2.tc-***REMOVED***.org/',
  },
  'production': {
    DISPLAY_ERROR_STACKTREE: false,
    ENABLE_SENTRY_IO: true,
    HOST_URL: 'https://***REMOVED***2.tc-***REMOVED***.org/',
  },
}

export default (env) => {
  return Object.assign(configs['default'], configs[env])
}
