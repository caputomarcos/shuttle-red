<script context="module">
	/*
	 * TODO: Add option to define a settings-file
	 */
    RED.nodes.registerType("shuttle-runtime", {
		name: { value: "shuttle-runtime" },
		category: "config",
		defaults: {
			name: { value: "", label: "Runtime ID" },
			nodeRedVersion: { value: "latest", label: "Node-RED version" },
            // TODO
            settings: { value: "", label: "Settings file" }
		},
		inputs: 0,
		outputs: 0,
		icon: function() {
			return "font-awesome/fa-rocket";
		},
		paletteLabel: "runtime",
		label: function() {
			if (this.name) {
                return this.name
            } else {
                return "unnamed runtime (" + this.id + ")"
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
	import { Select, Input } from 'svelte-integration-red/components'
    
    // The auth token is needed to access to the HTTP API
    const authTokens = RED.settings.get("auth-tokens")

    let nrInfo = { versions: [], tags: [] }
    let buttonIcon = "clock-o"
    function reloadVersions () {
        buttonIcon = "clock-o"
        window.$.getJSON({
			url: "/shuttle-red/updateVersions",
			success: (nrInfoFromServer) => {
                buttonIcon = "cloud-download"
                nrInfo = nrInfoFromServer
			},
			headers: authTokens
				? {
						Authorization: "Bearer " + authTokens.access_token
					}
                : {}
		})
    }
    function readNrInfo () {
		window.$.getJSON({
			url: "/shuttle-red/getVersions",
			success: (nrInfoFromServer) => {
                buttonIcon = "cloud-download"
                nrInfo = nrInfoFromServer
			},
			headers: authTokens
				? {
						Authorization: "Bearer " + authTokens.access_token
					}
                : {}
		})
	}
    if (nrInfo.tags.length === 0) {
        readNrInfo()
    }
</script>
<Input {node} prop="name" />
<Select bind:node prop="nodeRedVersion" button="{buttonIcon}" on:click={reloadVersions}>
    {#if (nrInfo.tags.indexOf(node.nodeRedVersion) === -1 && nrInfo.versions.indexOf(node.nodeRedVersion) === -1)}
        <option selected value="{node.nodeRedVersion}">{node.nodeRedVersion}</option>
    {/if}
    {#each nrInfo.tags as tag}
	    <option selected={node.nodeRedVersion === tag} value="{tag}">{tag}</option>
    {/each}
    {#each nrInfo.versions.reverse() as version}
	    <option selected={node.nodeRedVersion === version} value="{version}">{version}</option>
    {/each}
</Select>
