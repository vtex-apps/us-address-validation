import type { InstanceOptions, IOContext } from '@vtex/api'
import { JanusClient } from '@vtex/api'

export class SmartyStreets extends JanusClient {
  constructor(ctx: IOContext, options?: InstanceOptions) {
    super(ctx, {
      ...options,
      headers: {
        ...(ctx.adminUserAuthToken
          ? {
              VtexIdclientAutCookie: ctx.adminUserAuthToken,
            }
          : {}),
      },
    })
  }
}
