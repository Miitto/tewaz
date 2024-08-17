<script lang="ts">
	import { Coord, type Point } from '$lib/classes/Coord';
	import type { Game } from '$lib/classes/Game.svelte';
	import type { Move } from '$lib/classes/Move.svelte';
	import { Team } from '$lib/classes/Piece.svelte';
	import Tile from '$lib/components/Tile.svelte';

	interface Props {
		game: Game;
		selectedPiece: Coord | null;
		legalMoves: Move[];
		selectPiece: (pos: Coord) => void;
		stageMove: (pos: Point) => void;
		unstageMove: (target: Point) => void;
	}

	const { game, selectedPiece, legalMoves, selectPiece, stageMove, unstageMove }: Props = $props();
</script>

<div
	class="board"
	style={`--rows: ${game.board.height}; --cols: ${game.board.width};`}
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
					{stageMove}
					{unstageMove}
					pos={new Coord(i, j)}
				/>
			{/each}
		</div>
	{/each}
</div>
