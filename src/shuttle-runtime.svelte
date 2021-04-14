<script context="module">
	/*
	 * TODO: Add option to define environment variables
	 */
    RED.nodes.registerType("shuttle-runtime", {
		name: { value: "shuttle-runtime" },
		category: "config",
		defaults: {
			name: { value: "", label: "Runtime ID" },
			nodeRedVersion: { value: "latest", label: "Node-RED version" },
			environment: { value: [] },
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
	import { Select, Input, TypedInput, EditableList, Row } from 'svelte-integration-red/components'
    
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
    $: nodeRedVersionOnly = node.nodeRedVersion ? node.nodeRedVersion.substring(node.nodeRedVersion.indexOf(':') + 1) : ''

	function addEnvironmentVariable() {
		node.environment = [...node.environment, { key: '', value: '', type: 'str' }]
	}
</script>
<Input {node} prop="name" />
<Select bind:node prop="nodeRedVersion" button="{buttonIcon}" on:click={reloadVersions}>
    {#if (nrInfo.tags.indexOf(nodeRedVersionOnly) === -1 && nrInfo.versions.indexOf(nodeRedVersionOnly) === -1)}
        <option selected value="{node.nodeRedVersion}">{nodeRedVersionOnly}</option>
    {/if}
    {#each nrInfo.tags as tag}
	    <option selected={node.nodeRedVersion === 'tag:' + tag} value="{'tag:' + tag}">{tag}</option>
    {/each}
    {#each nrInfo.versions.reverse() as version}
	    <option selected={node.nodeRedVersion === 'version:' + version} value="{'version:' + version}">{version}</option>
    {/each}
</Select>
<EditableList sortable removable label="Environment Variables" icon="list" bind:elements={node.environment} let:element={environmentVariable} let:index addButton style="height: 200px;"
		on:add={addEnvironmentVariable}>
	<Row style="margin-bottom: 0px; width: 70%;">
		<Input inline value={environmentVariable.key} on:change={(e) => node.environment[index].key = e.detail.value} placeholder="Key"></Input>
		<TypedInput inline label=''
			value={environmentVariable.value}
			type={environmentVariable.type}
			types={['msg', 'flow', 'global', 'str', 'num', 'bool', 'json', 'jsonata', 'date', 'env']}
			on:change={(e) => {
				node.environment[index].value = e.detail.value
				node.environment[index].type = e.detail.type
			}}
			placeholder="Value">
		</TypedInput>
	</Row>
</EditableList>
