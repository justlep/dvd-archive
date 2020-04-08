<script>

    export let discs;

    let imageWidth = window.innerWidth < 500 ? 85 : 100;

</script>

<div class="size">
	<input type="range" min=60 max=350 step=10 bind:value={imageWidth}/>
</div>

<ul>
    {#each discs as disc}
    <li>
        <img src={disc.coverUrl} alt="" style={`width: ${imageWidth}px`}/>
        <div class="title">
            {disc.title}
	        <small class="discNo">{disc.discNumber}</small>
        </div>
    </li>
    {/each}
</ul>

<style>

    ul, li {
	    margin: 0;
	    padding: 0;
	    list-style: none;
    }

    ul {
        display: flex;
        justify-content: space-around;
        width: auto;
        flex-wrap: wrap;
        margin: 1em auto;
    }

    .title {
	    position: absolute;
	    z-index: 2;
	    bottom: 0;
        left: 0;
        width: 100%;
	    color: #fff;
	    background: #dc3939;
	    font-size: 13px;
	    font-weight: normal;
        padding: 3px;
        display: none;
    }

    li {
        margin: 0 0 15px;
        background: #f8f8f8;
        border: 1px solid #eee;
        position: relative;
        padding: 5px;
        display: flex;
        align-items: center;
    }

    img {
        width: 100px;
        height: auto;
        display: block;
    }

    li:hover {
        border-color: red;
        overflow: visible;
    }

    li:hover .title {
        display: block;
    }

    .discNo {
        font-size: 0.9em;
        opacity: 0.8;
        display: block;
        font-weight: normal;
        padding: 5px 0;
    }

    .discNo::before {
        content: '#';
    }

    .size {
	    position: fixed;
        top: 5px;
        width: 200px;
        left: calc(50% - 100px);
	    z-index: 9999;
        background: #ccc;
        border: 1px solid #aaa;
        opacity: 0.4;
        padding: 2px 5px;
        border-radius: 3px;
    }

    .size:hover {
        opacity: 1;
    }

    input[type=range] {
        margin: 0;
        width: 100%;
        cursor: pointer;
    }

</style>