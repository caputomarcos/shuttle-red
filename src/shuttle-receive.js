module.exports = function (RED) {
  function ShuttleReceiveNode (config) {
    RED.nodes.createNode(this, config)
    // const node = this
    process.on('message', (m) => {
      console.log('Received message:', m)
    })
  }
  RED.nodes.registerType('shuttle-receive', ShuttleReceiveNode)
}
