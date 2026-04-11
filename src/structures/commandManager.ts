import { BaseCommandManager } from '@tryforge/forgescript'
import { IMyExtensionEvents } from './eventManager'

export class MyExtensionCommandManager
    extends BaseCommandManager<keyof IMyExtensionEvents> {
    public handlerName = 'MyExtension'
}
