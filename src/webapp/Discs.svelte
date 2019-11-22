<script>
    import Spinner from './Spinner.svelte';
    import FilteredDiscs from './FilteredDiscs.svelte';
    import api from './util/api';
    import Disc from './model/Disc';
    import {editDisc} from './stores';

	let discsPromise = Promise.resolve([]);

	let filter = '';

	function refreshList() {
        discsPromise = api.get('/disc').then(result => result.discs.map(d => new Disc(d)));
    }

    function addDisc() {
	    editDisc( new Disc({}) );
    }

    refreshList();
</script>

<section>
	<h2>
        Disc List
        <small><a role="button" on:click={refreshList}>Refresh</a></small>
    </h2>

	<input type="text" placeholder="Filter..." bind:value={filter}/>
    <button type="button" on:click={addDisc}>New disc</button>

    {#await discsPromise}

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
