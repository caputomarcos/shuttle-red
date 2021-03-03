<script context="module">
    RED.nodes.registerType("shuttle-control", {
		name: { value: "shuttle-control" },
		category: "Node-RED",
		color: "#D9A6AB",
		defaults: {
			action: { value: "start", label: "Action" },
            runtime: { value: "latest", label: "Runtime" },
            project: { value: "", label: "Project" }
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
	import { Select, Input } from 'svelte-integration-red/components'
</script>
<Input {node} prop="name" />
<Select bind:node prop="action">
	<option value="start">Start runtime</option>
	<option value="stop">Stop runtime</option>
	<option value="restart">Restart runtime</option>
</Select>
<Select bind:node prop="runtime">
	<option value="latest">Latest</option>
</Select>
<Select bind:node prop="project">
	<option value="__MSG.PAYLOAD__">Determine from msg.payload</option>
	<option value="__MSG.PROJECT__">Determine from msg.project</option>
	<option value="__EMPTY__">Empty project</option>
</Select>
