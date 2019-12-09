<script>
	import Discs from './Discs.svelte';
	import EditDiscForm from './EditDiscForm.svelte';
	import {editedDisc, editDisc, addDisc, autoAddNext} from './stores';

	function afterEdit({detail}) {
		editDisc(null);
		if (detail && detail.shouldReopen) {
			setTimeout(addDisc, 50);
		}
	}
</script>

<main>
	<h1>DVD Archive</h1>
	<p>powered by Svelte.. hopefully</p>

	{#if $editedDisc}
		<EditDiscForm disc={$editedDisc} on:close={afterEdit} />
	{:else}
		<Discs/>
	{/if}

</main>

<style>
	main {
		text-align: center;
		padding: 1em;
		margin: 0 auto;
	}

	h1 {
		color: #ff3e00;
		text-transform: uppercase;
		font-size: 4em;
		font-weight: 100;
		margin: 0;
	}

	@media (min-width: 640px) {
		main {
			max-width: none;
		}
	}
</style>
