import CryptoJS from 'crypto-js'

export default function (sequelize, DataTypes) {
  const User = sequelize.define('user', {
    uid: {
      type: DataTypes.STRING(128),
      allowNull: false,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING(128),
      allowNull: false,
      unique: true,
    },
    firstname: {
      type: DataTypes.STRING(128),
      allowNull: false,
    },
    lastname: {
      type: DataTypes.STRING(128),
      allowNull: false,
    },
    username: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
  }, {
    timestamps: false,
  })

  User.prototype.getEmailAddress = function () {
    return `${ this.firstname } ${ this.lastname } <${ this.email }>`
  }

  User.prototype.getUnsubscribeLink = function (subscriptionListId) {
    const prefix = `${ AppConfig.HOST_URL }subscription_lists/${ subscriptionListId }/unsubscribe`
    const unsubscribeKey = CryptoJS.AES.encrypt(this.email, AppConfig.UNSUBSCRIBE_SECRET).toString()
    return `${ prefix }/${ unsubscribeKey }`
  }

  User.getUserFromUnsubscribeKey = function (unsubscribeKey) {
    const bytes  = CryptoJS.AES.decrypt(unsubscribeKey, AppConfig.UNSUBSCRIBE_SECRET)
    const email = bytes.toString(CryptoJS.enc.Utf8)
    return User
      .findOne({
        where: {
          email: email,
        },
      })
  }

  return User
}
