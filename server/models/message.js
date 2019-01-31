var format = require("string-template")
import createTextVersion from 'textversionjs'
import moment from 'moment'
import AWS from '../lib/AWS.js'

const ses = new AWS.SES()

export default function (sequelize, DataTypes) {
  const Message = sequelize.define('message', {
    ses_id: {
      type: DataTypes.STRING(64),
      allowNull: false,
      unique: true,
    },
    to_user_uid: {
      type: DataTypes.STRING(128),
      allowNull: false,
    },
  }, {
    underscored: true,
    hooks: {},
  })

  Message.associate = (models) => {
    Message.belongsTo(models.email, {
      onDelete: 'RESTRICT',
    })
    Message.hasMany(models.status_log, {
      onDelete: 'CASCADE',
    })
  }

  Message.send = (email, to_user, from_email_address, cc_emails = [], bcc_emails = []) => {
    const html = format(email.html, to_user.get({ plain: true }))
    return ses
      .sendEmail({
        Destination: {
          BccAddresses: bcc_emails,
          CcAddresses: cc_emails,
          ToAddresses: [to_user.getEmailAddress()],
        },
        Message: {
          Subject: { Data: email.subject },
          Body: {
            Html: { Data: html },
            Text: { Data: createTextVersion(html) },
          }
        },
        Source: from_email_address,
        ConfigurationSetName: AppConfig.SES_CONFIGURATION_SET,
      })
      .promise()
      .then(data => {
        const status_at = moment()
        // Logger.debug(
        //   `Sent message successfully;
        //    ses_id: ${ data.MessageId };
        //    sending completed at ${ status_at }`
        // )
        Message
          .create({
            email_id: email.id,
            to_user_uid: to_user.uid,
            ses_id: data.MessageId,
          })
          .then(message => {
            StatusLog
              .create({
                message_id: message.id,
                status: 'sent',
                status_at: status_at,
              })
          })
          .catch(error => {
            Logger.error(`Saving sent message failed: ${ error }`)
          })
        Promise.resolve()
      })
  }

  return Message
}