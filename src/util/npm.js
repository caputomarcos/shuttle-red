const { spawn } = require('child_process')

const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm'

async function exec (cmd, args, doLog = false) {
  return new Promise((resolve, reject) => {
    let stdout = ''
    let stderr = ''
    const child = spawn(cmd, args)
    child.stdout.on('data', (data) => {
      const str = data.toString()
      if (doLog) {
        console.log(str)
      }
      stdout += str
    })
    child.stderr.on('data', (data) => {
      const str = data.toString()
      if (doLog) {
        console.error(str)
      }
      stderr += str
    })
    child.on('error', (error) => {
      const str = error.toString()
      if (doLog) {
        console.error(str)
      }
      stderr += str
    })
    child.on('close', (code) => {
      const result = {
        code,
        stdout,
        stderr
      }
      if (code === 0) {
        resolve(result)
      } else {
        reject(result)
      }
    })
  })
}

async function versions () {
  const nodeRedInfo = { versions: [], tags: [] }
  await exec(npmCmd, ['view', 'node-red', 'versions']).then(result => {
    if (result.code === 0) {
      nodeRedInfo.versions.push(...JSON.parse(result.stdout.replace(/'/gm, '"')))
    } else {
      throw new Error(result.stderr)
    }
  })
  await exec(npmCmd, ['view', 'node-red', 'dist-tags']).then(result => {
    if (result.code === 0) {
      nodeRedInfo.tags.push(...Object.keys(JSON.parse(result.stdout.replace(/(\w+): /gm, '"$1": ').replace(/'/g, '"'))))
    } else {
      throw new Error(result.stderr)
    }
  })
  return nodeRedInfo
}

async function install (versionOrTag) {
  await exec(npmCmd, ['install', '--prefix', './node-red/' + versionOrTag, 'node-red@' + versionOrTag])
}

async function update (tag) {
  await exec(npmCmd, ['update', '--prefix', './node-red/' + tag, 'node-red@' + tag])
}

module.exports = {
  versions,
  install,
  update
}
