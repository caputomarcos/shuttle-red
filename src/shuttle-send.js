module.exports = function (RED) {
  function ShuttleSendNode (config) {
    RED.nodes.createNode(this, config)
    // const node = this
    // Send from child process
    process.send({ foo: 'bar', baz: NaN })
  }
  RED.nodes.registerType('shuttle-send', ShuttleSendNode)
}
