export default function (sequelize, DataTypes) {
  const EmailId = sequelize.define('email_id', {
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
    classMethods: {
      associate(models) {
        EmailId.hasMany(models.subscription_list, {
          onDelete: 'CASCADE',
          foreignKey: {
            name: 'default_from',
            allowNull: true
          },
        })
      },
    },
    instanceMethods: {},
  })

  return EmailId
}