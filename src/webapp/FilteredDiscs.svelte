<script>
    import {editDisc} from './stores';

    export let discs;
    export let filter;

    $: normalizedFilter = filter ? filter.toLowerCase().trim() : '';
    $: filteredDiscs = !discs ? [] :
             normalizedFilter ? discs.filter(disc => disc.title.toLowerCase().includes(normalizedFilter)) : discs;

</script>

{#if !filteredDiscs.length}
	<p>- No discs -</p>
{:else}
	<table>
	    <thead><tr>
	        <th>Disc #</th>
	        <th>Title</th>
	        <th>EAN</th>
	        <th></th>
        </tr></thead>
        <tbody>
        {#each filteredDiscs as disc}
			<tr>
				<td>{ disc.discNumber }</td>
                <td>{ disc.title }</td>
                <td>{ disc.ean }</td>
                <td>
                    <a href="#" role="button" on:click="{() => editDisc(disc)}">Edit</a>
                </td>
			</tr>
        {/each}
        </tbody>
	</table>
{/if}

<style>
    table {
        width: 100%;
        text-align: left;
    }

    tbody tr:nth-child(odd) {
        background-color: #eee;
    }

    td:last-child {
        text-align: center;
    }

</style>
