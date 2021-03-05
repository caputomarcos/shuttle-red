const npm = require('./util/npm')
const fs = require('fs')
const path = require('path')
const { fork } = require('child_process')

module.exports = function (RED) {

  function ShuttleControlNode (config) {
    RED.nodes.createNode(this, config)
    const node = this
    node.name = config.name
    node.action = config.action
    node.runtime = RED.nodes.getNode(config.runtime)
    node.project = config.project
    if (config.portType === 'dynamic') {
        node.port = 0
    } else {
        node.port = config.port
    }

    if (!this.context().flow.get('shuttles')) {
      this.context().flow.set('shuttles', {})
    }
    const shuttles = this.context().flow.get('shuttles')

    const nodeRedVersion = node.runtime.version.substring(node.runtime.version.indexOf(':') + 1)
    const versionIsTag = node.runtime.version.startsWith('tag:')

    // Directory structure
    const userDir = RED.settings.userDir
    const shuttleDir = path.join(userDir, 'shuttle-red')
    const nodeRedDir = path.join(shuttleDir, 'node-red')
    const nodeRedVersionDir = path.join(nodeRedDir, nodeRedVersion)
    const nodeRedRuntime = path.join(nodeRedVersionDir, 'node_modules', 'node-red', 'red.js')
    const runtimeDir = path.join(shuttleDir, 'runtime')
    const instanceDir = path.join(runtimeDir, node.name)
    const instanceProjectFile = path.join(instanceDir, 'package.json')
    const projectsDir = path.join(userDir, 'projects')
    const instanceProjectsDir = path.join(instanceDir, 'projects')
    const instanceModulesDir = path.join(instanceDir, 'node_modules')
    const instanceShuttleRedDir = path.join(instanceModulesDir, 'shuttle-red')
    const modulesShuttleRedDir = path.join(__dirname, '..')
    const linkTo = path.join(projectsDir, node.project)
    const linkFrom = path.join(instanceProjectsDir, node.project)

    /*
     * Starting a new runtime:
     *
     * 1. Install node-red version (if not present) to ./node-red/<version or tag>:
     *    npm install --prefix ./node-red/<version or tag> node-red@<version or tag>
     * 2. Create runtime directory
     * 3. Create projects directory within the runtime directory
     * 4. Create symbolic link inside the projects directory linking to the project that should be started
     * 5. Run node ./node-red/<version or tag>/node_modules/node-red/red.js -u ./runtime/<id>/ <project name> using child_process.fork()
     */
    async function start (shuttleId, _msg) {
      if (shuttles.hasOwnProperty(shuttleId)) {
        throw new Error('Could not start shuttle: An instance with the ID "' + shuttleId + '" is already running.')
      }
      // Check if directory structure has been initialized
      const shuttleDirExists = fs.existsSync(shuttleDir) && fs.existsSync(nodeRedDir)  && fs.existsSync(runtimeDir)
      if (!shuttleDirExists) {
        fs.mkdirSync(nodeRedDir, { recursive: true })
        fs.mkdirSync(runtimeDir, { recursive: true })
      }
      // Check if node-red version is already installed
      const isAlreadyInstalled = fs.existsSync(nodeRedVersionDir)
      if (!isAlreadyInstalled) {
        await npm.install(nodeRedVersion, nodeRedDir)
      } else if (versionIsTag) {
        // Check if the node-red version can be updated (is it a tag?)
        await npm.update(nodeRedVersion, nodeRedDir)
      }
      // Check if instance folder has been initialized
      if (!fs.existsSync(instanceDir)) {
        fs.mkdirSync(instanceModulesDir, { recursive: true })
        // Create symbolic link to shuttle-RED module
        fs.symlinkSync(modulesShuttleRedDir, instanceShuttleRedDir)
        // Create projects file
        fs.writeFileSync(instanceProjectFile, `
          {
            "name": "shuttle ${shuttleId}",
            "description": "A Node-RED instance started from within Node-RED. We call it a shuttle.",
            "author": "The shuttle-RED commander :o)",
            "version": "1.0.0",
            "dependencies": {
              "shuttle-red": "*"
            }
          }
        `)
        // Create symbolic link to project
        if (!fs.existsSync(linkTo)) {
          node.error('Could not start runtime: Project "' + node.project + '" does not exist.')
          return
        }
        fs.mkdirSync(instanceProjectsDir, { recursive: true })
        fs.symlinkSync(linkTo, linkFrom)
      }
      // Run node
      // TODO determine parameters from msg (if set to dynamic in node properties)
      const shuttleProcess = fork(
        nodeRedRuntime,
        ['-u', instanceDir, '-p', node.port, node.project],
        {
          silent: true
        }
      )
      shuttleProcess.stdout?.on('data', (data) => {
        console.log('[Shuttle ' + shuttleId + ']', data.toString())
      })
      shuttleProcess.stderr?.on('data', (data) => {
        console.error('[Shuttle ' + shuttleId + ']', data.toString())
      })
      shuttleProcess.on('error', (error) => {
        console.error(error)
      })
      return shuttleProcess
    }

    async function stop (shuttleId, _msg) {
      if (!shuttles.hasOwnProperty(shuttleId)) {
        throw new Error('Could not stop shuttle. No instance with the id "' + shuttleId + '" is running.')
      }
      return shuttles[shuttleId]?.kill()
    }

    node.on('input', function (msg, send, done) {
      // TODO: The ID might be determined dynamically
      const shuttle_id = node.name

      switch (node.action) {
        case 'start': {
          start(shuttle_id, msg, send).then((shuttleProcess) => {
            if (!shuttleProcess) {
              msg.payload = { shuttle_id, started: false }
              send(msg)
              done()
            } else {
              shuttles[shuttle_id] = shuttleProcess
              msg.payload = { shuttle_id, started: shuttleProcess.connected }
              send(msg)
              done()
            }
          }).catch((error) => {
            node.warn(error)
            msg.payload = { shuttle_id, started: false }
            send(msg)
            done()
          })
          break
        }
        case 'restart': {
          function handleStart (shuttleId, msg, send, done) {
            start(shuttleId, msg).then((shuttleProcess) => {
              if (!shuttleProcess) {
                msg.payload = { shuttle_id, started: false }
                send(msg)
                done()
              } else {
                shuttles[shuttleId] = shuttleProcess
                msg.payload = { shuttle_id, started: shuttleProcess.connected }
                send(msg)
                done()
              }
            })
          }
          stop(shuttle_id, msg).then(() => {
            // Instance could be stopped
            handleStart(shuttle_id, msg, send, done)
          }, () => {
            // Instance could not be stopped
            node.warn('Warning: Could not stop shuttle. Instance "' + shuttle_id + '" was not running.')
            handleStart(shuttle_id, msg, send, done)
          }).catch((error) => {
            node.error(error)
            msg.payload = { shuttle_id, started: false }
            send(msg)
            done()
          })
          break
        }
        case 'stop': {
          stop(shuttle_id, msg).then((terminated) => {
            if (terminated) {
              delete shuttles[shuttle_id]
            }
            msg.payload = { shuttle_id, stopped: terminated }
            send(msg)
            done()
          }).catch((error) => {
            node.error(error)
            msg.payload = { shuttle_id, stopped: false }
            send(msg)
            done()
          })
          break
        }
        default: {
          node.error('Error: Unknown action "' + node.action + "'.")
        }
      }
    })
  }

  RED.nodes.registerType('shuttle-control', ShuttleControlNode)

  let projects = []
  const userDir = RED.settings.userDir
  const projectsDir = path.join(userDir, 'projects')
  function getProjects () {
    projects = []
    if (!fs.existsSync(projectsDir)) {
      fs.mkdirSync(projectsDir, { recursive: true })
    }
    fs.readdirSync(projectsDir, { withFileTypes: true }).forEach((fileInfo) => {
        if (fileInfo.isDirectory()) {
            projects.push(fileInfo.name)
        }
    })
  }
  RED.httpAdmin.get('/shuttle-red/reloadProjects', function (_request, response) {
    getProjects()
    response.send(projects)
  })
  RED.httpAdmin.get('/shuttle-red/getProjects', function (_request, response) {
    if (projects.length === 0) {
        getProjects()
    }
    response.send(projects)
  })
}
