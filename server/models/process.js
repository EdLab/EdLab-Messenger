export default function (sequelize, DataTypes) {
  const Process = sequelize.define('process', {
    name: {
      type: DataTypes.STRING(64),
      allowNull: false,
      unique: true,
    },
    is_running: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  }, {
    underscored: true,
    hooks: {},
  })

  return Process
}
