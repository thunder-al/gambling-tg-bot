import {Command, createCommand} from 'commander'

export interface ICLICommandModule {
  default?: (program: Command) => void
}

const cliModules = import.meta.glob<ICLICommandModule>('./*-command.ts', {eager: true})

const program = createCommand('node start.mjs')

for (const mod of Object.values(cliModules)) {
  const func = mod.default
  if (!func) {
    continue
  }

  func(program)
}

export async function runCli() {
  await program.parseAsync()
}
