import dbConfig from './DatabaseConfig.json';

const configs = {
  'default': {
    AWS_CONFIG: {
      AWS_REGION: 'us-east-1',
      EMAIL_SENDER: 'EdLab IT <edlabit@tc.edu>',
    },
    SES_CONFIGURATION_SET: '***REMOVED***',
    SQS_QUEUE_URL: '***REMOVED***/***REMOVED***',
    PAGINATION_LIMIT: 12,
  },
  'development': {
    ENABLE_DOC: 'true',
  },
  'test': {},
  'integration': {},
  'production': {
    AWS_CONFIG: {
      AWS_REGION: 'us-east-1',
      EMAIL_SENDER: 'TC Library Archive <***REMOVED***@tc.columbia.edu>',
    },
  },
}
export default (env = process.env.NODE_ENV) => {
  const dbConfigEnv = process.env.USE_DATABASE || env
  return Object.assign(configs['default'], configs[env], {
    DBCONFIG: dbConfig[dbConfigEnv],
  })
}