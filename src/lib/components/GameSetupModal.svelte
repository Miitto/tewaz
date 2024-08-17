<script lang="ts">
	import type { GameConfig } from '$lib/classes/Game.svelte';
	import GameSetup from './GameSetup.svelte';

	interface Props {
		open: boolean;
		onNewConfig: (config: GameConfig) => void;
	}

	let { open = $bindable(false), onNewConfig }: Props = $props();

	let dialog: HTMLDialogElement;

	$effect(() => {
		if (open) {
			dialog.showModal();
		} else {
			dialog.close();
		}
	});

	function close() {
		open = false;
	}
</script>

<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<!-- svelte-ignore a11y_click_events_have_key_events -->
<dialog
	bind:this={dialog}
	onclick={(evt) => {
		if (evt.target === dialog) open = false;
	}}
>
	<div>
		<GameSetup {onNewConfig} {close} />
	</div>
</dialog>

<style lang="scss">
	dialog {
		padding: 0;
		border: none;
		background-color: transparent;
		border-radius: 5px;
		border: 1px solid #5555;

		div {
			width: 100%;
			height: 100%;
			color: hsl(var(--text));
			background-color: hsl(var(--bg));
			padding: 1em;
		}
	}

	dialog::backdrop {
		background-color: hsla(var(--bg), 0.5);
		backdrop-filter: blur(5px);
	}
</style>
