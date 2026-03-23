import { useCallback } from 'react'

export const useDriverReadiness = ({
  t,
  showModal,
  showChromeMissingModal,
  pushToast,
  setIsLoading,
  setLoadingMessage,
  setIsDriverMissing
}) => {
  return useCallback(async () => {
    const driverExists = await window.api.checkDriverExists()
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
    const res = await window.api.bootstrapDriver()
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
    setIsDriverMissing,
    setIsLoading,
    setLoadingMessage,
    showChromeMissingModal,
    showModal,
    t
  ])
}
