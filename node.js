const path = require('path');
const CompressImagesAll = require('.');
(
    async () => {

        const loggingCallback = (message) => {
            console.log(message);
        };
        
        /**
         * New instance
         */
        await new CompressImagesAll()
            .setSource(path.join(__dirname, 'source'))
            .setDestination(path.join(__dirname, 'public'))
            .setExtensions(['jpg', 'jpeg', 'png', 'gif', 'ico', 'svg'])
            .setCachedDirectory('/tmp/dsgdfhdhdfhdf')
            .setCacheFilename('images_cache')
            .setDisplayLogging(true)
            .setRemoveUnusedFiles(true)
            .setRemoveTargetIfExists(true)
            .setGenerateWebp(false)
            .setWebpOptions(
                {
                    quality: 50,
                    lossless: false,
                }
            )
            .setGenerateAvif(false)
            .setAvifOptions(
                {
                    quality: 50,
                    lossless: false,
                    speed: 8,
                }
            )
            .setLoggingCallback(loggingCallback)
            .setCopyNotImages(true)
            .start()
            .then(() => {
                console.log("Done");
            })
            .catch((e) => {
                console.error(e);
            });
    }
)();
