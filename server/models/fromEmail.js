export default function (sequelize, DataTypes) {
  const FromEmail = sequelize.define('from_email', {
    sender: {
      type: DataTypes.STRING(64),
      allowNull: false,
      unique: true,
    },
    email: {
      type: DataTypes.STRING(64),
      allowNull: false,
      unique: true,
    },
  }, {
    underscored: true,
    hooks: {},
  })

  FromEmail.associate = (models) => {
    FromEmail.hasMany(models.email, {
      onDelete: 'RESTRICT'
    })
  }

  FromEmail.prototype.getEmailAddress = function() {
    return `${ this.sender } <${ this.email }>`
  }

  return FromEmail
}