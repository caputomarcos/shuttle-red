module.exports = function (RED) {
  function ShuttleControlNode (config) {
    RED.nodes.createNode(this, config)
    // const node = this
  }
  RED.nodes.registerType('shuttle-control', ShuttleControlNode)
}
