<script>
    import api from './util/api';
    import Spinner from './Spinner.svelte';
    import {lastChangeByCoverId} from './stores';

    /** @type {Disc} */
    export let disc;

    let coverOpts = null;

    let error = '';

    let notFound = false;

    function loadImagesForDisc() {
        error = '';
        coverOpts = [];

        api.get('/cover/' + disc.id)
                .then(result => coverOpts !== null && (coverOpts = result.coverUrls))
                .catch(err => error = err);
    }

    function saveDiscCover(coverOption) {
        error = '';
        api.post('/cover/' + disc.id, {coverUrl: coverOption.image})
                .then(() => {
                    coverOpts = null;
                    disc.markCoverChanged();
                })
                .catch(err => error = err);
    }

    let isAboutToDelete = false;

    function deleteDiscCover() {
        error = '';
        if (!isAboutToDelete) {
            isAboutToDelete = true;
            return;
        }
        api.del('/cover/' + disc.id)
                .then(() => {
                    notFound = true;
                    isAboutToDelete = false;
                    disc.markCoverChanged();
                })
                .catch(err => error = err || 'foo');
    }
</script>

<div class="wrap">
    {#if error}
        <p style="color:red">{ error }</p>
    {/if}

    {#if coverOpts}
        <p>
            Select cover...
            <small><a href="#foo" on:click|preventDefault={() => coverOpts = null}>cancel</a></small>
        </p>

        {#if !error && !coverOpts.length}

            <div style="text-align:center">
                <Spinner/>
            </div>

        {:else}
            <p class="cover-opts">
                {#each coverOpts as opt}
                    <img class="cover-preview" src={opt.thumbnail} alt="" on:click|stopPropagation={() => saveDiscCover(opt)}>
                {/each}
            </p>
        {/if}

    {:else}
        <div class="image-wrap">
            <img class="cover" src={disc.coverUrl} alt="Cover" style={notFound ? 'display:none' : ''}
                 on:click|stopPropagation={loadImagesForDisc} on:error={() => notFound = true} on:load={() => notFound = false}>
            {#if notFound}
                <a href="#foo" on:click|preventDefault={loadImagesForDisc} class="find-cover-link">Find cover...</a>
            {:else if isAboutToDelete}
                <p>
                    <a href="#foo" on:click|preventDefault={() => deleteDiscCover()}>Delete image</a>
                    |
                    <a href="#foo" on:click|preventDefault={() => isAboutToDelete = false}>Cancel</a>
                </p>
            {:else}
                <a class="x" href="#foo" on:click|preventDefault={() => isAboutToDelete = true} title="Delete cover">X</a>
            {/if}
        </div>
    {/if}
</div>


<style type="text/css">
    .wrap {
        text-align: center;
    }

    .cover-preview,
    .cover {
        max-width: 150px;
        max-height: 150px;
        cursor: pointer;
    }

    .cover {
        max-width: 100px;
        max-height: 100px;
    }

    .image-wrap {
        position: relative;
        display: inline-block;
        min-height: 50px;
    }

    .x {
        position: absolute;
        right: 5px;
        top: 5px;
        background: rgba(255,255,255,0.4);
        color: red;
        padding: 5px;
    }

    .cover-opts {
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
    }

    .cover-opts img {
        margin: 0 5px 5px;
    }

    .find-cover-link {
        display: inline-block;
        line-height: 5em;
    }
</style>
