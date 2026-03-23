import { useEffect } from "react"
import type { ThemeMode } from "../shared/domain/app"

export const useThemeClassSync = (theme: ThemeMode): void => {
  useEffect(() => {
    document.documentElement.classList.toggle("light", theme === "light")
  }, [theme])
}
