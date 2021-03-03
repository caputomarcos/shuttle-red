const http = require('http')
const express = require('express')
const RED = require('node-red')

const settings = require(process.argv[2])
if (!settings.userDir) settings.userDir = __dirname
const ip = process.argv[3]
const port = process.argv[4]

// Initialize express.js
const app = express()
const server = http.createServer(app)

// Initialize Node-RED
RED.init(server, settings)
app.use(settings.httpAdminRoot, RED.httpAdmin)
app.use(settings.httpNodeRoot, RED.httpNode)

// Start Node-RED
server.listen(port || 1880, ip || 'localhost')
RED.start()
