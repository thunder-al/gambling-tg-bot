export function onShutdown(fn: (code: string) => void | Promise<void>) {
  process.on('SIGINT', () => fn('SIGINT'))
  process.on('SIGTERM', () => fn('SIGTERM'))
  process.on('SIGHUP', () => fn('SIGHUP'))
}
