/** Ruby HtmlDialog bridge (window.sketchup). */

export function hasSketchupBridge() {
  return typeof window.sketchup !== 'undefined'
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
  return new Promise((resolve) => {
    if (!hasSketchupBridge()) {
      resolve('')
      return
    }
    window.receiveSavedToken = (token) => resolve(token || '')
    window.sketchup.getSavedToken()
  })
}

export function saveToken(token) {
  if (hasSketchupBridge()) window.sketchup.saveToken(token)
}

export function clearToken() {
  if (hasSketchupBridge()) window.sketchup.clearToken()
}
