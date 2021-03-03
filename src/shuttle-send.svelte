<script context="module">
    RED.nodes.registerType("shuttle-send", {
		name: { value: "shuttle-send" },
		category: "Runtime",
		color: "#D9A6AB",
		defaults: {
			name: { value: "", label: "Name" },
			sendTo: { value: {} }
		},
		inputs: 1,
		outputs: 0,
		icon: function() {
			return "font-awesome/fa-envelope";
		},
		paletteLabel: "message out",
		label: function() {
			if (this.name) {
				return this.name
			} else {
				return "message out"
			}
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
	import { Group, Input } from 'svelte-integration-red/components'

	$: controlNodes = RED.nodes.filterNodes({ type: 'shuttle-control' }).filter((node) => node.action === 'start')
</script>
<Group label="Listen to:" icon="list" style="padding-top: 0px;">
	{#each controlNodes as controlNode (controlNode.id)}
		<!-- svelte-ignore missing-declaration -->
		<Input
			inline
			type="checkbox"
			bind:checked={node.sendTo[controlNode.id]}
			label={"Shuttle control: " + (controlNode.runtimeId || controlNode.id)}
			on:change={(e) => node.sendTo[controlNode.id] = e.detail.value}
			on:mouseenter={() => RED.view.reveal(controlNode.id)} />
	{/each}
</Group>