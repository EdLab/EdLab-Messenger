import moment from 'moment'
import { format as _format, createLogger, transports as _transports } from 'winston'
const { combine, timestamp, printf, colorize } = _format

function logger() {
  const Logger = createLogger({
    exitOnError: false,
    level: AppConfig.LOG_LEVEL,
    format: combine(
      timestamp(),
      colorize(),
      printf(info => {
        const isError = info instanceof Error
        let output = `${moment(info.timestamp).format('YYYY-MM-DD HH:mm:ss')} ${info.level}: ${info.message}`
        if (isError) {
          output += `\n${info.stack}`
        }
        return output
      })

    ),
    transports: [
      new _transports.Console({ handleExceptions: true }),
    ],

  })
  Logger.debug(`Current Winston Logger Level: ${Logger.level}`)
  return Logger
}

export default logger
