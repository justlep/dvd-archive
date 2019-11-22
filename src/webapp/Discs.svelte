<script>
    import Spinner from './Spinner.svelte';
    import FilteredDiscs from './FilteredDiscs.svelte';
    import Disc from './model/Disc';
    import {editDisc, reloadDiscs, loadingDiscsPromise} from './stores';

	let filter = '';

    function addDisc() {
	    editDisc( new Disc({}) );
    }

    reloadDiscs();
</script>

<section>
	<h2>
        Disc List
        <small><a role="button" on:click={reloadDiscs}>Refresh</a></small>
    </h2>

	<input type="text" placeholder="Filter..." bind:value={filter}/>
    <button type="button" on:click={addDisc}>Add disc</button>

    {#await $loadingDiscsPromise}

        <p>Loading...</p>
        <Spinner/>

    {:then discs}

	    <FilteredDiscs discs={discs} filter={filter} />

    {:catch error}

        <p class="error">{ error }</p>

    {/await}

</section>

<style>
    .error {
        color: red;
    }
</style>
