<script context="module">
    RED.nodes.registerType("shuttle-control", {
		name: { value: "shuttle-control" },
		category: "Node-RED",
		color: "#D9A6AB",
		defaults: {
			name: { value: "", label: "Name" }
		},
		inputs: 1,
		outputs: 1,
		icon: function() {
			return "font-awesome/fa-file-rocket";
		},
		paletteLabel: "Control Shuttle",
		label: function() {
			if (this.name) {
				return this.name
			} else {
				return "Control Shuttle"
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
