<script lang="ts">
	import { Coord } from '$lib/classes/Coord';
	import type { Game } from '$lib/classes/Game.svelte';
	import type { Move } from '$lib/classes/Move.svelte';
	import { PieceType, Team, type Piece } from '$lib/classes/Piece.svelte';
	import type { Tile } from '$lib/classes/Tile.svelte';

	interface Props {
		tile: Tile;
		legalMoves: Move[];
		selectedPiece: Coord | null;
		game: Game;
		selectPiece: (pos: Coord) => void;
		stageMove: (pos: Coord) => void;
		unstageMove: (target: Coord) => void;
		pos: Coord;
	}

	const { tile, legalMoves, selectedPiece, game, selectPiece, stageMove, unstageMove, pos }: Props =
		$props();

	const hasSelectedPiece = $derived(selectedPiece != null);
	const thisIsSelectedPiece = $derived(selectedPiece?.equals(pos));

	const pieceMovingHere = $derived(game.pendingMoves.some((move) => move.hasTarget(pos)));
	const atRisk = $derived(
		game.pendingMoves.some((move) =>
			move.willCaptureCoords().some((other: Coord) => pos.equals(other))
		)
	);

	const legalMove = $derived(legalMoves.find((move) => pos.equals(move.target)));
	const isDangerous = $derived(legalMove?.isDangerous() ?? false);
</script>

{#snippet token(piece: Piece | null)}
	{#if piece}
		<div
			class="token"
			class:team-one={piece.team == Team.ONE}
			class:team-two={piece.team == Team.TWO}
		>
			{#if piece.type == PieceType.FISH}
				F
			{:else}
				H
			{/if}
		</div>
	{/if}
{/snippet}

<div
	class={`cell ${tile.getClass()}`}
	class:legal-move={legalMoves.some((move) => pos.equals(move.target))}
	class:selected={thisIsSelectedPiece}
>
	{#if !!legalMove}
		<button
			class="legal-move-btn"
			class:piece={!!tile.piece}
			class:danger={isDangerous}
			onclick={() => {
				stageMove(pos);
			}}
		>
			{@render token(tile.piece)}
		</button>
	{:else if pieceMovingHere}
		<button
			disabled={selectedPiece != null}
			class="moving-to"
			class:piece={!!tile.piece}
			onclick={() => unstageMove(pos)}
		>
			{@render token(tile.piece)}
		</button>
	{:else if !!tile.piece}
		<button
			class="piece"
			class:moving={tile.moving}
			class:danger={atRisk}
			disabled={tile.moving || tile.team != game.teamTurn}
			onclick={() => {
				selectPiece(pos);
			}}
		>
			{@render token(tile.piece)}
		</button>
	{/if}
</div>
