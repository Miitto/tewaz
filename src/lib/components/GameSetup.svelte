<script lang="ts">
	import type { GameConfig } from '$lib/classes/Game.svelte';
	import {
		PieceType,
		Team,
		type Piece as PieceClass,
		Fish,
		Hunter
	} from '$lib/classes/Piece.svelte';
	import { Board } from '$lib/classes/Board.svelte';

	interface Props {
		onNewConfig: (config: GameConfig) => void;
		close: () => void;
	}

	const { onNewConfig, close }: Props = $props();

	interface Piece {
		team: Team | null;
		type: PieceType | null;
	}

	let t1Fish = {
		team: Team.ONE,
		type: PieceType.FISH
	};

	let t1Hunter = {
		team: Team.ONE,
		type: PieceType.HUNTER
	};

	let t2Fish = {
		team: Team.TWO,
		type: PieceType.FISH
	};

	let t2Hunter = {
		team: Team.TWO,
		type: PieceType.HUNTER
	};

	let rows = $state(5);
	let cols = $state(11);

	let moveAllowance = $state(2);
	let teamMaxInSandCol = $state(2);
	let teamMaxInWaterCol = $state(1);
	let startingTeam = $state<Team | null>(null);

	let calcBoard: (Piece | null)[][] = $derived(
		Array.from({ length: rows }, () => Array.from({ length: cols }, () => null))
	);
	let board: (Piece | null)[][] = $state(
		(() => {
			const board: (Piece | null)[][] = Array.from({ length: rows }, () =>
				Array.from({ length: cols }, () => null)
			);
			board[0][0] = t1Fish;
			board[1][0] = t1Fish;
			board[2][0] = t1Hunter;
			board[3][0] = t1Fish;
			board[4][0] = t1Fish;

			board[0][10] = t2Fish;
			board[1][10] = t2Fish;
			board[2][10] = t2Hunter;
			board[3][10] = t2Fish;
			board[4][10] = t2Fish;

			return board;
		})()
	);

	$effect(() => {
		// Copy pieces into calcBoard
		board.forEach((row, i) => {
			row.forEach((piece, j) => {
				if (i >= rows || j >= cols) {
					return;
				}
				try {
					calcBoard[i][j] = piece;
				} catch (e) {}
			});
		});

		// Update board
		board = calcBoard;
	});

	let selectedPaint: string | null = $state(null);
	let selectedPiece: Piece | null = $state(null);

	let waterCols = $state([5]);
	let sandCols = $state([4, 6]);

	function clicked(row: number, col: number) {
		if (selectedPaint !== null) {
			if (col == 0 || col == cols - 1) {
				return;
			}
			if (selectedPaint === 'water') {
				sandCols = sandCols.filter((c) => c !== col);

				waterCols = [...waterCols, col];
			} else if (selectedPaint === 'sand') {
				waterCols = waterCols.filter((c) => c !== col);

				sandCols = [...sandCols, col];
			} else {
				sandCols = sandCols.filter((c) => c !== col);
				waterCols = waterCols.filter((c) => c !== col);
			}
		}

		if (selectedPiece !== null) {
			if (selectedPiece.team === null) {
				board[row][col] = null;
			} else {
				board[row][col] = selectedPiece;
			}
		}
	}

	function selectPaint(paint: string) {
		selectedPaint = paint;
		selectedPiece = null;
	}

	function selectPiece(piece: Piece | null) {
		if (piece) selectedPiece = piece;
		else {
			selectedPiece = {
				team: null,
				type: null
			};
		}
		selectedPaint = null;
	}

	function onSave() {
		const newBoard: Board = new Board();
		const pieceBoard: (PieceClass | null)[][] = board.map((row) =>
			row.map((piece) => {
				if (piece === null) return null;
				if (piece.type === PieceType.FISH) {
					return new Fish(piece.team!);
				} else {
					return new Hunter(piece.team!);
				}
			})
		);

		newBoard.board = pieceBoard;

		const boardString = '0 ' + newBoard.toString();

		onNewConfig({
			initialBoardSetup: boardString,
			moveAllowance,
			teamMaxInSandCol,
			teamMaxInWaterCol,
			sandCols,
			waterCols,
			startingTeam
		});

		close();
	}
</script>

