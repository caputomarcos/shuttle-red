<script context="module">
    RED.nodes.registerType("shuttle-send", {
		name: { value: "shuttle-send" },
		category: "Node-RED",
		color: "#D9A6AB",
		defaults: {
			name: { value: "", label: "Name" }
		},
		inputs: 1,
		outputs: 0,
		icon: function() {
			return "font-awesome/fa-rocket";
		},
		paletteLabel: "Send message",
		label: function() {
			if (this.name) {
				return this.name
			} else {
				return "Send message"
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
