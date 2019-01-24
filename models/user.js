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

  return User
}
