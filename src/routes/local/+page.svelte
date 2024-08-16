<script lang="ts">
	import { Game } from '$lib/classes/Game.svelte';
	import '$lib/styles/board.scss';
	import { Team } from '$lib/classes/Piece.svelte';
	import type { Move } from '$lib/classes/Move.svelte';
	import { Coord, type Point } from '$lib/classes/Coord';
	import Rules from '$lib/components/Rules.svelte';
	import Board from '$lib/components/Board.svelte';

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

	function stageMove(pos: Point) {
		if (selectedPiece) {
			game.stageMove(selectedPiece, pos);
			selectedPiece = null;
		}
	}

	function unstageMove(target: Point) {
		game.unstageMove(target);
	}

	// $effect(() => {
	// 	console.log(legalMoves);
	// });
</script>

<span>
	<a href="/">&lt;-- Back to Menu</a>
	<h1>Tewăz</h1>
	<h2>Local Play</h2>
</span>
<main>
	<div class="left">
		<Board {game} {selectedPiece} {legalMoves} {selectPiece} {stageMove} {unstageMove} />
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
	span {
		padding-left: 1em;
		display: inline-flex;
		align-items: baseline;
		gap: 1em;

		h1 {
			margin: 0;
			width: fit-content;
		}
	}

	main {
		display: flex;
		justify-content: space-around;
		padding: 2rem;
		gap: 1rem;
		flex-wrap: wrap;
		flex-grow: 1;
	}

	.left {
		display: flex;
		flex-direction: column;
		flex: 1 0 50%;
		gap: 1rem;
		height: fit-content;
	}
</style>
