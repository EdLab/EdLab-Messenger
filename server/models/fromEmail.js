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
    hooks: {},
  })

  FromEmail.associate = (models) => {
    FromEmail.hasMany(models.email, {
      onDelete: 'RESTRICT',
    })
  }

  FromEmail.prototype.getEmailAddress = function() {
    return `${ this.sender } <${ this.email }>`
  }

  FromEmail.isVerified = emailId => {
    const domain = emailId.split('@')[1]
    return ses
      .listIdentities()
      .promise()
      .then(data => {
        const identitities = data.Identities
        if (identitities.indexOf(emailId) === -1 && identitities.indexOf(domain) === -1) {
          return Promise.resolve(false)
        }
        return Promise.resolve(true)
      })
      .catch(error => {
        Logger.error(`Fetching Identities failed: ${ error }`)
        return Promise.resolve(false)
      })
  }

  FromEmail.prototype.verify = function() {
    ses
      .verifyEmailIdentity({
        EmailAddress: this.email,
      })
      .promise()
      .then(data => {
        Logger.debug(`New sender email verification request sent for id ${ this.id }; ${ data }`)
      })
      .catch(error => {
        Logger.debug(`New sender email verification failed for id ${ this.id }; ${ error }`)
      })
  }

  FromEmail.prototype.unVerify = function() {
    ses
      .deleteIdentity({
        Identity: this.email,
      })
      .promise()
      .then(data => {
        Logger.debug(`Sender email verification deleted for id ${ this.id }; ${ data }`)
      })
      .catch(error => {
        Logger.debug(`Sender email verification removal failed for id ${ this.id }; ${ error }`)
      })
  }

  return FromEmail
}