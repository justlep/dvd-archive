<script>
    import {editDisc, deleteDisc} from './stores';

    export let discs;
    export let filter;

    $: normalizedFilter = filter ? filter.toLowerCase().trim() : '';
    $: filteredDiscs = !discs ? [] :
             normalizedFilter ? discs.filter(disc => disc.title.toLowerCase().includes(normalizedFilter)) : discs;

    let discToDelete;

    function confirmAndDeleteDisc(disc) {
        if (disc !== discToDelete) {
            discToDelete = disc;
        } else {
            deleteDisc(disc)
                    .then(() => discToDelete = null)
                    .catch(err => alert(err));
        }
    }

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
        {#each filteredDiscs as disc (disc.id)}
			<tr on:click={() => editDisc(disc)}>
				<td>{ disc.discNumber }</td>
                <td>{ disc.title }</td>
                <td>{ disc.ean }</td>
                <td width="1">
                    {#if disc === discToDelete}
		                <a href="#" role="button" on:click|stopPropagation={() => discToDelete = null}>Cancel</a> |
                    {/if}
                    <a href="#" role="button" on:click|stopPropagation="{() => confirmAndDeleteDisc(disc)}">{disc === discToDelete ? 'DELETE' : 'Delete'}</a>
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

    td, th {
	    padding: 3px 6px;
    }

    th {
        background: #ddd;
    }

    td {
        background: #e9e9e9;
    }

    tbody tr:nth-child(odd) {
        background-color: #eee;
    }

    td:last-child {
        text-align: center;
        white-space: nowrap;
    }

    tbody tr:hover td {
        cursor: pointer;
        background-color: orange;
    }
</style>
