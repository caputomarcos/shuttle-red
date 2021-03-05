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
    const projectsDir = path.join(userDir, 'projects')
    const instanceProjectsDir = path.join(instanceDir, 'projects')
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
    async function start (msg, send) {
      // TODO: The ID might be determined dynamically
      if (shuttles.hasOwnProperty(node.name)) {
        throw new Error('Could not start shuttle: An instance with the ID "' + node.name + '" is already running.')
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
      // Create symbolic link
      if (!fs.existsSync(linkTo)) {
        node.error('Could not start runtime: Project "' + node.project + '" does not exist.')
        return
      }
      if (!fs.existsSync(linkFrom)) {
        fs.mkdirSync(instanceProjectsDir, { recursive: true })
        fs.symlinkSync(linkTo, linkFrom)
      }
      // Run node
      // TODO determine parameters from msg (if set to dynamic in node properties)
      return fork(
        nodeRedRuntime,
        ['-u', instanceDir, '-p', node.runtime.port, node.project],
        {
          silent: true
        }
      )
    }

    async function stop (msg, send){
      // TODO
    }

    node.on('input', function (msg, send, done) {
      switch(node.action) {
        case 'start': {
          start(msg, send).then((shuttleProcess) => {
            shuttleProcess.stdout?.on('data', (data) => {
              console.log('[Shuttle ' + node.name + ']', data.toString())
            })
            shuttleProcess.stderr?.on('data', (data) => {
              console.error('[Shuttle ' + node.name + ']', data.toString())
            })
            shuttleProcess.on('error', (error) => {
              console.error(error)
            })
            // TODO: The id might be dynamic
            shuttles[node.name] = shuttleProcess
            done()
          }).catch((error) => {
            node.error(error)
          })
          break
        }
        case 'restart': {
          stop(msg, send).then(() => {
            runStart(msg, send)
          }).then(() => {
            done()
          })
          break
        }
        case 'stop': {
          stop(msg, send).then(() => {
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
