import AWS from '../lib/AWS.js'
import moment from 'moment'
import axios from 'axios'

const ses = new AWS.SES()
const { Op } = require('sequelize')

export default function (sequelize, DataTypes) {
  const Email = sequelize.define('email', {
    subject: {
      type: DataTypes.STRING(1024),
      allowNull: false,
    },
    html: {
      type: DataTypes.TEXT('long'),
      allowNull: false,
    },
    to_user_emails: {
      type: DataTypes.TEXT('long'),
      allowNull: true,
    },
    to_user_uids: {
      type: DataTypes.TEXT('long'),
      allowNull: true,
    },
    cc_user_uids: {
      type: DataTypes.STRING(1024),
      allowNull: true,
    },
    bcc_user_uids: {
      type: DataTypes.STRING(1024),
      allowNull: true,
    },
    scheduled_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    completed_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  }, {
    underscored: true,
    hooks: {
      afterCreate(email) {
        if (!email.scheduled_at) {
          Logger.debug(`Email (id: ${ email.id }) sending starting at ${ moment() }`)
          email.send()
        }
      },
    },
  })

  Email.associate = (models) => {
    Email.hasMany(models.message, {
      onDelete: 'RESTRICT',
    })
    Email.belongsTo(models.subscription_list, {
      onDelete: 'RESTRICT',
      foreignKey: { allowNull: true, name: 'subscription_list_id' },
    })
    Email.belongsTo(models.from_email, {
      onDelete: 'RESTRICT',
      foreignKey: { allowNull: false, name: 'from_email_id' },
    })
  }

  Email.sendScheduledEmails = () => {
    return new Promise((resolve) => {
      const end = moment()
      return Email
        .findAll({
          where: {
            scheduled_at: { [Op.lte]: end },
            completed_at: null,
          },
        })
        .then(emails => {
          const len = emails.length
          let noSuccess = 0
          let noFailed = 0
          const send = () => {
            if (noSuccess + noFailed === len) {
              Logger.debug(`Sent ${ len } emails: ${ noSuccess } successes, ${ noFailed } failures`)
              return resolve()
            }
            Logger.debug(`Email (id: ${ emails[noSuccess + noFailed].id }) sending starting at ${ moment() }`)
            return emails[noSuccess + noFailed]
              .send()
              .then(() => {
                noSuccess++
                return send(noSuccess + noFailed)
              })
              .catch(error => {
                noFailed++
                Logger.error(error)
                return send(noSuccess + noFailed)
              })
          }
          return send()
        })
        .catch(error => Logger.error(error))
    })
  }

  Email.prototype.send = function () {
    return new Promise((resolve, reject) => {
      if (this.completed_at) {
        return reject(`Email with id: ${ this.id } completed at ${ this.completed_at }`)
      }
      let to_users = [], to_emails = [], cc_emails = [], bcc_emails = [], from_email_address, length
      let sleepTime, startTime, sendRate
      let timeDiff = 0
      let noSuccess = 0
      let noFailed = 0
      const sendMessages = () => {
        const idx  = noSuccess + noFailed
        if (idx % 100 === 0) {
          Logger.debug(`Success: ${ noSuccess }, Failure: ${ noFailed } / ${ length } messages in ${ timeDiff } seconds`)
        }
        if (idx === length) {
          const completed_at = moment()
          this.update({ completed_at: completed_at })
          const logMessage = `Email sending completed at ${ completed_at.toString() };
            id: ${ this.id };
            ${ noSuccess } successfully sent messages;
            ${ noFailed } failed messages`
          Logger.debug(logMessage)
          axios.post(AppConfig.SLACK_NOTIFIER_API, { text: `MESSENGER: ${ logMessage }` })
          return resolve()
        }
        return Message
          .send(this, to_users[idx] || to_emails[idx], from_email_address, cc_emails, bcc_emails)
          .then(() => {
            noSuccess++
            timeDiff = moment().diff(startTime, 'seconds')
            if ((idx) / timeDiff >= sendRate) {
              return new Promise(() => {
                setTimeout(() => {
                  return sendMessages()
                }, sleepTime)
              })
            } else { return sendMessages() }
          })
          .catch(error => {
            const to_user = to_users[idx]
            Logger.error(`Message sending failed: ${ error }; user uid: ${ to_user.uid }; email id: ${ to_user.email }`)
            noFailed++
            timeDiff = moment().diff(startTime, 'seconds')
            if ((idx) / timeDiff >= sendRate) {
              return new Promise(() => {
                setTimeout(() => {
                  return sendMessages()
                }, sleepTime)
              })
            } else { return sendMessages() }
          })
      }
      return Email
        .findByPk(this.id, {
          attributes: [
            'id', 'subject', 'html', 'to_user_emails', 'to_user_uids', 'cc_user_uids', 'bcc_user_uids',
            'subscription_list_id', 'from_email_id',
          ],
          include: [
            {
              model: SubscriptionList,
              attributes: ['id', 'name', 'description'],
              include: [
                {
                  model: Subscription,
                  attributes: ['id', 'user_uid'],
                },
              ],
            },
            {
              model: FromEmail,
              attributes: ['id', 'sender', 'email'],
            },
          ],
        })
        .then(email => {
          from_email_address = email.from_email.getEmailAddress()
          let to_user_uids = []
          if (email.to_user_emails) {
            to_emails = email.to_user_emails.split(',')
            length = to_emails.length
          } else if (email.to_user_uids) {
            to_user_uids = email.to_user_uids.split(',')
          } else {
            const subscriptions = email.subscription_list.subscriptions
            to_user_uids = subscriptions.map(s => s.user_uid)
          }
          const cc_user_uids = email.cc_user_uids ? email.cc_user_uids.split(',') : []
          const bcc_user_uids = email.bcc_user_uids ? email.bcc_user_uids.split(',') : []
          const userOptions = (user_uids = [], sent_uids = []) => {
            return {
              where: {
                uid: {
                  [Op.in]: user_uids,
                  [Op.notIn]: sent_uids,
                },
              },
              attributes: ['uid', 'email', 'firstname', 'lastname', 'username'],
            }
          }
          const toUsersPromise = Message
            .findAll({
              where: {
                email_id: email.id,
              },
            })
            .then(messages => {
              const sent_user_uids = messages.map(m => m.to_user_uid)
              return User
                .findAll(userOptions(to_user_uids, sent_user_uids))
                .then(users => {
                  to_users = users
                })
            })
          const ccUsersPromise = User
            .findAll(userOptions(cc_user_uids))
            .then(users => {
              cc_emails = users.map(u => u.getEmailAddress())
            })
          const bccUsersPromise = User
            .findAll(userOptions(bcc_user_uids))
            .then(users => {
              bcc_emails = users.map(u => u.getEmailAddress())
            })
          return Promise.all([toUsersPromise, ccUsersPromise, bccUsersPromise])
        })
        .then(() => {
          return ses.getSendQuota().promise()
        })
        .then(data => {
          length = to_users.length
          sendRate = data.MaxSendRate
          sleepTime = length / sendRate
          startTime = moment()
          Logger.debug(`Send rate: ${ sendRate }; Sleep time: ${ sleepTime }`)
          return sendMessages()
        })
        .catch(error => Logger.error(error))
    })
  }
  return Email
}