import createTextVersion from 'textversionjs'
import moment from 'moment'
import AWS from '../lib/AWS.js'

const ses = new AWS.SES()

export default function (sequelize, DataTypes) {
  const Message = sequelize.define('message', {
    ses_id: {
      type: DataTypes.STRING(256),
      allowNull: false,
      unique: true,
    },
    to_email: {
      type: DataTypes.STRING(64),
      allowNull: false,
    },
  }, {
    underscored: true,
    hooks: {},
    classMethods: {
      associate(models) {
        Message.belongsTo(models.email, {
          onDelete: 'RESTRICT',
        }),
        Message.hasMany(models.status_log, {
          onDelete: 'CASCADE',
        })
      },
      send(email, to_email) {
        const html = email.html
        const cc_emails = email.cc_emails ? email.cc_emails.split(',') : []
        const bcc_emails = email.bcc_emails ? email.bcc_emails.split(',') : []
        let status_at
        return ses
          .sendEmail({
            Destination: {
              BccAddresses: bcc_emails,
              CcAddresses: cc_emails,
              ToAddresses: [to_email],
            },
            Message: {
              Subject: { Data: email.subject },
              Body: {
                Html: { Data: html },
                Text: { Data: createTextVersion(html) },
              }
            },
            Source: email.from_email,
            ConfigurationSetName: AppConfig.SES_CONFIGURATION_SET,
          })
          .promise()
          .then(data => {
            status_at = moment(data.ResponseMetadata.HTTPHeaders.date, 'ddd, DD MMM YYYY HH:mm:ss Z')
            return Message
              .create({
                email_id: email.id,
                to_email: to_email,
                ses_id: data.MessageId,
              })
          })
          .then(message => {
            return StatusLog
              .create({
                message_id: message.id,
                status: Constants.EMAIL_STATUSES.SENT,
                status_at: status_at,
              })
              .then(statusLog => {
                return {
                  message: message,
                  statusLog: statusLog,
                }
              })
          })
      }
    },
    instanceMethods: {},
  })

  return Message
}