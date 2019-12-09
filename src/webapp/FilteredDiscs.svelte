<script>
    import {editDisc, deleteDisc, order, orderByDisc, orderByTitle} from './stores';
    import DiscCover from './DiscCover.svelte';

    export let discs;
    export let filter;

    $: normalizedFilter = filter ? filter.toLowerCase().trim() : '';
    $: filteredDiscs = !discs ? [] :
             normalizedFilter ? discs.filter(disc => disc.title.toLowerCase().includes(normalizedFilter)) : [].concat(discs);

    $: sortedFilteredDiscs = filteredDiscs.sort(
            $order === 'title-asc' ? (a,b) => a.compareToByTitle(b):
            $order === 'title-desc' ? (b,a) => a.compareToByTitle(b) :
            $order === 'disc-desc' ? (b,a) => a.compareToByDiscNumber(b) :
                                     (a,b) => a.compareToByDiscNumber(b)
    );

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

{#if !sortedFilteredDiscs.length}
	<p>- No discs -</p>
{:else}
	<table>
	    <thead><tr>
	        <th on:click={orderByDisc} data-order class={$order.startsWith('disc') ? 'selected-order' : ''}>Disc #</th>
            <th>Image</th>
	        <th on:click={orderByTitle} data-order class={$order.startsWith('title') ? 'selected-order' : ''}>Title</th>
	        <th>EAN</th>
            <th>Search</th>
	        <th></th>
        </tr></thead>
        <tbody>
        {#each sortedFilteredDiscs as disc (disc.id)}
			<tr on:click={(e) => e.target.classList.contains('edit') ? editDisc(disc) : null}>
				<td class="edit">{ disc.discNumber }</td>
                <td>
                    <DiscCover disc={disc}/>
                </td>
                <td class="edit title">{ disc.title }</td>
                <td class="edit">{ disc.ean }</td>
                <td>
                    <a href={'https://www.imdb.com/find?q=' + encodeURIComponent(disc.title)} target="_blank">IMDB</a>
                </td>
                <td width="1">
                    {#if disc === discToDelete}
		                <a href="#foo" role="button" on:click|stopPropagation|preventDefault={() => discToDelete = null}>Cancel</a> |
                    {/if}
                    <a href="#foo" role="button" on:click|stopPropagation|preventDefault="{() => confirmAndDeleteDisc(disc)}">{disc === discToDelete ? 'DELETE' : 'Delete'}</a>
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

    .title {
        font-weight: bold;
        color: #4d6599;
    }

    th.selected-order,
    th[data-order]:hover {
        background: #dadada;
        color: #4d6599;
        cursor: pointer;
    }
</style>
