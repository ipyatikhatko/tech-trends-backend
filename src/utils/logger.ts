export const logger = {
  info: (message: string, ...args: (string | number | object)[]): void => {
    console.log(`[INFO] ${message}`, ...args)
  },
  error: (message: string, ...args: (string | number | object)[]): void => {
    console.error(`[ERROR] ${message}`, ...args)
  },
  debug: (message: string, ...args: (string | number | object)[]): void => {
    console.debug(`[DEBUG] ${message}`, ...args)
  },
}
