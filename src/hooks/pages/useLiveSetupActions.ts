import { useEffect, useRef, useState } from "react"
import type { MutableRefObject } from "react"
import { useAnimation } from "framer-motion"
import type { TFunction } from "i18next"
import type { LiveSetupPageProps } from "../../app/types"
import { useApiBridge } from "../useApiBridge"

type UseLiveSetupActionsDeps = Pick<
  LiveSetupPageProps,
  "saveConfig" | "pushToast" | "setShowSuggestions" | "setGameCategory" | "setGameMaskId" | "gameMaskId" | "gameCategory"
> & {
  t: TFunction
}

type UseLiveSetupActionsResult = {
  dropdownRef: MutableRefObject<HTMLDivElement | null>
  controls: ReturnType<typeof useAnimation>
  isSyncing: boolean
  localCount: number
  isInvalid: boolean
  handleSync: () => Promise<void>
  onSave: () => Promise<void>
  onSelectCategory: (cat: LiveSetupPageProps["suggestions"][number]) => void
}

export const useLiveSetupActions = ({
  t,
  saveConfig,
  pushToast,
  setShowSuggestions,
  setGameCategory,
  setGameMaskId,
  gameMaskId,
  gameCategory
}: UseLiveSetupActionsDeps): UseLiveSetupActionsResult => {
  const api = useApiBridge()
  const [isSyncing, setIsSyncing] = useState(false)
  const [localCount, setLocalCount] = useState(0)
  const controls = useAnimation()
  const dropdownRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    let isMounted = true
    const checkCount = async () => {
      const count = await api.getCategoryCount()
      if (isMounted) setLocalCount(count)
    }
    void checkCount()
    return () => {
      isMounted = false
    }
  }, [api])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target
      if (dropdownRef.current && target instanceof Node && !dropdownRef.current.contains(target)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [setShowSuggestions])

  const handleSync = async () => {
    setIsSyncing(true)
    const res = await api.syncCategories()
    if (res.ok) {
      setLocalCount(res.count ?? 0)
      if (pushToast) pushToast(t("setup.sync_success", { count: res.added }), "success")
    } else {
      if (pushToast) pushToast(res.error || t("common.error"), "error")
    }
    setIsSyncing(false)
  }

  const onSave = async () => {
    try {
      const success = await saveConfig(true)
      if (!success) {
        await controls.start({
          x: [-15, 15, -15, 15, -10, 10, -5, 5, 0],
          transition: { duration: 0.5, ease: "linear" }
        })
      }
    } catch (err) {
      console.error("Save error:", err)
      if (pushToast) pushToast(t("setup.save_error"), "error")
    }
  }

  const onSelectCategory = (cat: LiveSetupPageProps["suggestions"][number]) => {
    setGameCategory(cat.full_name)
    setGameMaskId(cat.game_mask_id)
    setShowSuggestions(false)
    if (pushToast) pushToast(`${t("common.ready")}: ${cat.full_name}`, "success")
  }

  return {
    dropdownRef,
    controls,
    isSyncing,
    localCount,
    isInvalid: !gameMaskId && gameCategory.trim().length > 0,
    handleSync,
    onSave,
    onSelectCategory
  }
}
