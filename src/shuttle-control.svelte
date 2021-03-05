<script context="module">
	/*
	 * TODO: Add option to define a settings-file
	 */
    RED.nodes.registerType("shuttle-control", {
		name: { value: "shuttle-control" },
		category: "Runtime",
		color: "#D9A6AB",
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
			const projectTitle = this.project === '__EMPTY__' ? 'empty project' : this.project && this.project.startsWith('__MSG.') ? 'runtime' : this.project
			return `${this.action} ${projectTitle}`
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
			label: "dynamic",
			hasValue: false
		}
	]
</script>
<Input {node} prop="name" placeholder='project name if not defined' />
<Input {node} type="config" prop="runtime" />
<Select bind:node prop="action">
	<option value="start">Start runtime</option>
	<option value="stop">Stop runtime</option>
	<option value="restart">Restart runtime</option>
</Select>
<Select bind:node prop="project" button="{buttonIcon}" on:click={reloadProjects}>
	<option selected={node.project === "__MSG.PAYLOAD__"} value="__MSG.PAYLOAD__">Determine from msg.payload</option>
	<option selected={node.project === "__MSG.PROJECT__"} value="__MSG.PROJECT__">Determine from msg.project</option>
	<option selected={node.project === "__EMPTY__"} value="__EMPTY__">Empty project</option>
	{#each projects as project}
	    <option selected={node.project === project} value="{project}">{project}</option>
    {/each}
</Select>
<TypedInput {node} prop="port" typeProp="portType" types={portTypes} />
