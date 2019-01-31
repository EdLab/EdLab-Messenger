import AWS from '../lib/AWS.js'
import moment from 'moment'

const ses = new AWS.SES()
const Op = SequelizeInst.Op

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
            `Email (id: ${ email.id }) sending starting at ${ moment() }`;
            email.send()
          }
        }
      },
    })

    Email.associate = (models) => {
      Email.hasMany(models.message, {
        onDelete: 'RESTRICT',
      })
      Email.belongsTo(models.subscription_list, {
        onDelete: 'RESTRICT',
        foreignKey: { allowNull: true },
      })
      Email.belongsTo(models.from_email, {
        onDelete: 'RESTRICT',
        foreignKey: { allowNull: false },
      })
    }

    Email.sendScheduledEmails = () => {
      return new Promise((resolve, reject) => {
        const end = moment()
        const start = moment(end).subtract(10, 'minutes')
        return Email
          .findAll({
            where: {
              scheduled_at: {
                [Op.gt]: start,
                [Op.lte]: end,
              }
            }
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
          .catch(error => {
            Logger.error(error)
            return reject(error)
          })
      })
    }

    Email.prototype.send = function () {
      return new Promise((resolve, reject) => {
        if (this.completed_at) {
          return reject(`Email with id: ${ this.id } completed at ${ this.completed_at }`)
        }
        let to_users, cc_emails, bcc_emails, from_email_address
        let sleepTime, startTime, sendRate, timeDiff
        let noSuccess = 0
        let noFailed = 0
        const sendMessages = () => {
          if ((noSuccess + noFailed) % 100 === 0) {
            Logger.debug(`Success: ${ noSuccess }, Failure: ${ noFailed } / ${ to_users.length } messages in ${ timeDiff } seconds`)
          }
          if (noSuccess + noFailed === to_users.length) {
            const completed_at = moment()
            this.update({ completed_at: completed_at })
            Logger.debug(
              `Email sending completed at ${ completed_at.toString() };
               id: ${ this.id };
               ${ noSuccess } successfully sent messages;
               ${ noFailed } failed messges`
            )
            return resolve()
          }
          return Message
            .send(this, to_users[noSuccess + noFailed], from_email_address, cc_emails, bcc_emails)
            .then(() => {
              noSuccess++
              const noSent = noSuccess + noFailed
              timeDiff = moment().diff(startTime, 'seconds')
              if ((noSent) / timeDiff >= sendRate) {
                // Logger.debug(`Creating timeout; sent: ${noSent}; time: ${ timeDiff } sec; rate: ${ sendRate }`)
                return new Promise(() => {
                  setTimeout(() => {
                    return sendMessages()
                  }, sleepTime)
                })
              } else { return sendMessages() }
            })
            .catch(error => {
              // Logger.debug(`Message sending failed: ${ error }`)
              noFailed++
              const noSent = noSuccess + noFailed
              timeDiff = moment().diff(startTime, 'seconds')
              if ((noSent) / timeDiff >= sendRate) {
                // Logger.debug(`Creating timeout; sent: ${noSent}; time: ${ timeDiff } sec; rate: ${ sendRate }`)
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
              'id', 'subject', 'html', 'to_user_uids', 'cc_user_uids', 'bcc_user_uids',
              'subscription_list_id', 'from_email_id'
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
                ]
              },
              {
                model: FromEmail,
                attributes: ['id', 'sender', 'email'],
              },
            ],
          })
          .then(email => {
            from_email_address = email.from_email.getEmailAddress()
            let to_user_uids = email.to_user_uids
            if (!to_user_uids) {
              const subscriptions = email.subscription_list.subscriptions
              to_user_uids = subscriptions.map(s => s.user_uid)
            }
            const cc_user_uids = email.cc_user_uids ? email.cc_user_uids.split(',') : []
            const bcc_user_uids = email.bcc_user_uids ? email.bcc_user_uids.split(',') : []
            const userOptions = (user_uids = []) => {
              return {
                where: {
                  uid: {
                    [Op.in]: user_uids
                  }
                },
                attributes: ['uid', 'email', 'firstname', 'lastname', 'username'],
              }
            }
            const toUsersPromise = User
              .findAll(userOptions(to_user_uids))
              .then(users => {
                to_users = users
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
            sendRate = data.MaxSendRate
            sleepTime = to_users.length / sendRate
            startTime = moment()
            Logger.debug(`Send rate: ${ sendRate }; Sleep time: ${ sleepTime }`)
            return sendMessages()
          })
          .catch(error => Logger.error(error))
      })
    }

    return Email
  }