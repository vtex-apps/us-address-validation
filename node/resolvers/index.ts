/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from 'axios'

const getAppId = (): string => {
  return process.env.VTEX_APP_ID ?? ''
}

const getUrlParameter = (path: string, sParam: string) => {
  const results = new RegExp(`[\?&]${sParam}=([^&#]*)`).exec(path)

  if (results == null) {
    return null
  }

  return decodeURI(results[1]) || 0
}

export const resolvers = {
  Routes: {
    smartystreets: async (ctx: Context) => {
      const {
        clients: { apps },
        vtex: {},
       request: { url },
      } = ctx

      ctx.set('Content-Type', 'application/json')
      ctx.set('Cache-Control', 'no-cache, no-store')

      const app: string = getAppId()
      const accountSettings = await apps.getAppSettings(app)

      if (!accountSettings.authId || !accountSettings.authToken) {
        ctx.response.body = false
      }

      const street = getUrlParameter(url, 'street')
      const city = getUrlParameter(url, 'city')
      const state = getUrlParameter(url, 'state')
      const zipcode = getUrlParameter(url, 'zipcode')

      const { data: validatedAddress } = await axios.get(
      `https://us-street.api.smartystreets.com/street-address?candidates=2&street=${street}&city=${city}&state=${state}&zipcode=${zipcode}&match=enhanced&auth-id=${accountSettings.authId}&auth-token=${accountSettings.authToken}`
      )

      ctx.response.status = 200
      ctx.response.body = validatedAddress
    },
  },
}
