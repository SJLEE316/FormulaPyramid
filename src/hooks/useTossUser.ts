import { useState, useEffect } from 'react'
import { getUserKeyForGame } from '@apps-in-toss/web-framework'

export type TossUserState =
  | { status: 'loading' }
  | { status: 'hash'; hash: string }
  | { status: 'fallback' } // 토스앱 외 환경

export function useTossUser(): TossUserState {
  const [state, setState] = useState<TossUserState>({ status: 'loading' })

  useEffect(() => {
    getUserKeyForGame().then((result) => {
      if (!result || result === 'INVALID_CATEGORY' || result === 'ERROR') {
        setState({ status: 'fallback' })
        return
      }
      if (result.type === 'HASH') {
        setState({ status: 'hash', hash: result.hash })
      } else {
        setState({ status: 'fallback' })
      }
    }).catch(() => {
      setState({ status: 'fallback' })
    })
  }, [])

  return state
}
