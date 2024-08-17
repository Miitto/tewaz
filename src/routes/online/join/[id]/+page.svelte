<script lang="ts">
	import { goto } from '$app/navigation';
	import { joinMatch } from '$lib/client/currentMatches.svelte';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';

	onMount(async () => {
		const match = await joinMatch($page.params.id);

		// Redirect to the match page
		goto(`/online/${match.id}`);
	});
</script>
