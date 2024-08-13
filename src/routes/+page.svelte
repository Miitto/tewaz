<script lang="ts">
	import { Game } from '$lib/Game.svelte';
	import '$lib/styles/board.scss';
	import { Fish, Hunter, PieceType, Team } from '$lib/Piece.svelte';
	import { Terrain } from '$lib/Tile.svelte';

	let game = new Game();

	/** Piece selected by the user */
	let selectedPiece: [number, number] | null = $state(null);

	/** Moves the selected piece can make */
	let legalMoves: [number, number][] = $derived(game.getMoves(selectedPiece));

	function selectPiece(i: number, j: number) {
		if (selectedPiece && selectedPiece[0] === i && selectedPiece[1] === j) {
			selectedPiece = null;
		} else {
			selectedPiece = [i, j];
		}
	}

	function pendMove(i: number, j: number) {
		if (selectedPiece) {
			game.stageMove(selectedPiece, [i, j]);
			selectedPiece = null;
		}
	}
</script>

<div
	class="board"
	class:turn-one={game.teamTurn == Team.ONE}
	class:turn-two={game.teamTurn == Team.TWO}
>
	{#each game.tiles as row, i}
		<div class="row">
			{#each row as tile, j}
				<div
					class={`cell ${tile.getClass()}`}
					class:legal-move={legalMoves.some(([x, y]) => x == i && y == j)}
					class:selected={selectedPiece && selectedPiece[0] === i && selectedPiece[1] === j}
				>
					{#if tile.piece !== null}
						<button
							class="piece"
							class:fish={tile.piece.type == PieceType.FISH}
							class:hunter={tile.piece.type == PieceType.HUNTER}
							class:moving={tile.moving}
							disabled={tile.moving || tile.team != game.teamTurn}
							onclick={() => {
								selectPiece(i, j);
							}}
						>
							<div
								class="token"
								class:team-one={tile.team == Team.ONE}
								class:team-two={tile.team == Team.TWO}
							>
								{#if tile.piece.type == PieceType.FISH}
									F
								{:else}
									H
								{/if}
							</div>
						</button>
					{:else if game.pendingMoves.some((move) => move.hasTarget([i, j]))}
						<button
							disabled={selectedPiece != null}
							class="moving-to"
							onclick={() => game.unstageMove([i, j])}
						></button>
					{:else if legalMoves.some(([x, y]) => x == i && y == j)}
						<button
							class="legal-move-btn"
							onclick={() => {
								pendMove(i, j);
							}}
						>
						</button>
					{/if}
				</div>
			{/each}
		</div>
	{/each}
</div>
<button onclick={() => game.endTurn()}>End Turn</button>
<p>Moves left: {game.moveAllowance - game.movesUsed}</p>

<style lang="scss">
</style>
