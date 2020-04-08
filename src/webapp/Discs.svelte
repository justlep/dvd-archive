<script>
    import Spinner from './Spinner.svelte';
    import FilteredDiscs from './FilteredDiscs.svelte';
    import Disc from './model/Disc';
    import {editDisc, addDisc, reloadDiscs, loadingDiscsPromise, filter, allDiscs} from './stores';

    let listMode = 'list';

    reloadDiscs();
</script>

<section>
    <p>
	    <a href="#foo" role="button" on:click={() => listMode = listMode === 'list' ? 'grid' : 'list'}>{listMode === 'list' ? 'Show Grid' : 'Show List'}</a>
	    |
	    <a href="#foo" role="button" on:click={reloadDiscs}>Refresh</a>
    </p>

    <span class={listMode === 'grid' ? 'filter--grid' : 'filter--list'}>
	<input type="text" placeholder="Filter..." bind:value={$filter} on:keydown={(e) => e.key === 'Escape' && ($filter = '')}/>
    {#if $filter}
	    <button type="button" on:click={() => $filter = ''}>Clear</button>
    {/if}
    </span>
    {#if listMode !== 'grid'}
    <button type="button" on:click={addDisc}>Add disc</button>
    {/if}

    {#await $loadingDiscsPromise}

        <p>Loading...</p>
        <Spinner/>

    {:then foo}

	    <FilteredDiscs discs={$allDiscs} filter={$filter} listMode={listMode} />

    {:catch error}

        <p class="error">{ error }</p>

    {/await}

</section>

<style>
    .error {
        color: red;
    }

    .filter--grid {
        position: fixed;
        left: 5px;
        bottom: 2.5em;
        z-index: 999;
    }

    .filter--grid * {
        margin-bottom: 0;
    }

</style>
