import {Context} from 'telegraf'
import type {Update} from 'telegraf/types'
import {i18n} from '@/i18n'
import {DbEntity} from '@/db/database.ts'
import {createStagedScene} from '@/telegram/scenes/staged-schene.ts'

export interface SceneState {
  name: string
  stage: string
  session: Record<string, any>
}

export class AppContext<U extends Update = Update> extends Context<U> {

  public user!: Readonly<DbEntity<'users'>>

  public session!: Record<string, any>

  public t(key: string | Array<string>, data: Record<string, string | number> = {}) {
    return i18n.t(key, {
      lng: this.from?.language_code ?? 'en',
      ...data,
    })
  }

  public replyI18n(
    key: string | Array<string>,
    data: Record<string, string | number> = {},
    extra: Parameters<Context['replyWithHTML']>[1] = {},
  ) {
    const text = this.t(key, data)
    return this.replyWithHTML(text, extra)
  }

  get sceneState() {
    return (this.session as any).scene as SceneState | null
  }

  set sceneState(value: SceneState | null) {
    (this.session as any).scene = value
  }

  setScheneStage(stage: string) {
    if (!this.sceneState) {
      throw new Error('No scene in context')
    }

    this.sceneState.stage = stage
  }

  public async enterScene(scene: ReturnType<typeof createStagedScene>) {

    this.sceneState = {
      name: scene.name,
      stage: 'default',
      session: {},
    }

    for (const handler of scene.handlers.enterHandlers) {
      await handler(this as any, async () => {
        // noop
      })
    }
  }

  public leaveScene() {
    (this.session as any).scene = null
  }

}