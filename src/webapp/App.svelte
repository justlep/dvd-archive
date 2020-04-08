<script>
	import Discs from './Discs.svelte';
	import EditDiscForm from './EditDiscForm.svelte';
	import {editedDisc, editDisc, addDisc, autoAddNext} from './stores';
	import {version, repository} from '../../package';

	document.title += ' v' + version;

	function afterEdit({detail}) {
		editDisc(null);
		if (detail && detail.shouldReopen) {
			setTimeout(addDisc, 50);
		}
	}
</script>

<main>
	<h1>
		DVD Archive
		<small class="version">v{ version }</small>
	</h1>
	<p>powered by Svelte.. hopefully</p>

	{#if $editedDisc}
		<EditDiscForm disc={$editedDisc} on:close={afterEdit} />
	{:else}
		<Discs/>
	{/if}
</main>

<footer>
	&copy; 2019 Lennart Pegel.
	Source code available at <a href={repository.url} target="_blank">{repository.url}</a>
</footer>

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

	.version {
		font-size: 0.5em;
		text-transform: none;
	}

	@media (min-width: 640px) {
		main {
			max-width: none;
		}
	}

	footer {
		border: 1px solid #eee;
		background: #f0f0f0;
		text-align: center;
		padding: 0.5em 1.5em;
		font-size: 0.8em;
		z-index: 10;
        position: fixed;
        bottom: 0;
        left: 0;
        width: 100%;
	}
</style>
