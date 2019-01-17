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
      status: {
        type: DataTypes.STRING(16),
        allowNull: false,
        values: Object.values(Constants.EMAIL_STATUSES),
      },
      scheduled_at: {
        type: DataTypes.DATETIME,
        allowNull: true,
      },
      sent_at: {
        type: DataTypes.DATETIME,
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
          if (email.status === Constants.EMAIL_STATUSES.TO_SEND) {
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
          Email
            .findAll({
              where: {
                status: Constants.EMAIL_STATUSES.SCHEDULED,
                scheduled_at: {
                  [Op.gte]: new Date(),
                }
              }
            })
            .then(emails => {
              emails.forEach(email => email.send())
            })
        }
      },
      instanceMethods: {
        send(email) {
          if (email.status === Constants.EMAIL_STATUSES.SENT) {
            return
          }
          to_emails = email.to_emails.split(',')
          const promises = to_emails.map(to_email => {
            return Message.send(email, to_email)
          })
          // TODO: Send in batches instead of all at the same time
          Promise
            .all(promises)
            .then(() => {
              email
                .update({
                  status: Constants.EMAIL_STATUSES.SENT,
                  sent_at: new Date(),
                })
            })
        }
      }
    })

    return Email
  }