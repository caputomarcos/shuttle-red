module.exports = function (RED) {
  function ShuttleSendNode (config) {
    RED.nodes.createNode(this, config)
    const node = this

    node.receivers = []
    Object.keys(config.sendTo).forEach((receiver) => {
      if (config.sendTo[receiver]) {
        if (receiver === '__PARENT__') {
          node.receivers.push((msg) => {
            if (process.send) {
              process.send(msg)
            }
          })
        } else {
          const controlNode = RED.nodes.getNode(receiver)
          if (config.sendToFilters.hasOwnProperty(receiver)) {
            const filter = config.sendToFilters[receiver]
            node.receivers.push((msg) => {
              const remoteIDs = controlNode.getRunningShuttles()
              if (remoteIDs.indexOf(filter) >= 0) {
                controlNode.sendTo(filter, msg)
              }
            })
          } else {
            node.receivers.push((msg) => {
              const remoteIDs = controlNode.getRunningShuttles()
              remoteIDs.forEach((shuttleId) => {
                controlNode.sendTo(shuttleId, msg)
              })
            })
          }
        }
      }
    })
    
    node.on('input', function (msg, _send, done) {
      node.receivers.forEach((send) => {
        send(msg)
      })
      done()
    })
  }
  RED.nodes.registerType('shuttle-send', ShuttleSendNode)
}
