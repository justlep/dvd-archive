<script>

</script>

<div class="bg"></div>

<div class="content">
    <slot>default modal content</slot>
</div>


<style>

    .bg {
        z-index: 10000;
        background: rgba(0,0,0,0.4);
        position: fixed;
        width: 100%;
        height: 100%;
        left: 0;
        top: 0;
    }

    .content {
        background: #fff;
        padding: 10px;
	    width: 90vw;
	    max-width: 600px;
	    position: absolute;
	    left: 50%;
	    top: 50%;
	    transform: translate(-50%,-50%);
	    box-shadow: 10px 10px 13px -15px rgba(0,0,0,0.75);
        z-index: 10001;
        border-radius: 5px;
    }

</style>