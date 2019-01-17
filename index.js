import app from './app';
import { createServer } from 'http';
const server = createServer(app)

const PORT = process.env.PORT || AppConfig.PORT || 8000
server.listen(PORT)
Logger.info(`Started on port ${PORT} in ${AppConfig.env} mode`)

process.on('uncaughtException', (err) => {
  Logger.error(`${(new Date()).toUTCString()} uncaughtException:`, err.message)
  Logger.error(err.stack)
  process.exit(1)
})

export default app
