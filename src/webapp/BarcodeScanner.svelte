<script>
	import {onMount, createEventDispatcher} from 'svelte';
	import Quagga from 'quagga';
	import Modal from './Modal.svelte';
	import {nextFreeDiscNumber} from './stores';

	let dispatch = createEventDispatcher();

	let status = '';
	let error = '';

	let devices = [];
	let selectedDevice;

	async function _populateCameraDevices() {
	    let videoDevices = await Quagga.CameraAccess.enumerateVideoDevices(),
            selectedDeviceLabel = Quagga.CameraAccess.getActiveStreamLabel();

		devices = videoDevices.map(({id, deviceId, label}) => ({
            id: id || deviceId,
            label: label || id || deviceId
        }));

		selectedDeviceLabel = devices.find(dev => dev.label === selectedDeviceLabel);
	}

	onMount(() => {
		status = 'Preparing scan...';

		Quagga.init({
			inputStream : {
				name : "Live",
				type : "LiveStream",
				target: document.querySelector('#scannerPreview'),    // Or '#yourElement' (optional)
                constraints: {
				    width: 640,
                    height: 480,
                    facingMode: 'environment'
                    //, deviceId: 'TODO' // TODO reuse previously selected device id, keep device id in store
                },
                singleChannel: false // red only should suffice for EANs
			},
			decoder : {
				readers : ["ean_reader"],
				multiple: false
			},
			numOfWorkers: 4,
            frequency: 10,
            debug: false
		}, function(err) {
			if (err) {
				console.log(err);
				error = err;
				return;
			}
			_populateCameraDevices();
			status = `Scanning for EAN... (Disc# ${$nextFreeDiscNumber})`;
			Quagga.start();
		});

		Quagga.onDetected(result => {
		    let foundEan = result.codeResult.code;
			Quagga.stop();
		    status = 'Found EAN ' + foundEan;
		    setTimeout(() => dispatch('ean', {
		        ean: foundEan,
                imageSrc: Quagga.canvas.dom.image.toDataURL()
		    }));
		});

		Quagga.onProcessed(function(result) {
			if (!result) {
				return;
			}

		    let drawingCtx = Quagga.canvas.ctx.overlay,
                drawingCanvas = Quagga.canvas.dom.overlay;

            if (result.boxes) {
                drawingCtx.clearRect(0, 0, parseInt(drawingCanvas.getAttribute("width")), parseInt(drawingCanvas.getAttribute("height")));
                result.boxes.filter(function (box) {
                    return box !== result.box;
                }).forEach(function (box) {
                    Quagga.ImageDebug.drawPath(box, {x: 0, y: 1}, drawingCtx, {color: "green", lineWidth: 2});
                });
            }

            if (result.box) {
                Quagga.ImageDebug.drawPath(result.box, {x: 0, y: 1}, drawingCtx, {color: "#00F", lineWidth: 2});
            }

            if (result.codeResult && result.codeResult.code) {
                Quagga.ImageDebug.drawPath(result.line, {x: 'x', y: 'y'}, drawingCtx, {color: 'red', lineWidth: 3});
            }
		});

		return () => {
		    Quagga.stop();
        };
	});

</script>

<Modal>

    <div class="wrap">

        <p>{ status }</p>

        <p class="error">{ error }</p>

        <p>
            {#if devices.length}
                <select class="camera" bind:value={selectedDevice}>

                    {#each devices as device}
                        <option value={device}>{ device.label }</option>
                    {/each}
                </select>
            {:else}
                Checking camera options...
            {/if}
        </p>

        <div id="scannerPreview"></div>

        <br>

        <button type="button" on:click={() => dispatch('cancel')}>Stop scanning</button>

    </div>

</Modal>

<style>
    .wrap {
        text-align: center;
    }

    .error {
        color: red;
    }

	#scannerPreview {
		position: relative;
	}

    :global(#scannerPreview > *) {
        max-width: 100% !important;
    }

    :global(#scannerPreview canvas) {
        position: absolute;
        top: 0;
        left: 0;
    }

</style>
