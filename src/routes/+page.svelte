<script lang="ts">
	let roomCode = $state('');
	const roomLink = $derived(`/online/join/${roomCode}`);
</script>

<h1>Tewăz</h1>
<main>
	<div class="play">
		<div>
			<h2>Local Play</h2>
			<a href="/local">New Game</a>
		</div>

		<div class="online">
			<h2>Online Play</h2>
			<a href="/online/create">Create a Room</a>

			<hr />
			<div class="join">
				<input bind:value={roomCode} placeholder="Room Code" />
				{#if !!roomCode}
					<a href={roomLink}>Join Room</a>
				{:else}
					<span>Join Room</span>
				{/if}
			</div>
		</div>
	</div>
</main>

<style lang="scss">
	main {
		display: flex;
		height: 100vh;
		padding: 1em;
	}

	h1 {
		width: 100%;
		text-align: center;
	}

	h2 {
		margin-bottom: 0.5em;
	}

	.join {
		display: flex;
		gap: 0.5em;

		span {
			color: grey;
		}
	}
</style>
