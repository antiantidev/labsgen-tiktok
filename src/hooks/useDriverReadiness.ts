import { useCallback } from 'react'
import type { DriverBootstrapResult } from '../shared/ipc/contracts'
import { useApiBridge } from './useApiBridge'
import { useCoreStore } from '../stores'

type DriverReadinessDeps = {
  t: (key: string) => string
  showModal: (title: string, body: string, buttons?: Array<{ label: string; value: string; primary?: boolean }>) => Promise<{ value: string }>
  showChromeMissingModal: () => Promise<void>
  pushToast: (message: string, type?: string, duration?: number) => void
}

type DriverReadinessResult = {
  ok: boolean
  alreadyExists?: boolean
  canceled?: boolean
  chromeMissing?: boolean
  failed?: boolean
}

export const useDriverReadiness = ({
  t,
  showModal,
  showChromeMissingModal,
  pushToast
}: DriverReadinessDeps) => {
  const api = useApiBridge()
  const setIsLoading = useCoreStore((state) => state.setIsLoading)
  const setLoadingMessage = useCoreStore((state) => state.setLoadingMessage)
  const setIsDriverMissing = useCoreStore((state) => state.setIsDriverMissing)

  return useCallback(async (): Promise<DriverReadinessResult> => {
    const driverExists = await api.checkDriverExists()
    if (driverExists) {
      setIsDriverMissing(false)
      return { ok: true, alreadyExists: true }
    }

    const choice = await showModal(
      t('driver.missing_title'),
      t('driver.missing_desc'),
      [
        { label: t('common.cancel'), value: 'cancel', primary: false },
        { label: t('driver.download_now'), value: 'download', primary: true }
      ]
    )

    if (choice.value !== 'download') {
      setIsDriverMissing(true)
      return { ok: false, canceled: true }
    }

    setIsLoading(true)
    setLoadingMessage(t('driver.preparing'))
    const res: DriverBootstrapResult = await api.bootstrapDriver()
    setIsLoading(false)

    if (res.ok) {
      setIsDriverMissing(false)
      return { ok: true, alreadyExists: false }
    }

    if (res.code === 'CHROME_NOT_FOUND') {
      await showChromeMissingModal()
      setIsDriverMissing(true)
      return { ok: false, chromeMissing: true }
    }

    pushToast(res.error || t('common.error'), 'error')
    return { ok: false, failed: true }
  }, [
    pushToast,
    setIsLoading,
    setLoadingMessage,
    showChromeMissingModal,
    showModal,
    t
  ])
}
