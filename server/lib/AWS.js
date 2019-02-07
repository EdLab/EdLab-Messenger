import AWS, { config } from 'aws-sdk'

config.update({ 'region': AppConfig.AWS_CONFIG.AWS_REGION })

if (AppConfig.USE_AWS_KEY) {
  config.update({
    'accessKeyId': AppConfig.AWS_CONFIG.AWS_ACCESS_KEY,
    'secretAccessKey': AppConfig.AWS_CONFIG.AWS_SECRET_KEY,
  })
}

export default AWS
