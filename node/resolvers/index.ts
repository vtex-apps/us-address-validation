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

      console.log(street)


      const { data: validatedAddress } = await axios.get(
        `https://us-street.api.smartystreets.com/street-address?candidates=2&street=${street}&city=${city}&state=${state}&zipcode=${zipcode}&match=enhanced&auth-id=${accountSettings.authId}&auth-token=${accountSettings.authToken}`
      )

    //   const validatedAddress = [{
    //     "input_index": 0,
    //     "candidate_index": 0,
    //     "delivery_line_1": "2436 Tronjo Ter",
    //     "last_line": "Pensacola FL 32503-3469",
    //     "components": {
    //         "primary_number": "2436",
    //         "street_name": "Tronjo",
    //         "street_suffix": "Ter",
    //         "city_name": "Pensacola",
    //         "default_city_name": "Pensacola",
    //         "state_abbreviation": "FL",
    //         "zipcode": "32503",
    //         "plus4_code": "3469",
    //         "delivery_point": "36",
    //         "delivery_point_check_digit": "6"
    //     },
    //     "metadata": {
    //         "record_type": "S",
    //         "zip_type": "Standard",
    //         "county_fips": "12033",
    //         "county_name": "Escambia",
    //         "latitude": 30.45928,
    //         "longitude": -87.19182,
    //         "precision": "Zip9",
    //         "time_zone": "Central",
    //         "utc_offset": -6,
    //         "dst": true
    //     },
    //     "analysis": {
    //         "dpv_match_code": "Y",
    //         "dpv_footnotes": "AABB",
    //         "dpv_cmra": "N",
    //         "dpv_vacant": "N",
    //         "dpv_no_stat": "N",
    //         "active": "Y",
    //         "footnotes": "A#N#V#",
    //         "enhanced_match": "none"
    //     }
    // }]

      ctx.response.status = 200
      ctx.response.body = validatedAddress
    },
  },
}
