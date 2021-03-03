module.exports = function (RED) {
  function ShuttleReceiveNode (config) {
    RED.nodes.createNode(this, config)
    // const node = this
  }
  RED.nodes.registerType('shuttle-receive', ShuttleReceiveNode)
}
