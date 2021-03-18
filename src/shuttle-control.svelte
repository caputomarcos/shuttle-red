<script context="module">
	/*
	 * TODO: Add option to define a settings-file
	 */
    RED.nodes.registerType("shuttle-control", {
		name: { value: "shuttle-control" },
		category: "Runtime",
		color: "#90CAFF",
		defaults: {
			name: { value: "", label: "Shuttle ID" },
			action: { value: "start", label: "Action" },
            runtime: { value: "", type:"shuttle-runtime", label: "Runtime" },
            project: { value: "", label: "Project" },
			port: { value: "", label: "Port" },
			portType: { value: "dynamic" }
		},
		inputs: 1,
		outputs: 1,
		icon: function() {
			return "font-awesome/fa-rocket";
		},
		paletteLabel: "control",
		label: function() {
			let shuttleName = this.name
			if (!shuttleName) {
				if (this.project === '__NEW__') {
					shuttleName = 'runtime [new]'
				} else if (this.project.startsWith('__MSG') || !this.project) {
					shuttleName = 'runtime [dynamic]'
				} else {
					shuttleName = 'runtime [' + this.project + ']'
				}
			}
			let actionName = this.action
			if (actionName.startsWith('__MSG')) {
				actionName = 'control'
			}
			return `${actionName} ${shuttleName}`
		},
		oneditprepare: function() {
			render(this)
		},
		oneditsave: function() {
			update(this)
		},
		oneditcancel: function() {
			revert(this)
		}
	})
</script>
<script>
	export let node
	import { Select, Input, TypedInput } from 'svelte-integration-red/components'
    
    // The auth token is needed to access to the HTTP API
    const authTokens = RED.settings.get("auth-tokens")

    let projects = []
    let buttonIcon = "clock-o"
    function reloadProjects () {
        buttonIcon = "clock-o"
        window.$.getJSON({
			url: "/shuttle-red/reloadProjects",
			success: (projectsFromServer) => {
                buttonIcon = "cloud-download"
                projects = projectsFromServer
			},
			headers: authTokens
				? {
						Authorization: "Bearer " + authTokens.access_token
					}
                : {}
		})
    }
    function readProjects () {
		window.$.getJSON({
			url: "/shuttle-red/getProjects",
			success: (projectsFromServer) => {
                buttonIcon = "cloud-download"
                projects = projectsFromServer
			},
			headers: authTokens
				? {
						Authorization: "Bearer " + authTokens.access_token
					}
                : {}
		})
	}
    if (projects.length === 0) {
        readProjects()
    }

	const portTypes = [
		"num",
		{
			value: "dynamic",
			label: "0 (dynamic)",
			hasValue: false
		},
		{
			value: "msg",
			label: "msg.port",
			hasValue: false
		},
		{
			value: "msg.payload",
			label: "msg.payload.port",
			hasValue: false
		}
	]
</script>
<Input {node} prop="name" placeholder='msg.payload.shuttle_id || msg.shuttle_id || project name' />
<Input {node} type="config" prop="runtime" />
<Select {node} prop="action" on:change={(e) => node.action = e.detail.value}>
	<option value="start">Start runtime</option>
	<option value="stop">Stop runtime</option>
	<option value="restart">Restart runtime</option>
	<option value="__MSG.PAYLOAD__">Determine from msg.payload.action</option>
	<option value="__MSG__">Determine from msg.action</option>
</Select>
<Select {node} prop="project" button="{buttonIcon}" on:click={reloadProjects}>
	<option selected={node.project === "__MSG.PAYLOAD__"} value="__MSG.PAYLOAD__">Determine from msg.payload.project</option>
	<option selected={node.project === "__MSG__"} value="__MSG__">Determine from msg.project</option>
	<option selected={node.project === "__NEW__"} value="__NEW__">New project</option>
	{#each projects as project}
		<option selected={node.project === project} value="{project}">{project}</option>
	{/each}
</Select>
{#if node.action === 'start'}
	<TypedInput {node} prop="port" typeProp="portType" types={portTypes} />
{/if}
