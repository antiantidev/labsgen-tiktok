import type { ApiBridge } from "./shared/ipc/contracts"

declare global {
  interface Window {
    api: ApiBridge
  }
}

export {}
