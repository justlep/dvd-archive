<script>
    import Spinner from './Spinner.svelte';
    import FilteredDiscs from './FilteredDiscs.svelte';
    import Disc from './model/Disc';
    import {editDisc, addDisc, reloadDiscs, loadingDiscsPromise, filter, allDiscs} from './stores';

    reloadDiscs();
</script>

<section>
	<h2>
        Disc List
        <small><a href="#foo" role="button" on:click={reloadDiscs}>Refresh</a></small>
    </h2>

	<input type="text" placeholder="Filter..." bind:value={$filter} on:keydown={(e) => e.key === 'Escape' && ($filter = '')}/>
    {#if $filter}
	    <button type="button" on:click={() => $filter = ''}>Clear</button>
    {/if}
    <button type="button" on:click={addDisc}>Add disc</button>

    {#await $loadingDiscsPromise}

        <p>Loading...</p>
        <Spinner/>

    {:then foo}

	    <FilteredDiscs discs={$allDiscs} filter={$filter} />

    {:catch error}

        <p class="error">{ error }</p>

    {/await}

</section>

<style>
    .error {
        color: red;
    }

</style>
