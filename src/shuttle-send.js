module.exports = function (RED) {
  function ShuttleSendNode (config) {
    RED.nodes.createNode(this, config)
    // const node = this
  }
  RED.nodes.registerType('shuttle-send', ShuttleSendNode)
}
