import type { App } from "electron"
import type {
  DBServiceLike,
  DriverServiceLike,
  EncryptionServiceLike,
  SeleniumTokenLike,
  StreamServiceLike,
  TokenServiceLike
} from "../types"
import { StreamService } from "../../services/streamlabs"
import { TokenService } from "../../services/tokenService"
import { DriverService } from "../../services/driverService"
import { DBService } from "../../services/dbService"
import { loadWebToken } from "../../services/seleniumToken"
import { createEncryptionService } from "../../services/encryptionService"

type ServiceConstructors = {
  StreamService: new () => StreamServiceLike
  TokenService: new () => TokenServiceLike
  DriverService: new (appPath: string, userDataPath: string) => DriverServiceLike
  DBService: new (userDataPath: string) => DBServiceLike
}

type ServiceBundle = {
  streamService: StreamServiceLike
  tokenService: TokenServiceLike
  driverService: DriverServiceLike
  dbService: DBServiceLike
  seleniumToken: SeleniumTokenLike
  encryptionService: EncryptionServiceLike
}

function loadServiceConstructors(): ServiceConstructors {
  return { StreamService, TokenService, DriverService, DBService }
}

export function createServiceBundle(app: App): ServiceBundle {
  const { StreamService, TokenService, DriverService, DBService } = loadServiceConstructors()
  const seleniumToken: SeleniumTokenLike = { loadWebToken }
  const encryptionService: EncryptionServiceLike = createEncryptionService()

  return {
    streamService: new StreamService(),
    tokenService: new TokenService(),
    driverService: new DriverService(app.getAppPath(), app.getPath("userData")),
    dbService: new DBService(app.getPath("userData")),
    seleniumToken,
    encryptionService
  }
}
