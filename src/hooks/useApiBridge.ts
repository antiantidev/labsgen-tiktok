import type { ApiBridge } from "../shared/ipc/contracts"

export const useApiBridge = (): ApiBridge => {
  return (window as unknown as { api: ApiBridge }).api
}

