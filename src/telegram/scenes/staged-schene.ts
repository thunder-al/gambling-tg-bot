import {Composer, MiddlewareFn} from 'telegraf'
import {AppContext} from '@/telegram/context.ts'


export function createStagedScene<C extends AppContext = AppContext>(name: string) {
  const stages = new Map<string, Composer<C>>()
  const enterHandlers: MiddlewareFn<C>[] = []

  function setStage(stageName: string, stage: Composer<C>) {
    stages.set(stageName, stage)
  }

  function stage(stageName: string) {
    const stage = stages.get(stageName)
    if (stage) {
      return stage
    }

    const newStage = new Composer<C>()
    stages.set(stageName, newStage)
    return newStage
  }

  function defaultStage() {
    return stage('default')
  }

  function global() {
    return stage('_global')
  }

  function onEnter(handler: MiddlewareFn<C>) {
    enterHandlers.push(handler)
  }

  return {
    name,
    setStage,
    stage,
    defaultStage,
    onEnter,
    global,
    handlers: {
      enterHandlers,
    },
    middleware(): MiddlewareFn<C> {
      return Composer.optional(
        ctx => ctx.sceneState?.name === name,
        global(),
        (ctx, next) => {
          if (ctx.sceneState?.name !== name) {
            return next()
          }

          const stageName = ctx.sceneState?.stage || 'default'
          const stage = stages.get(stageName)
          if (!stage || ctx.sceneState?.name !== name) {
            return next()
          }

          Composer.unwrap(stage)(ctx, async () => {
            // noop
          })
        },
      )
    },
  }
}