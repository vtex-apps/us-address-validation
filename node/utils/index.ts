/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-explicit-any */
import * as crypto from 'crypto'

import type { AxiosError } from 'axios'
import { AuthenticationError, ForbiddenError, UserInputError } from '@vtex/api'

export const toHash = (obj: any) => {
  return crypto.createHash('md5').update(JSON.stringify(obj)).digest('hex')
}

export function statusToError(e: any) {
  if (!e.response) {
    throw e
  }

  const { response } = e as AxiosError
  const { status } = response!

  if (status === 401) {
    throw new AuthenticationError(e)
  }

  if (status === 403) {
    throw new ForbiddenError(e)
  }

  if (status === 400) {
    throw new UserInputError(e)
  }

  throw e
}
