<script lang="ts">
	import { Game } from '$lib/Game.svelte';
	import '$lib/styles/board.scss';
	import { Fish, Hunter, PieceType, Team } from '$lib/Piece.svelte';
	import { Terrain } from '$lib/Tile.svelte';
	import type { Move } from '$lib/Move.svelte';
	import { Coord } from '$lib/Coord';
	import Tile from '$lib/components/Tile.svelte';
	import Rules from '$lib/components/Rules.svelte';

	let game = new Game();

	/** Piece selected by the user */
	let selectedPiece: Coord | null = $state(null);

	/** Moves the selected piece can make */
	let legalMoves: Move[] = $derived(game.getMoves(selectedPiece));

	function selectPiece(pos: Coord) {
		if (selectedPiece && pos.equals(selectedPiece)) {
			selectedPiece = null;
		} else {
			selectedPiece = pos;
		}
	}

	function pendMove(pos: Coord) {
		if (selectedPiece) {
			game.stageMove(selectedPiece, pos);
			selectedPiece = null;
		}
	}

	// $effect(() => {
	// 	console.log(legalMoves);
	// });
</script>

<main>
	<div class="left">
		<div
			class="board"
			class:turn-one={game.teamTurn == Team.ONE}
			class:turn-two={game.teamTurn == Team.TWO}
		>
			{#each game.tiles as row, i}
				<div class="row">
					{#each row as tile, j}
						<Tile
							{tile}
							{legalMoves}
							{selectedPiece}
							{game}
							{selectPiece}
							{pendMove}
							pos={new Coord(i, j)}
						/>
					{/each}
				</div>
			{/each}
		</div>
		<button
			class="end-turn"
			class:turn-one={game.teamTurn == Team.ONE}
			class:turn-two={game.teamTurn == Team.TWO}
			disabled={game.movesUsed != game.moveAllowance}
			onclick={() => game.endTurn()}>End Turn</button
		>
		<p>Moves left: {game.moveAllowance - game.movesUsed}</p>
	</div>
	<div class="right">
		<h2>Rules</h2>
		<Rules />
	</div>
</main>

<style lang="scss">
	main {
		display: flex;
		justify-content: space-around;
		padding: 1rem;
		gap: 1rem;
		flex-wrap: wrap;
		flex-grow: 1;
	}

	.left {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	@media (prefers-color-scheme: dark) {
		main {
			background-color: #333;
			color: white;
		}
	}
</style>
