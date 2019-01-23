import AWS from '../lib/AWS.js'
const sqs = new AWS.SQS()

export default function (sequelize, DataTypes) {
    const StatusLog = sequelize.define('status_log', {
      status: {
        type: DataTypes.STRING(64),
        allowNull: false,
      },
      status_at: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      comment: {
          type: DataTypes.TEXT('long'),
          allowNull: true,
      },
    }, {
      underscored: true,
      hooks: {},
      classMethods: {
        updateStatuses() {
          let deleteBatchParams
          const processMessages = () => {
            return sqs
              .receiveMessage({
                QueueUrl: AppConfig.SQS_QUEUE_URL,
                MaxNumberOfMessages: 10,
              })
              .promise()
              .then(data => {
                if (!data || !data.Messages) {
                  Logger.log('No pending messages on SQS')
                  return
                }
                const messages = data.Messages
                Logger.log(`Processing ${ messages.length } messages`)
                const batch = messages.map(message => {
                  return {
                    Id: message.MessageId,
                    ReceiptHandle: message.ReceiptHandle,
                  }
                })
                deleteBatchParams = {
                  Entries: batch,
                  QueueUrl: AppConfig.SQS_QUEUE_URL,
                }
                logs = messages.map(message => JSON.parse(message.Body))
                statusLogs = []
                const promises = []
                logs.forEach(log => {
                  promises.push(
                    Message
                      .findOne({ where: { ses_id: log['mail']['messageId'] } })
                      .then(message => {
                        statusLogs.push({
                          status: log['eventType'],
                          message_id: message.id,
                          status_at: log['mail']['timestamp'],
                          comment: JSON.stringify(log['mail'])
                        })
                      })
                  )
                })
                return Promise.all(promises)
              })
              .then(() => StatusLog.bulkCreate(statusLogs))
              .then(() => {
                Logger.log(`Created ${ messages.length } entries in StatusLog table`)
                sqs.deleteMessageBatch(deleteBatchParams).promise()
              })
              .then(() => {
                Logger.log(`Deleted message batch from SQS`)
                processMessages()
              })
          }
          return processMessages()
        }
      },
      instanceMethods: {},
    })

    StatusLog.associate = (models) => {
      StatusLog.belongsTo(models.message, {
        onDelete: 'CASCADE',
      })
    }

    return StatusLog
  }