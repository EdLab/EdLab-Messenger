import AWS from '../lib/AWS.js'
const sqs = new AWS.SQS()
const Op = SequelizeInst.Op

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
    let deleteBatchParams, statusMessages, logs
    const processMessages = () => {
      const statusLogs = []
      return sqs
        .receiveMessage({
          QueueUrl: AppConfig.SQS_QUEUE_URL,
          MaxNumberOfMessages: 10,
        })
        .promise()
        .then(data => {
          if (!data || !data.Messages) {
            Logger.debug('No pending messages on SQS')
            return Promise.resolve()
          }
          statusMessages = data.Messages
          Logger.debug(`Processing ${ statusMessages.length } messages`)
          const batch = statusMessages.map(statusMessage => {
            return {
              Id: statusMessage.MessageId,
              ReceiptHandle: statusMessage.ReceiptHandle,
            }
          })
          deleteBatchParams = {
            Entries: batch,
            QueueUrl: AppConfig.SQS_QUEUE_URL,
          }
          logs = statusMessages.map(message => JSON.parse(message.Body))
          const messageIds = logs.map(log => log['mail']['messageId'])
          return Message
            .findAll({
              where: {
                ses_id: {
                  [Op.in]: messageIds,
                },
              },
              raw: true,
            })
            .then(messages => {
              const orderedSesIds = messages.map(message => message.ses_id)
              const orderedIds = messages.map(message => message.id)
              logs.forEach(log => {
                const sesId = log.mail.messageId
                const event = log.eventType
                const body = log[event.toLowerCase()]
                if (orderedSesIds.indexOf(sesId) >= 0) {
                  const messageId = orderedIds[orderedSesIds.indexOf(sesId)]
                  statusLogs.push({
                    status: event,
                    message_id: messageId,
                    status_at: body.timestamp,
                    comment: JSON.stringify(body),
                  })
                }
              })
              return StatusLog.bulkCreate(statusLogs)
            })
            .then(() => {
              Logger.debug(`Created ${ statusLogs.length } entries in StatusLog table`)
              return sqs.deleteMessageBatch(deleteBatchParams).promise()
            })
            .then(() => {
              Logger.debug('Deleted message batch from SQS')
              return processMessages()
            })
        })
        .catch(error => Logger.error(error))
    }
    return processMessages()
  }

  return StatusLog
}