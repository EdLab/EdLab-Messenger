import { CronJob } from 'cron';
import moment from 'moment'
const debug = require('debug')('App:CRON')
const CronTasks = []

const tasks = {
  sendScheduledEmails() {
    debug(`sendScheduledEmails called at ${ moment() }`)
    return Email.sendScheduledEmails()
  },
  updateStatusLogs() {
    debug(`updateStatusLogs called at ${ moment() }`)
    return StatusLog.updateStatuses()
  },
}

export function start() {
  if (AppConfig.ENABLE_CRON) {
    CronTasks.push(new CronJob('00 */10 * * * *', tasks.sendScheduledEmails, null, true, 'America/New_York'))
    // CronTasks.push(new CronJob('00 5,15,25,35,45,55 * * * *', tasks.updateStatusLogs, null, true, 'America/New_York'))
    CronTasks.push(new CronJob('00 20 17 * * *', tasks.updateStatusLogs, null, true, 'America/New_York'))
  }
  return CronTasks;
}
export function getTasks() {
  return CronTasks;
}
