/** Ruby HtmlDialog bridge (window.sketchup). */

const BRIDGE_TIMEOUT_MS = 4000

export function hasSketchupBridge() {
  return typeof window.sketchup !== 'undefined'
}

/** SketchUp sometimes injects `sketchup` shortly after the page loads. */
export function waitForSketchup(maxMs = 3000) {
  return new Promise((resolve) => {
    if (hasSketchupBridge()) {
      resolve(true)
      return
    }
    const start = Date.now()
    const timer = setInterval(() => {
      if (hasSketchupBridge()) {
        clearInterval(timer)
        resolve(true)
      } else if (Date.now() - start >= maxMs) {
        clearInterval(timer)
        resolve(false)
      }
    }, 50)
  })
}

function withTimeout(promise, ms, fallback) {
  return Promise.race([
    promise,
    new Promise((resolve) => setTimeout(() => resolve(fallback), ms)),
  ])
}

export function getHardwareId() {
  return new Promise((resolve, reject) => {
    if (!hasSketchupBridge()) {
      reject(new Error('Open SketchLib from SketchUp (Extensions menu), not a browser.'))
      return
    }
    window.receiveHardwareId = (hwId) => resolve(hwId || '')
    window.sketchup.getHardwareId()
  })
}

export function getSavedToken() {
  if (!hasSketchupBridge()) return Promise.resolve('')

  const tokenPromise = new Promise((resolve) => {
    window.receiveSavedToken = (token) => resolve(token || '')
    window.sketchup.getSavedToken()
  })

  return withTimeout(tokenPromise, BRIDGE_TIMEOUT_MS, '')
}

export function saveToken(token) {
  if (hasSketchupBridge()) window.sketchup.saveToken(token)
}

export function clearToken() {
  if (hasSketchupBridge()) window.sketchup.clearToken()
}
