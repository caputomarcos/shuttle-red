<script context="module">
    RED.nodes.registerType("shuttle-receive", {
		name: { value: "shuttle-receive" },
		category: "Runtime",
		color: "#90CAFF",
		defaults: {
			name: { value: "", label: "Name" },
			listenTo: { value: { __PARENT__: true } }
		},
		inputs: 0,
		outputs: 1,
		icon: function() {
			return "font-awesome/fa-envelope-open";
		},
		paletteLabel: "message in",
		label: function() {
			if (this.name) {
				return this.name
			} else {
				return "message in"
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
	<Input
		inline
		type="checkbox"
		bind:checked={node.listenTo['__PARENT__']}
		label="Events from parent instance (controller)"
		on:change={(e) => node.listenTo['__PARENT__'] = e.detail.value} />
	{#each controlNodes as controlNode (controlNode.id)}
		<!-- svelte-ignore missing-declaration -->
		<Input
			inline
			type="checkbox"
			bind:checked={node.listenTo[controlNode.id]}
			label={controlNode.runtimeId? controlNode.runtimeId : 'Unnamed shuttle (' + controlNode.id + ')'}
			on:change={(e) => node.listenTo[controlNode.id] = e.detail.value}
			on:mouseenter={() => RED.view.reveal(controlNode.id)} />
	{/each}
</Group>

