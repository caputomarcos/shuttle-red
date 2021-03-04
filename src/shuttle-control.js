module.exports = function (RED) {
  function ShuttleControlNode (config) {
    RED.nodes.createNode(this, config)
    // const node = this

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
  }
  RED.nodes.registerType('shuttle-control', ShuttleControlNode)
}
