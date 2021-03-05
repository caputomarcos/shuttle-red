module.exports = function (RED) {
  function ShuttleReceiveNode (config) {
    RED.nodes.createNode(this, config)
    const node = this

    Object.keys(config.listenTo).forEach((controlId) => {
      if (config.listenTo[controlId]) {
        if (controlId === '__PARENT__') {
          process.on('message', (payload) => {
            node.send({
              from: '__PARENT__',
              payload
            })
          })
        } else {
          const controlNode = RED.nodes.getNode(controlId)
          controlNode.onMessage((payload, from) => {
            node.send({
              from: from,
              payload
            })
          })
        }
      }
    })
  }
  RED.nodes.registerType('shuttle-receive', ShuttleReceiveNode)
}
