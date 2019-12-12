# DVD Archive

A NodeJS/Svelte-based web application for "archiving" your entire DVD collection in no time.

_Archiving_ meaning: throw away your DVDs' plastic boxes, instead sorting the bare discs into 
thin, numbered sleeves of a disc case where you'll later find them by their disc number. 

The discs' content (video data) is NOT archived! 

## Motivation

* I wanted to try out [Svelte JS](https://svelte.dev/) during a little Hackathon.
* I had too little space for too many shoes, but a shelf filled with DVDs I haven't been watching for years.
  Plus a spare disc case for 200 discs. 

## Solution

#### Features
* Barcode scanner reading the article number (EAN) via webcam
* Disc title lookup via EAN
* Easy selection of the right DVD cover images through Duckduckgo image search 
* Persistence through document-based NeDB

#### Requirements
* `NodeJS 8+`
* a webcam (I used an ancient one from Logitech, with manual zoom)

#### Workflow #1: Archiving
1. Start the webapp
   ```javascript
   npm run dev
   ```  
2. Hit **Add Disc**   
   * A scan dialog opens automatically
3. Scan the (EAN13) barcode of a DVD by holding it to your webcam 
4. Verify the barcode   
   * This is important since EAN13 barcodes have very poor error detection.  
   * Type in the correct EAN manually if scanning just won't do.
5. Hit **Lookup EAN**  
   * This will query the [Open EAN/GTIN Database](http://opengtindb.org/) for the corresponding DVD title.  
   * The number of free queries per day is limited, unfortunately, so this may not work sometimes 
   (look for `error 5` in the node console)
   * More info about the API [here](http://opengtindb.org/api.php)
6. The next free _disc number_ is pre-filled already. Change it if needed.  
    * Put the disc into the case sleeve of that number. 
    * Recycle the old plastic DVD box.
7. Hit **Save**  
   * Once the disc is saved, the Scan dialog will reopen so you can immediately continue archiving the next disc (step 3)

#### Workflow #2: Assigning Cover Images

Once all DVDs are registered, you can easily choose the right cover image for each of your movies out of some 
image search results taken from [Duckduckgo](https://duckduckgo.com/).

1. For any listed DVD, click **Find cover...**
   * You'll be presented 25 images returned from an image search query at Duckduckgo.
   * The underlying query looks like `"dvd {your movie title}"`
2. Click the best image
   * The application will try to download the image.
   * Choose a different image if the image can't be downloaded (because some servers block the request).
   * If no image fits, try adjusting the DVD title (e.g. temporarily adding an actor to it).
3. To change an existing image, just click it, and the Duckduckgo results will be loaded again.   
    

After archiving, the `data/` folder contains both the database and all cover image files.

## The Result

I managed to unbox & archive 200 DVDs in less than 3 hours.

![](https://www.justlep.net/temp/dvd-archive-1.0.0-screenshot.jpg)

The freed space got gracefully filled with shoes ;-)

![](https://www.justlep.net/temp/dvd-archive-motivation.jpg)


## License
[MIT](https://github.com/justlep/dvd-archive/blob/master/LICENSE)

## Many thanks to
* [Svelte JS](https://svelte.dev/)
* [NeDB](https://github.com/louischatriot/nedb),
* [Camo (ODM for NeDB)](https://github.com/scottwrobinson/camo)
* [KshitijMhatre](https://github.com/KshitijMhatre/duckduckgo-images-api)
* [QuaggaJS (barcode scanner)](https://github.com/serratus/quaggaJS) 
  whose `duckduckgo-images-api` I have [forked](https://github.com/justlep/duckduckgo-images-api) to have it Node8-compatible
* [Neofonie](https://www.neofonie.de/) for the Hackathon event
