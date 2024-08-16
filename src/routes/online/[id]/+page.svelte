<script lang="ts">
	import '$lib/styles/board.scss';
	import { Team } from '$lib/classes/Piece.svelte';
	import type { Move } from '$lib/classes/Move.svelte';
	import { Coord, type Point } from '$lib/classes/Coord';
	import Rules from '$lib/components/Rules.svelte';
	import Board from '$lib/components/Board.svelte';
	import { ClientMatch } from '$lib/classes/Match.svelte';
	import { page } from '$app/stores';

	const { data } = $props();

	const matchExists = $derived(data.matchExists);
	const matchString = $derived(data.matchString);
	const pendingMoves = $derived(data.pendingMoves);

	let isSetup = $state(false);

	$effect(() => {
		if (matchExists) {
			document.title = 'Tewăz - Online Play';
		} else {
			document.title = 'Tewăz - Match not found';
		}

		console.log('Match exists:', matchExists);
	});

	$effect(() => {
		match.setupBoard(matchString, pendingMoves);
		isSetup = true;
	});

	let match = new ClientMatch($page.params.id);

	/** Piece selected by the user */
	let selectedPiece: Coord | null = $state(null);

	/** Moves the selected piece can make */
	let legalMoves: Move[] = $derived(match.game.getMoves(selectedPiece));

	function selectPiece(pos: Coord) {
		if (selectedPiece && pos.equals(selectedPiece)) {
			selectedPiece = null;
		} else {
			selectedPiece = pos;
		}
	}

	function stageMove(pos: Coord) {
		if (selectedPiece) {
			match.stageMove(selectedPiece, pos);
			selectedPiece = null;
		}
	}

	function unstageMove(target: Point) {
		match.unstageMove(target);
	}

	// $effect(() => {
	// 	console.log(legalMoves);
	// });
</script>

{#if matchExists}
	{#if isSetup}
		<span>
			<a href="/">&lt;-- Back to Menu</a>
			<h1>Tewăz</h1>
			<h2>Online Play</h2>
		</span>
		<main>
			<div class="left">
				<Board
					game={match.game}
					{selectedPiece}
					{legalMoves}
					{selectPiece}
					{stageMove}
					{unstageMove}
				/>
				<button
					class="end-turn"
					class:turn-one={match.game.teamTurn == Team.ONE}
					class:turn-two={match.game.teamTurn == Team.TWO}
					disabled={match.game.movesUsed != match.game.moveAllowance}
					onclick={() => match.endTurn()}>End Turn</button
				>
				<p>Moves left: {match.game.moveAllowance - match.game.movesUsed}</p>
			</div>
			<div class="right">
				<h2>Rules</h2>
				<Rules />
			</div>
		</main>
	{:else}
		<p>Loading Game...</p>
	{/if}
{:else}
	<main>
		<div>
			<h1>Match not found</h1>
			<p>
				It seems the match you're looking for doesn't exist. Please check the URL and try again.
			</p>

			<div class="separate">
				<a href="/">Back to Menu</a>
				<a href="/online/create">Create a new match</a>
			</div>
		</div>
	</main>
{/if}

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

	.separate {
		display: flex;
		justify-content: space-between;
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
