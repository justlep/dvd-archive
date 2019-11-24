<script>
    import { createEventDispatcher, onMount } from 'svelte';
    import {saveOrUpdateDisc} from './stores'
    import Disc from './model/Disc';
    import BarcodeScanner from './BarcodeScanner.svelte';

    const dispatch = createEventDispatcher();

    /** @type {Disc} */
    export let disc;

    let titleTextfield;
    let scannedImage;

    // reactive props used by the form, populated initially with the given disc's props
    let {id, title, ean, discNumber} = disc;

    let cancel = () => dispatch('close');

    let savingPromise = null;

    let isScanning = false;

    let onEan = ({detail}) => {
        isScanning = false;
        scannedImage.src = detail.imageSrc;
        ean = detail.ean;
    };

    $: canSave = !isScanning && title.trim();

    let save = () => {
        savingPromise = new Promise(async (resolve, reject) => {
	        let disc = new Disc({id, title, ean, discNumber});
	        try {
	            await saveOrUpdateDisc(disc);
		        dispatch('close');
	        } catch (err) {
		        reject('Failed to save disc');
		        setTimeout(() => savingPromise = null, 1000);
	        }
        });
    };

    let handleEscape = (e) => {
        if (e.key !== 'Escape') {
            return;
	    }
        if (isScanning) {
            isScanning = false;
        } else if (!savingPromise) {
            dispatch('close');
        }
    };

    onMount(() => titleTextfield.focus());

</script>

<svelte:window on:keydown={handleEscape}/>

<form on:submit={save}>

    <h2>
        {#if id}
            Edit &raquo;{disc.title}&laquo;
        {:else}
            Add Disc
        {/if}
    </h2>

    <label for="edited-disc-title">
        Title:
        <input id="edited-disc-title" type="text" bind:value={title} bind:this={titleTextfield} />
    </label>

    <label for="edited-disc-ean">
        EAN:
	    <div class="leftRight">
		    <input id="edited-disc-ean" type="text" bind:value={ean} />
		    <button type="button" on:click={() => isScanning = true} disabled={isScanning}>Scan Barcode</button>
        </div>
        <img class="ean-image" alt="" bind:this={scannedImage}>
    </label>

    <label for="edited-disc-discNumber">
        Disc Number in archive:
        <input id="edited-disc-discNumber" type="number" min="0" bind:value={discNumber} />
    </label>

    {#await savingPromise}
        Saving...
    {:then discs}

        {#if isScanning}
		    <BarcodeScanner on:ean={onEan} on:cancel={() => isScanning = false} />
        {:else}
            <div class="buttons">
                <button type="button" on:click={cancel}>Cancel</button>
                <button type="submit" disabled={!canSave}>Save</button>
            </div>
        {/if}

    {:catch err}
	    <p style="color:red">
            {err}
	    </p>
    {/await}

</form>

<style>

    h2 {
        text-align: center;
    }

    .leftRight {
        display: flex;
        align-items: flex-start;
    }

    form {
        text-align: left;
        width: 70vw;
        max-width: 600px;
        margin: 0 auto;
        background: #f6f6f6;
        padding: 1px 1em 1em;
    }

    .ean-image {
        max-width: 250px;
        display: block;
    }

    input[type="text"],
    input[type="number"] {
        display: block;
        width: 100%;
        margin-bottom: 1em;
    }

    button {
        white-space: nowrap;
        margin: 0;
    }
</style>