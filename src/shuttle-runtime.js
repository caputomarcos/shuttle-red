const npm = require('./util/npm')

module.exports = function (RED) {
    function ShuttleRuntimeNode (config) {
        RED.nodes.createNode(this, config)
        const node = this
        node.name = config.name
        node.version = config.nodeRedVersion
        node.settings = config.settings
        if (config.portType === 'dynamic') {
            node.port = 0
        } else {
            node.port = config.port
        }
    }

    RED.nodes.registerType('shuttle-runtime', ShuttleRuntimeNode)

    let versions = { versions: [], tags: ['latest'] }
    RED.httpAdmin.get('/shuttle-red/updateVersions', function (_request, response) {
        npm.versions().then((result) => {
            versions = result
            response.send(versions)
        })
    })
    RED.httpAdmin.get('/shuttle-red/getVersions', function (_request, response) {
        response.send(versions)
    })
}
  