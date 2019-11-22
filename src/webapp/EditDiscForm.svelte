<script>
    import Disc from './model/Disc';
    import { createEventDispatcher } from 'svelte';
    import {saveOrUpdateDisc} from './stores'

    const dispatch = createEventDispatcher();

    /** @type {Disc} */
    export let disc;

    // reactive props used by the form, populated initially with the given disc's props
    let {id, title, ean, discNumber} = disc;

    let cancel = () => dispatch('close');

    let savingPromise = null;

    let save = () => {
        savingPromise = new Promise(async (resolve, reject) => {
	        let disc = new Disc({id, title, ean, discNumber});
	        try {
		        await saveOrUpdateDisc(disc);
		        dispatch('close');
		        resolve();
	        } catch (err) {
		        reject('Failed to save disc');
	        }
        });
    };
</script>

<form on:submit={save}>
    <h2>
        {id ? 'Edit' : 'Add'} Disc
    </h2>

    <label for="edited-disc-title">
        Title:
        <input id="edited-disc-title" type="text" bind:value={title} />
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
	    <button on:click={cancel}>Cancel</button>
	    <button type="submit">Save</button>

    {:catch err}
	    <p style="color:red">
            {err}
	    </p>
    {/await}

</form>
