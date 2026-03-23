import test from "node:test"
import assert from "node:assert/strict"
import fs from "node:fs"
import os from "node:os"
import path from "node:path"
import { DriverService } from "./driverService.ts"

test("checkDriver returns false when Chrome is missing", async () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "labsgen-driver-"))
  const svc = new DriverService(process.cwd(), tmp)

  fs.mkdirSync(path.join(tmp, "drivers", "chromedriver-win64"), { recursive: true })
  fs.writeFileSync(path.join(tmp, "drivers", "chromedriver-win64", "chromedriver.exe"), "")
  fs.writeFileSync(
    path.join(tmp, "drivers", "chromedriver.json"),
    JSON.stringify({
      chromeVersion: "146.0.7680.154",
      chromeMajor: "146",
      driverVersion: "146.0.7680.153"
    })
  )

  const svcMutable = svc as unknown as {
    chromeVersionResolver: () => { chromePath: string | null; version: string } | null
  }
  svcMutable.chromeVersionResolver = () => null

  const ready = await svc.checkDriver()
  assert.equal(ready, false)
})

test("setupDriver throws a structured error when Chrome is missing", async () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "labsgen-driver-"))
  const svc = new DriverService(process.cwd(), tmp)
  const svcMutable = svc as unknown as {
    chromeVersionResolver: () => { chromePath: string | null; version: string } | null
    fetchManifest: () => Promise<unknown>
  }
  svcMutable.chromeVersionResolver = () => null
  svcMutable.fetchManifest = async () => {
    throw new Error("should not fetch manifest")
  }

  await assert.rejects(
    () => svc.setupDriver(),
    (err: unknown) => {
      return Boolean(
        err &&
          typeof err === "object" &&
          "code" in err &&
          (err as { code?: string }).code === "CHROME_NOT_FOUND"
      )
    }
  )
})
