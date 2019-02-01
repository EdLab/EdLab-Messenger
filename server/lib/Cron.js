import { CronJob } from 'cron';
import moment from 'moment'
const CronTasks = []

const tasks = {
  sendScheduledEmails() {
    Logger.debug(`sendScheduledEmails called at ${ moment() }`)
    return Process
      .findOne({
        where: {
          name: 'sendScheduledEmails',
        },
      })
      .then(process => {
        if (!process || !process.is_running) {
          return process
            .update({ is_running: true })
            .then(() => Email.sendScheduledEmails())
            .finally(() => process.update({ is_running: false }))
        }
        Logger.debug('sendScheduledEmails process skipped as it is already running')
      })
      .catch(error => Logger.error(error))
  },
  updateStatusLogs() {
    Logger.debug(`updateStatusLogs called at ${ moment() }`)
    return Process
      .findOne({
        where: {
          name: 'updateStatusLogs',
        },
      })
      .then(process => {
        if (!process || !process.is_running) {
          return process
            .update({ is_running: true })
            .then(() => StatusLog.updateStatuses())
            .finally(() => process.update({ is_running: false }))
        }
        Logger.debug('updateStatusLogs process skipped as it is already running')
      })
      .catch(error => Logger.error(error))
  },
}

export function start() {
  if (AppConfig.ENABLE_CRON) {
    CronTasks.push(new CronJob('00 */10 * * * *', tasks.sendScheduledEmails, null, true, 'America/New_York'))
    CronTasks.push(new CronJob('00 5,15,25,35,45,55 * * * *', tasks.updateStatusLogs, null, true, 'America/New_York'))
  }
  return CronTasks;
}
export function getTasks() {
  return CronTasks;
}
