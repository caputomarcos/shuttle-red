# Shuttle-RED

Shuttle-RED allows you to start and control further Node-RED instances.

## Current status

> **Warning:** This is a very early (and incomplete) release. Breaking changes can happen at any time and thorough testing is still due to be done. Use at your own risk and do NOT use in production.

No documentation exists at the moment but the nodes editor should be quite self explenatory.

## Usage

Use the control node to start, stop or restart Node-RED instances. You can send messages between the control Node-RED instance and its sub-instances using the message in and out nodes. The runtime determines which Node-RED version should be started. The runtime is downloaded and installed even if it is the same than the one that is currently running. This is due to the fact that Shuttle-RED keeps its own runtimes.

> Please mind, that you need the projects feature to be turned on and that other projects need to exist in order to be started within a seperate runtime.

## Test these nodes using Gitpod

This project is [Gitpod](https://gitpod.io/)-ready. After starting the workspace you can run Node-RED on the command line (```node-red```), open the Node-RED editor in a new browser tab (see message in the lower right corner) and then experiment with the new nodes. A sample project should automatically be linked into the projects folder of your Node-RED runtime so you can start a Node-RED instance with this empty project.