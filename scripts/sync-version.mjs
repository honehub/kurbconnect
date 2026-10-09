#!/usr/bin/env node
// Stamps one version across every place that carries one.
//
//   package.json "version"      -> the About screen (via vite define)
//                                 iOS   MARKETING_VERSION
//                                 Android versionName
//   package.json "buildNumber"  -> iOS   CURRENT_PROJECT_VERSION
//                                 Android versionCode
//
// The build number is a single counter kept in package.json so iOS and Android
// never drift apart, and so it is in git rather than in someone's Xcode.
// Apple rejects any upload whose build number is not higher than the last one,
// which is the failure this script exists to prevent.
//
//   npm run release          bump the build number, stamp everything
//   npm run release:patch    0.3.2 -> 0.3.3, then the same
//   npm run release -- --dry show what would change, write nothing

import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const dry = process.argv.includes('--dry')

const PKG = join(root, 'package.json')
const PBX = join(root, 'ios/App/App.xcodeproj/project.pbxproj')
const GRADLE = join(root, 'android/app/build.gradle')

const pkg = JSON.parse(readFileSync(PKG, 'utf8'))
const version = pkg.version
if (!/^\d+\.\d+\.\d+$/.test(version || '')) {
  fail(`package.json version is "${version}" — expected something like 1.2.3`)
}

const build = Number(pkg.buildNumber ?? 0) + 1
const changes = []
const problems = []

// ---------------------------------------------------------------- iOS
// Both keys appear once per build configuration (Debug and Release), so every
// occurrence is replaced rather than the first.
if (existsSync(PBX)) {
  let s = readFileSync(PBX, 'utf8')
  s = swapAll(s, PBX, /MARKETING_VERSION = [^;]+;/g, `MARKETING_VERSION = ${version};`, 'iOS MARKETING_VERSION', version)
  s = swapAll(s, PBX, /CURRENT_PROJECT_VERSION = [^;]+;/g, `CURRENT_PROJECT_VERSION = ${build};`, 'iOS CURRENT_PROJECT_VERSION', build)
  if (!dry) writeFileSync(PBX, s)
} else {
  problems.push('no iOS project at ios/App/App.xcodeproj — skipped')
}

// ------------------------------------------------------------ Android
if (existsSync(GRADLE)) {
  let s = readFileSync(GRADLE, 'utf8')
  s = swapAll(s, GRADLE, /versionCode\s+\d+/g, `versionCode ${build}`, 'Android versionCode', build)
  s = swapAll(s, GRADLE, /versionName\s+"[^"]*"/g, `versionName "${version}"`, 'Android versionName', version)
  if (!dry) writeFileSync(GRADLE, s)
} else {
  problems.push('no android/app/build.gradle — skipped')
}

// ------------------------------------------------------- package.json
// Written last, so a failure above leaves the counter untouched and the run
// can simply be repeated.
if (!dry) {
  pkg.buildNumber = build
  writeFileSync(PKG, JSON.stringify(pkg, null, 2) + '\n')
}
changes.push(`package.json buildNumber -> ${build}`)

// ------------------------------------------------------------- report
console.log(`\n  KurbConnect ${version} (build ${build})${dry ? '   [dry run — nothing written]' : ''}\n`)
for (const c of changes) console.log(`   ok   ${c}`)
for (const p of problems) console.log(`   --   ${p}`)

const missed = problems.filter((p) => p.startsWith('NOT FOUND'))
if (missed.length) {
  console.error('\n  Some version fields were not found. Nothing was written for those files.')
  console.error('  Check them by hand before uploading, or the upload will be rejected.\n')
  process.exit(1)
}
console.log('\n  Next: npm run build && npx cap sync\n')

// -------------------------------------------------------------- utils
// Reports a miss instead of asserting, so a partial match can never pass
// silently as a success.
function swapAll(text, file, pattern, replacement, label, value) {
  const found = text.match(pattern)
  if (!found || found.length === 0) {
    problems.push(`NOT FOUND: ${label} in ${file}`)
    return text
  }
  const times = found.length > 1 ? ` (${found.length} places)` : ''
  changes.push(`${label} -> ${value}${times}`)
  return text.replace(pattern, replacement)
}

function fail(msg) {
  console.error(`\n  ${msg}\n`)
  process.exit(1)
}
