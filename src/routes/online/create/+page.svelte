<script lang="ts">
	import { goto } from '$app/navigation';
	import { createMatch } from '$lib/client/currentMatches.svelte';
	import { onMount } from 'svelte';

	onMount(async () => {
		const match = await createMatch();

		// Redirect to the match page
		goto(`/online/${match.id}`);
	});
</script>
