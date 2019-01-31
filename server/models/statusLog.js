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
    })

    StatusLog.associate = (models) => {
      StatusLog.belongsTo(models.message, {
        onDelete: 'CASCADE',
        foreignKey: { allowNull: false },
      })
    }

    StatusLog.updateStatuses = () => {
      let deleteBatchParams, messages
      const statusLogs = []
      const processMessages = () => {
        return sqs
          .receiveMessage({
            QueueUrl: AppConfig.SQS_QUEUE_URL,
            MaxNumberOfMessages: 10,
          })
          .promise()
          .then(data => {
            if (!data || !data.Messages) {
              Logger.debug('No pending messages on SQS')
              return
            }
            messages = data.Messages
            Logger.debug(`Processing ${ messages.length } messages`)
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
            const logs = messages.map(message => JSON.parse(message.Body))
            const promises = []
            logs.forEach(log => {
              promises.push(
                Message
                  .findOne({ where: { ses_id: log['mail']['messageId'] } })
                  .then(message => {
                    if (message) {
                      statusLogs.push({
                        status: log['eventType'],
                        message_id: message.id,
                        status_at: log['mail']['timestamp'],
                        comment: JSON.stringify(log['mail'])
                      })
                    }
                  })
                  .catch(error => Logger.error(error))
              )
            })
            return Promise.all(promises)
          })
          .then(() => StatusLog.bulkCreate(statusLogs))
          .then(() => {
            Logger.debug(`Created ${ messages.length } entries in StatusLog table`)
            return sqs.deleteMessageBatch(deleteBatchParams).promise()
          })
          .then(() => {
            Logger.debug(`Deleted message batch from SQS`)
            return processMessages()
          })
          .catch(error => Logger.error(error))
      }
      return processMessages()
    }

    return StatusLog
  }