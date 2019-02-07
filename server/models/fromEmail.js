import AWS from '../lib/AWS.js'

const ses = new AWS.SES()

export default function (sequelize, DataTypes) {
  const FromEmail = sequelize.define('from_email', {
    sender: {
      type: DataTypes.STRING(64),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(64),
      allowNull: false,
    },
  }, {
    underscored: true,
    hooks: {
      afterCreate(fromEmail) {
        ses
          .verifyEmailIdentity({
            EmailAddress: fromEmail.email,
          })
          .promise()
          .then(data => {
            Logger.debug(`New sender email verification request sent for id ${ fromEmail.id }; ${ data }`)
          })
          .catch(error => {
            Logger.debug(`New sender email verification failed for id ${ fromEmail.id }; ${ error }`)
          })
      },
      afterDestroy(fromEmail) {
        ses
          .deleteIdentity({
            Identity: fromEmail.email,
          })
          .promise()
          .then(data => {
            Logger.debug(`Sender email verification deleted for id ${ fromEmail.id }; ${ data }`)
          })
          .catch(error => {
            Logger.debug(`Sender email verification removal failed for id ${ fromEmail.id }; ${ error }`)
          })
      },
    },
  })

  FromEmail.associate = (models) => {
    FromEmail.hasMany(models.email, {
      onDelete: 'RESTRICT',
    })
  }

  FromEmail.prototype.getEmailAddress = function() {
    return `${ this.sender } <${ this.email }>`
  }

  return FromEmail
}