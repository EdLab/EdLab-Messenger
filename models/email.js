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
      to_emails: {
        type: DataTypes.TEXT('long'),
        allowNull: false,
      },
      cc_emails: {
        type: DataTypes.STRING(1024),
        allowNull: true,
      },
      bcc_emails: {
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
      from_email: {
        type: DataTypes.STRING(64),
        allowNull: false,
      },
    }, {
      underscored: true,
      hooks: {
        afterCreate(email) {
          if (email.scheduled_at === null) {
            email.send()
          }
        }
      },
      classMethods: {
        associate(models) {
          Email.hasMany(models.message, {
            onDelete: 'RESTRICT',
          })
        },
        sendScheduledEmails() {
          const now = moment()
          Email
            .findAll({
              where: {
                scheduled_at: {
                  [Op.gte]: now.subtract(10, 'minutes'),
                  [Op.lt]: now,
                }
              }
            })
            .then(emails => {
              const len = emails.length
              let noSuccess = 0
              let noFailed = 0
              const send = () => {
                `Email (id: ${ result.id }) sending starting at ${ moment() }`;
                return emails[noSuccess + noFailed]
                  .send()
                  .then(result => {
                    noSuccess++
                    Logger.log(
                      `Email sending completed at ${ result.completed_at };
                       id: ${ result.id };
                       ${ result.noSuccess } successfully sent messages;
                       ${ result.noFailed } failed messges`
                    )
                    if (i + 1 === len) {
                      Logger.log(`Sent ${ len } emails: ${ noSuccess } successes, ${ noFailed } failures`)
                      return Promise.resolve()
                    }
                    return send(i + 1)
                  })
                  .catch(error => {
                    noFailed++
                    Logger.log(error)
                    if (noSuccess + noFailed === len) {
                      Logger.log(`Sent ${ len } emails: ${ noSuccess } successes, ${ noFailed } failures`)
                      return Promise.resolve()
                    }
                    return send(i + 1)
                  })
              }
              send()
            })
        }
      },
      instanceMethods: {
        send(email) {
          if (email.completed_at) {
            return Promise.reject(`Email with id: ${ email.id } completed at ${ email.completed_at }`)
          }
          const to_emails = email.to_emails.split(',')
          const len = to_emails.length
          let sleepTime
          let startTime
          let sendRate
          let noSuccess = 0
          let noFailed = 0
          const sendMessage = () => {
            const next = () => {
              if (noSuccess + noFailed === len) {
                const completed_at = moment()
                return email
                  .update({ completed_at: completed_at })
                  .then(() => {
                    return Promise.resolve({
                      id: email.id,
                      completed_at: completed_at,
                      noSuccess: noSuccess,
                      noFailed: noFailed
                    })
                  })
              }
              if ((noSuccess + noFailed) / moment().diff(startTime, 'seconds') >= sendRate) {
                return new Promise(() => {
                  setTimeout(() => {
                    return sendMessage()
                  }, sleepTime)
                })
              } else { return sendMessage() }
            }
            return Message
              .send(email, to_emails[noSuccess + noFailed])
              .then(result => {
                const statusLog = result.statusLog
                Logger.log(
                  `Sent message successfully;
                   ses_id: ${ result.message.ses_id };
                   status: ${ statusLog.status };
                   sending completed at ${ statusLog.status_at }`
                )
                noSuccess++
                next()
              })
              .catch(error => {
                Logger.log(`Message sending failed: ${ error }`)
                noFailed++
                next()
              })
          }
          return ses
            .getSendQuota()
            .promise()
            .then(data => {
              sendRate = data.MaxSendRate
              sleepTime = len / sendRate
              startTime = moment()
              return sendMessage()
            })
        }
      }
    })

    return Email
  }