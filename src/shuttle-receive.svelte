<script context="module">
    RED.nodes.registerType("shuttle-receive", {
		name: { value: "shuttle-receive" },
		category: "Node-RED",
		color: "#D9A6AB",
		defaults: {
			name: { value: "", label: "Name" }
		},
		inputs: 0,
		outputs: 1,
		icon: function() {
			return "font-awesome/fa-rocket";
		},
		paletteLabel: "Receive message",
		label: function() {
			if (this.name) {
				return this.name
			} else {
				return "Receive message"
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
</script>
