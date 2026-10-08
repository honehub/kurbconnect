import { Capacitor } from '@capacitor/core'
import { NativeSettings, AndroidSettings, IOSSettings } from 'capacitor-native-settings'
import { PushNotifications } from '@capacitor/push-notifications'
import { supabase, getOrgId } from './supabase'

let registered = false
let deviceToken = null

export function getDeviceToken() {
  return deviceToken || localStorage.getItem('pushToken')
}

// Registers this device for push reminders. Safe to call on every app open.
export async function registerForPush(lat, lng, reminderHour = 19) {
  if (!Capacitor.isNativePlatform()) return 'unsupported'
  if (registered) return 'already'

  let perm = await PushNotifications.checkPermissions()
  if (perm.receive !== 'granted') {
    perm = await PushNotifications.requestPermissions()
  }
  if (perm.receive !== 'granted') return 'denied'

  return new Promise((resolve) => {
    const done = (result) => {
      registered = true
      resolve(result)
    }

    PushNotifications.addListener('registration', async (token) => {
      deviceToken = token.value
      localStorage.setItem('pushToken', token.value)
      try {
        const { error } = await supabase.rpc('register_push_device', {
          input_organization_id: getOrgId(),
          input_token: token.value,
          input_platform: Capacitor.getPlatform(),
          input_lat: lat,
          input_lng: lng,
          input_reminder_hour: reminderHour,
        })
        done(error ? 'save-failed' : 'registered')
      } catch {
        done('save-failed')
      }
    })

    PushNotifications.addListener('registrationError', () => {
      done('failed')
    })

    PushNotifications.register()

    // Don't hang forever if neither listener fires
    setTimeout(() => done('timeout'), 15000)
  })
}

export async function loadPreferences() {
  const token = getDeviceToken()
  if (!token) return null
  const { data, error } = await supabase.rpc('get_push_preferences', {
    input_token: token,
  })
  if (error) return null
  return data?.[0] ?? null
}

export async function savePreferences(prefs) {
  const token = getDeviceToken()
  if (!token) return false
  const { error } = await supabase.rpc('update_push_preferences', {
    input_token: token,
    input_enabled: prefs.enabled,
    input_timing: prefs.timing,
    input_hour: prefs.hour,
    input_minute: prefs.minute ?? 0,
    input_categories: prefs.categories,
    input_language: prefs.language,
    input_alerts: prefs.alerts,
    input_paused_until: prefs.pausedUntil ?? null,
    input_morning_hour: prefs.morningHour ?? 6,
    input_morning_minute: prefs.morningMinute ?? 0,
  })
  return !error
}

export async function deactivateDevice() {
  const token = getDeviceToken()
  if (!token) return false
  const { error } = await supabase.rpc('deactivate_push_device', {
    input_token: token,
  })
  if (!error) {
    localStorage.removeItem('pushToken')
    deviceToken = null
  }
  return !error
}
export function isNativeApp() {
  return Capacitor.isNativePlatform()
}

// 'unsupported' on the web; otherwise 'granted' | 'denied' | 'prompt'.
export async function getNotificationPermission() {
  if (!Capacitor.isNativePlatform()) return 'unsupported'
  try {
    const p = await PushNotifications.checkPermissions()
    return p.receive
  } catch {
    return 'unsupported'
  }
}

// iOS shows its permission prompt once, ever. If the resident already said no,
// this resolves 'denied' without showing anything, and the only way back is the
// system Settings app — so the caller must handle 'denied' with instructions
// rather than by asking again.
export async function requestNotificationPermission() {
  if (!Capacitor.isNativePlatform()) return 'unsupported'
  try {
    const p = await PushNotifications.requestPermissions()
    if (p.receive === 'granted') await PushNotifications.register()
    return p.receive
  } catch {
    return 'denied'
  }
}

// Opens this app's own page in the system Settings app. Needed because once a
// resident has denied notifications, neither iOS nor Android will show the
// permission prompt again — Settings is the only way back.
export async function openAppSettings() {
  if (!Capacitor.isNativePlatform()) return false
  try {
    await NativeSettings.open({
      optionAndroid: AndroidSettings.ApplicationDetails,
      optionIOS: IOSSettings.App,
    })
    return true
  } catch {
    return false
  }
}
