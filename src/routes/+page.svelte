<script lang="ts">
	import { Game } from '$lib/Game.svelte';
	import { Fish, Hunter, PieceType, Team } from '$lib/Piece.svelte';
	import { Terrain } from '$lib/Tile.svelte';

	let game = new Game();
	let selectedPiece: [number, number] | null = $state(null);
	let legalMoves: [number, number][] = $derived(game.getMoves(selectedPiece));
</script>

{#each game.board.board as row, i}
	<div class="row">
		{#each row as cell, j}
			{@const tile = game.getTile(i, j)}
			<div class={`cell ${tile.getClass()}`}>
				{#if tile.piece !== null}
					<button
						class:fish={tile.piece.type == PieceType.FISH}
						class:hunter={tile.piece.type == PieceType.HUNTER}
						onclick={() => {
							selectedPiece = [i, j];
						}}
					>
						{#if tile.piece.type == PieceType.FISH}
							F
						{:else}
							H
						{/if}
					</button>
				{/if}
			</div>
		{/each}
	</div>
{/each}

<style lang="scss">
	.row {
		display: flex;
	}
	.cell {
		width: 50px;
		height: 50px;
		border: 1px solid black;

		button {
			display: flex;
			justify-content: center;
			align-items: center;
			width: 100%;
			height: 100%;
		}
	}

	.safe {
		background-color: #44ff4455;
	}

	.sand {
		background-color: #ffff5555;
	}

	.water {
		background-color: #7777ff55;
	}
</style>
