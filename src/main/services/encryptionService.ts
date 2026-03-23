import { safeStorage } from "electron"
import type { EncryptionServiceLike } from "../core/types"

export function createEncryptionService(): EncryptionServiceLike {
  return {
    encrypt: (plainText: string) => {
      if (!plainText) return ""
      try {
        if (!safeStorage.isEncryptionAvailable()) {
          return plainText
        }
        return safeStorage.encryptString(plainText).toString("base64")
      } catch (err) {
        console.error("Encryption failed:", err)
        return plainText
      }
    },
    decrypt: (encryptedBase64: string) => {
      if (!encryptedBase64) return ""
      try {
        if (!safeStorage.isEncryptionAvailable()) {
          return encryptedBase64
        }
        return safeStorage.decryptString(Buffer.from(encryptedBase64, "base64"))
      } catch {
        return encryptedBase64
      }
    }
  }
}
