import fs from 'fs'
import Sequelize from 'sequelize'
import { highlight } from 'cli-highlight'
import { green, gray, yellow, magenta } from 'chalk'
const debug = require('debug')('DB:SequelizeInst')

export default function (DBConfig) {
  return new Sequelize(
    DBConfig.database,
    DBConfig.username,
    DBConfig.password, {
      host: DBConfig.host,
      dialect: DBConfig.dialect,
      dialectOptions: {
        ssl: {
          ca: fs.readFileSync(__dirname + '/rds-combined-ca-bundle.pem'),
        },
      },
      define: {
        charset: 'utf8mb4',
        collate: 'utf8mb4_general_ci',
      },
      logging: (log) => {
        debug(highlight(log, {
          theme: {
            keyword: green.bold,
            addition: green,
            deletion: gray,
            literal: yellow,
            string: gray,
            number: magenta,
          },
          language: 'sql',
          ignoreIllegals: true,
        }))
      },
      pool: {
        max: 20,
        min: 2,
        idle: 20000,
        idleTimeoutMillis: 25000,
        acquire: 20001,
        maxIdleTime: 25600,
      },
    }
  )
}
