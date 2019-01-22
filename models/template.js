export default function (sequelize, DataTypes) {
  const Template = sequelize.define('template', {
    name: {
      type: DataTypes.STRING(64),
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.STRING(256),
      allowNull: true,
    },
    subject: {
      type: DataTypes.STRING(1024),
      allowNull: true,
    },
    html: {
      type: DataTypes.TEXT('long'),
      allowNull: false,
    },
    fields: {
      type: DataTypes.STRING(256),
      allowNull: false,
    },
  }, {
    underscored: true,
    hooks: {},
    classMethods: {
      // associate(models) {},
    }
  })

  return Template
}