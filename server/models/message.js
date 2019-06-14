import format from 'string-template'
import createTextVersion from 'textversionjs'
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
    },
    to_user_email: {
      type: DataTypes.STRING(128),
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
    let html, subject, to_email
    const message = {
      email_id: email.id,
    }
    if (to_user instanceof User) {
      const user = to_user.get({ plain: true })
      if (email.subscription_list_id) {
        user.unsubscribeLink = to_user.getUnsubscribeLink(email.subscription_list_id)
      }
      html = format(email.html, user)
      subject = format(email.subject, user)
      to_email = to_user.getEmailAddress()
      message.to_user_uid = to_user.uid
    } else {
      html = email.html
      subject = email.subject
      to_email = to_user
      message.to_user_email = to_email
    }
    return ses
      .sendEmail({
        Destination: {
          BccAddresses: bcc_emails,
          CcAddresses: cc_emails,
          ToAddresses: [to_email],
        },
        Message: {
          Subject: { Data: subject },
          Body: {
            Html: { Data: html },
            Text: { Data: createTextVersion(html) },
          },
        },
        Source: from_email_address,
        ConfigurationSetName: AppConfig.SES_CONFIGURATION_SET,
      })
      .promise()
      .then(data => {
        message.ses_id = data.MessageId
        Message
          .create(message)
          .catch(error => {
            Logger.error(`Saving sent message failed: ${ error }`)
          })
        return Promise.resolve()
      })
      .catch(error => {
        Logger.error(`Message sending failed: ${ error }`)
      })
  }

  return Message
}