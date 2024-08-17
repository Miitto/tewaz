<script lang="ts">
	import { goto } from '$app/navigation';
	import type { GameConfig } from '$lib/classes/Game.svelte';
	import { createMatch } from '$lib/client/currentMatches.svelte';
	import GameSetup from '$lib/components/GameSetup.svelte';

	async function onNewConfig(config: GameConfig) {
		const match = await createMatch(config);

		// Redirect to the new match
		goto(`/online/${match.id}`);
	}
</script>

<svelte:head>
	<title>Tewăz - Match Creation</title>
</svelte:head>

<main>
	<h1>Match Creation</h1>
	<GameSetup {onNewConfig}>
		{#snippet saveButton(save)}
			<div class="save">
				<button class="save-btn" onclick={save}>Create Match</button>
			</div>
		{/snippet}
	</GameSetup>
</main>

<style lang="scss">
	main {
		display: flex;
		flex-direction: column;
		padding: 2em;
	}

	.save {
		display: flex;
		justify-content: end;
		margin-top: 2em;
		.save-btn {
			font-size: 1rem;
			padding: 1rem 2rem;
			border: 1px solid #5555;
			border-radius: 5px;
			background-color: hsl(var(--primary));

			&:hover {
				filter: brightness(1.1);
			}

			&:active {
				filter: brightness(0.9);
			}
		}
	}
</style>
