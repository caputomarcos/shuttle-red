module.exports = function (RED) {
  function ShuttleReceiveNode (config) {
    RED.nodes.createNode(this, config)
    const node = this

    if (config.listenTo.__PARENT__) {
      process.on('message', (payload) => {
        node.send({
          from: '__PARENT__',
          payload
        })
      })
    }

    // TODO Handle receive for non-parent messages
  }
  RED.nodes.registerType('shuttle-receive', ShuttleReceiveNode)
}
