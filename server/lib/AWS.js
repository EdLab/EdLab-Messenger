import AWS, { config } from 'aws-sdk'

config.update({
  region: AppConfig.AWS_CONFIG.AWS_REGION,
  accessKeyId: AppConfig.AWS_CONFIG.AWS_ACCESS_KEY,
  secretAccessKey: AppConfig.AWS_CONFIG.AWS_SECRET_KEY,
})

export default AWS
