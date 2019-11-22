<script>
	import Discs from './Discs.svelte';
	import EditDiscForm from './EditDiscForm.svelte';
	import {editedDisc, editDisc} from './stores';
</script>

<main>
	<h1>DVD Archive</h1>
	<p>powered by Svelte.. hopefully</p>

	{#if $editedDisc}
		<EditDiscForm disc={$editedDisc} on:close={() => editDisc(null)} />
	{:else}
		<Discs/>
	{/if}

</main>

<style>
	main {
		text-align: center;
		padding: 1em;
		max-width: 240px;
		margin: 0 auto;
	}

	h1 {
		color: #ff3e00;
		text-transform: uppercase;
		font-size: 4em;
		font-weight: 100;
	}

	@media (min-width: 640px) {
		main {
			max-width: none;
		}
	}
</style>
