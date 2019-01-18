import { CronJob } from 'cron';
const debug = require('debug')('App:CRON')
import { Op } from 'sequelize';
const CronTasks = []

const tasks = {
  searchLogsToS3() {

  },
}

export function start() {
    // if (AppConfig.SAVE_SEARCH_LOG) {
    //   tasks.searchLogsToS3()
    //   CronTasks.push(new CronJob('00 00 * * * *', tasks.searchLogsToS3, null, true, 'America/New_York'))
    // }
    // if (AppConfig.GENERATE_SITEMAP) {
    //   tasks.generateSitemap()
    //   CronTasks.push(new CronJob('00 00 02 * * *', tasks.generateSitemap, null, true, 'America/New_York'))
    // }
    // tasks.cleanUpCreationCache()
    // CronTasks.push(new CronJob('00 00 03 * * *', tasks.cleanUpCreationCache, null, true, 'America/New_York'))
    return CronTasks;
}
export function getTasks() {
    return CronTasks;
}
