const configs = {
  default: {
    HTTP_BODY_LIMIT: '50mb',
    DISPLAY_ERROR_STACKTREE: true,
    LOG_LEVEL: 'debug',
  },
  development: {
    HOST_URL: 'https://dev-messenger2.tc-library.org/',
  },
  test: {
    LOG_LEVEL: 'fatal',
    DISABLE_SEND_EMAIL: true,
    HOST_URL: 'http://localhost:8000/',
  },
  integration: {
    HOST_URL: 'https://messenger2.tc-library.org/',
  },
  production: {
    HOST_URL: 'https://messenger2.tc-library.org/',
  },
}

export default (env) => {
  return Object.assign(configs['default'], configs[env])
}
