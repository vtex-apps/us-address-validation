import { IOClients } from '@vtex/api'

import { SmartyStreets } from './smartystreets'

// Extend the default IOClients implementation with our own custom clients.
export class Clients extends IOClients {
  public get smartystreets() {
    return this.getOrSet('smartystreets', SmartyStreets)
  }
}
