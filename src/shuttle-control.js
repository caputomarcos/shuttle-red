module.exports = function (RED) {
  function ShuttleControlNode (config) {
    RED.nodes.createNode(this, config)
    // const node = this

    // The node-red-runtime is started using <node-red-runtime-home>/red.js and the CLI options that can be found here:
    // https://nodered.org/docs/getting-started/local
    // We need to set the userDir- option (-u) and optionally the settings-file (-s).
    // We further need to set the project.
    // The settings should be customized so that the "change project" menu entry is hidden.
    // We probably will need to create some links to run everything. We'll see...
  }
  RED.nodes.registerType('shuttle-control', ShuttleControlNode)
}
