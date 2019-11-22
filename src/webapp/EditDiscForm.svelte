<script>
    import Disc from './model/Disc';
    import { createEventDispatcher } from 'svelte';

    const dispatch = createEventDispatcher();

    /** @type {Disc} */
    export let disc;

    // reactive props used by the form, populated initially with the given disc's props
    let {id, title, ean, discNumber} = disc;

    let cancel = () => dispatch('close');

    let save = () => {
        alert('save');
        dispatch('close');
    };
</script>


<form>
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

    <button on:click={cancel}>Cancel</button>
    <button on:click={save}>Save</button>
</form>
