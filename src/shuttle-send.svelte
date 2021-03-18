<script context="module">
    RED.nodes.registerType("shuttle-send", {
		name: { value: "shuttle-send" },
		category: "Runtime",
		color: "#90CAFF",
		defaults: {
			name: { value: "", label: "Name" },
			sendTo: { value: { __PARENT__: true } },
			sendToFilters: { value: {} }
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
	import { Group, Input, Row } from 'svelte-integration-red/components'

	$: controlNodes = RED.nodes.filterNodes({ type: 'shuttle-control' }).filter((node) => node.action === 'start')
</script>
<Group label="Send msg.payload to:" icon="list" style="padding-top: 0px;">
	<Input
		inline
		type="checkbox"
		bind:checked={node.sendTo['__PARENT__']}
		label="Parent instance (controller)"
		on:change={(e) => node.sendTo['__PARENT__'] = e.detail.value} />
	{#each controlNodes as controlNode (controlNode.id)}
		<!-- svelte-ignore missing-declaration -->
		<Input
			type="checkbox"
			bind:checked={node.sendTo[controlNode.id]}
			label={controlNode.runtimeId? controlNode.runtimeId : 'Unnamed shuttle (' + controlNode.id + ')'}
			on:change={(e) => node.sendTo[controlNode.id] = e.detail.value}
			on:mouseenter={() => RED.view.reveal(controlNode.id)} />
		{#if node.sendTo[controlNode.id] && controlNode.runtimeId === ''}
			<Row style="margin-left: 23px;">
				<!-- svelte-ignore missing-declaration -->
				<!--
					TODO: Add restriction to ID coming from msg.runtimeId
				-->
				<Input
					inline
					bind:checked={node.sendToFilters[controlNode.id]}
					label="Restrict&nbsp;to&nbsp;ID:"
					on:change={(e) => node.sendToFilters[controlNode.id] = e.detail.value}
					on:mouseenter={() => RED.view.reveal(controlNode.id)} />
			</Row>
		{/if}
	{/each}
</Group>