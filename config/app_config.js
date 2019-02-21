const configs = {
  default: {
    HTTP_BODY_LIMIT: '50mb',
    DISPLAY_ERROR_STACKTREE: true,
    LOG_LEVEL: 'debug',
  },
  development: {
    HOST_URL: 'https://dev-***REMOVED***2.tc-***REMOVED***.org/',
  },
  test: {
    LOG_LEVEL: 'fatal',
    DISABLE_SEND_EMAIL: true,
    HOST_URL: 'http://localhost:8000/',
  },
  integration: {
    HOST_URL: 'https://***REMOVED***2.tc-***REMOVED***.org/',
  },
  production: {
    HOST_URL: 'https://***REMOVED***2.tc-***REMOVED***.org/',
  },
}

export default (env) => {
  return Object.assign(configs['default'], configs[env])
}