<div class="container">
	<div class="size">
		<label for="rows">Rows</label>
		<label for="cols">Columns</label>
		<input type="number" bind:value={rows} min="1" />
		<input type="number" bind:value={cols} min="1" />
	</div>

	<div class="board">
		{#each board as r, row}
			<div class="row">
				{#each r as c, col}
					<button
						class="cell"
						class:water={waterCols.some((c) => c == col)}
						class:sand={sandCols.some((c) => c == col)}
						class:safe={col == 0 || col == r.length - 1}
						onclick={() => clicked(row, col)}
					>
						{#if c !== null}
							<div
								class="token"
								class:team-one={c.team == Team.ONE}
								class:team-two={c.team == Team.TWO}
							>
								{c.type == PieceType.FISH ? 'F' : 'H'}
							</div>
						{/if}
					</button>
				{/each}
			</div>
		{/each}
	</div>

	<div class="paint">
		<p>Paints</p>
		<div>
			<button
				class="water"
				class:active={selectedPaint == 'water'}
				title="Water"
				onclick={() => selectPaint('water')}
			></button>
			<button
				class="sand"
				class:active={selectedPaint == 'sand'}
				title="Sand"
				onclick={() => selectPaint('sand')}
			></button>
			<button
				class="erase"
				class:active={selectedPaint == 'erase'}
				title="Erase"
				onclick={() => selectPaint('erase')}
			></button>
		</div>
	</div>
	<div class="pieces">
		<p>Pieces</p>
		<div>
			<button
				class="token team-one fish"
				class:active={selectedPiece?.team == Team.ONE && selectedPiece?.type == PieceType.FISH}
				title="Team One Fish"
				onclick={() => selectPiece(t1Fish)}>F</button
			>
			<button
				class="token team-one hunter"
				class:active={selectedPiece?.team == Team.ONE && selectedPiece?.type == PieceType.HUNTER}
				title="Team One Hunter"
				onclick={() => selectPiece(t1Hunter)}>H</button
			>
			<button
				class="token team-two fish"
				class:active={selectedPiece?.team == Team.TWO && selectedPiece?.type == PieceType.FISH}
				title="Team Two Fish"
				onclick={() => selectPiece(t2Fish)}>F</button
			>
			<button
				class="token team-two hunter"
				class:active={selectedPiece?.team == Team.TWO && selectedPiece?.type == PieceType.HUNTER}
				title="Team Two Hunter"
				onclick={() => selectPiece(t2Hunter)}>H</button
			>
			<button
				class="token"
				class:active={selectedPiece?.team === null}
				title="Team Two Hunter"
				onclick={() => selectPiece(null)}
			></button>
		</div>
	</div>
	<div class="settings">
		<label for="moveAllowance">Move Allowance</label>
		<label for="maxSandCol">Max in Sand Column</label>
		<label for="maxWaterCol">Max in Water Column</label>
		<label for="startingTeam">Starting Team</label>
		<input type="number" bind:value={moveAllowance} min="1" />
		<input type="number" bind:value={teamMaxInSandCol} min="1" />
		<input type="number" bind:value={teamMaxInWaterCol} min="1" />
		<select bind:value={startingTeam}>
			<option value={null}>Random</option>
			<option value={Team.ONE}>Team One</option>
			<option value={Team.TWO}>Team Two</option>
		</select>
	</div>

	<div class="save">
		<button onclick={onSave}>Save</button>
	</div>
</div>

<style lang="scss">
	p {
		margin: 0;
	}

	.container {
		display: flex;
		flex-direction: column;
		gap: 1em;
	}

	.save {
		display: flex;
		justify-content: end;

		button {
			padding: 0.5em 1em;
			border: none;
			border-radius: 5px;
			background-color: hsl(var(--success));
			cursor: pointer;

			&:hover {
				filter: brightness(1.1);
			}

			&:active {
				filter: brightness(0.9);
			}
		}
	}

	.size,
	.settings {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		column-gap: 1em;
		justify-content: space-between;

		select,
		input {
			padding: 0.25em 0.5em;
			border: 1px solid hsl(var(--text));
			background-color: hsl(var(--bg));
			color: hsl(var(--text));
			border-radius: 5px;
		}
	}

	.settings {
		grid-template-columns: repeat(4, 1fr);
	}

	.row {
		display: flex;
	}

	.cell {
		width: 100%;
		height: 100%;
		display: flex;
		justify-content: center;
		align-items: center;
		aspect-ratio: 1 / 1;
		border: 1px solid hsl(var(--text));
		background-color: hsl(var(--bg));

		&:hover {
			filter: brightness(1.6);
		}

		&:active {
			filter: brightness(0.75);
		}
	}

	.water {
		background-color: hsl(var(--water));
	}

	.sand {
		background-color: hsl(var(--sand));
	}

	.safe {
		background-color: hsl(var(--safe));
	}

	.paint,
	.pieces {
		display: flex;
		flex-direction: column;
		gap: 0.25em;

		div {
			display: flex;
			gap: 1em;
		}

		button {
			width: 2em;
			height: 2em;
			border: none;
			border-radius: 50%;
			cursor: pointer;

			&.active {
				outline: hsl(var(--text)) solid 2px;
			}
		}
	}

	.token {
		width: 85%;
		aspect-ratio: 1 / 1;
		border-radius: 50%;
		display: flex;
		justify-content: center;
		align-items: center;

		&.team-one {
			color: hsl(var(--team-one-text));
			background-color: hsl(var(--team-one));
		}

		&.team-two {
			color: hsl(var(--team-two-text));
			background-color: hsl(var(--team-two));
		}
	}
</style>
