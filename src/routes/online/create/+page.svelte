<script lang="ts">
	import { goto } from '$app/navigation';
	import { ClientMatch } from '$lib/classes/Match.svelte.js';
	import { setCurrentMatch } from '$lib/client/currentMatch.svelte';
	import { onMount } from 'svelte';

	let match: ClientMatch | null = $state(null);

	onMount(async () => {
		match = await ClientMatch.create();

		setCurrentMatch(match);

		// Redirect to the match page
		goto(`/online/${match.id}`);
	});
</script>
