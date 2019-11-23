<script>
    import { createEventDispatcher, onMount } from 'svelte';
    import {saveOrUpdateDisc} from './stores'
    import Disc from './model/Disc';
    import BarcodeScanner from './BarcodeScanner.svelte';

    const dispatch = createEventDispatcher();

    /** @type {Disc} */
    export let disc;

    let titleTextfield;

    // reactive props used by the form, populated initially with the given disc's props
    let {id, title, ean, discNumber} = disc;

    let cancel = () => dispatch('close');

    let savingPromise = null;

    let isScanning = false;

    let onEan = ({detail}) => {
        isScanning = false;
        ean = detail;
    };

    $: canSave = !isScanning && title.trim();

    let save = () => {
        savingPromise = new Promise(async (resolve, reject) => {
	        let disc = new Disc({id, title, ean, discNumber});
	        try {
		        await saveOrUpdateDisc(disc);
		        dispatch('close');
		        resolve();
	        } catch (err) {
		        reject('Failed to save disc');

		        setTimeout(() => savingPromise = null, 1000);
	        }
        });
    };

    onMount(() => titleTextfield.focus());

</script>

<form on:submit={save}>
    <h2>
        {id ? 'Edit' : 'Add'} Disc
    </h2>

    <label for="edited-disc-title">
        Title:
        <input id="edited-disc-title" type="text" bind:value={title} bind:this={titleTextfield} />
    </label>

    <label for="edited-disc-ean">
        EAN:
        <input id="edited-disc-ean" type="text" bind:value={ean} />
    </label>

    <label for="edited-disc-discNumber">
        Disc #
        <input id="edited-disc-discNumber" type="number" min="0" bind:value={discNumber} />
    </label>

    <hr>

    {#await savingPromise}
        Saving...
    {:then discs}

	    <button type="button" on:click={() => isScanning = !isScanning} disabled={!!ean}>{isScanning ? 'Cancel Scanning' : 'Scan Barcode'}</button>

        {#if isScanning}
		    <BarcodeScanner on:ean={onEan} />
        {:else}
            <button type="button" on:click={cancel}>Cancel</button>
            <button type="submit" disabled={!canSave}>Save</button>
        {/if}

    {:catch err}
	    <p style="color:red">
            {err}
	    </p>
    {/await}

</form>
