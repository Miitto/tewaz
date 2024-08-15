<script lang="ts">
	import { Game } from '$lib/Game.svelte';
	import '$lib/styles/board.scss';
	import { Fish, Hunter, PieceType, Team } from '$lib/Piece.svelte';
	import { Terrain } from '$lib/Tile.svelte';
	import type { Move } from '$lib/Move.svelte';
	import { Coord } from '$lib/Coord';

	let game = new Game();

	/** Piece selected by the user */
	let selectedPiece: Coord | null = $state(null);

	/** Moves the selected piece can make */
	let legalMoves: Move[] = $derived(game.getMoves(selectedPiece));

	function selectPiece(i: number, j: number) {
		if (selectedPiece && selectedPiece.x === i && selectedPiece.y === j) {
			selectedPiece = null;
		} else {
			selectedPiece = new Coord(i, j);
		}
	}

	function pendMove(i: number, j: number) {
		if (selectedPiece) {
			game.stageMove(selectedPiece, new Coord(i, j));
			selectedPiece = null;
		}
	}

	// $effect(() => {
	// 	console.log(legalMoves);
	// });
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
					class:legal-move={legalMoves.some((move) => move.target.x == i && move.target.y == j)}
					class:selected={selectedPiece && selectedPiece.x === i && selectedPiece.y === j}
				>
					{#if tile.piece !== null}
						{@const atRisk = game.pendingMoves.some((move) =>
							move.willCaptureCoords().some(([x, y]) => x == i && y == j)
						)}
						<button
							class="piece"
							class:fish={tile.piece.type == PieceType.FISH}
							class:hunter={tile.piece.type == PieceType.HUNTER}
							class:moving={tile.moving}
							class:danger={atRisk}
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
							onclick={() => game.unstageMove(new Coord(i, j))}
						></button>
					{:else if legalMoves.some((move) => move.target.x == i && move.target.y == j)}
						{@const move = legalMoves.find((move) => move.target.x == i && move.target.y == j)}
						<button
							class="legal-move-btn"
							class:danger={move?.isDangerous()}
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
