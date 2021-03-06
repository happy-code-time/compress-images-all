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
        /**
         * Set source path.
         * 
         * Default: '' (empty string)
         */
        .setSource(path.join(__dirname, 'source'))
        /**
         * Set destination path
         * 
         * Default: '' (empty string)
         */
        .setDestination(path.join(__dirname, 'public'))
        /**
         * Set allowed files, other files will be ignored.
         * If an file extendsion added to the array, the file will be ignored.
         * 
         * Supported extensions are:
         * 
         * type: jpg
         * package: gulp-imagemin
         *  
         * type: jpeg 
         * package: gulp-imagemin
         * 
         * type: png 
         * package: imagemin-optipng
         * 
         * type: gif 
         * package: imagemin-gifsicle
         * 
         * type: ico 
         * package: none
         * 
         * type: svg
         * package: gulp-svgmin
         * 
         * Default: [] (empty array)
         */
        .setExtensions(['jpg', 'jpeg', 'png', 'gif', 'ico', 'svg'])
        /**
         * Set cache directory for more performance after the first compilation process are done.
         * 
         * If the same directory/image are compiled again, the image are readed from the cache
         * directory.
         * 
         * If an image content has been changed, but the name not, this module will detect this
         * and compile this image again and replace in cache.
         * 
         * Default: '' (empty string -> ignored)
         */
        .setCachedDirectory('/tmp/compress-images-all')
        /**
         * If using cached option then you can set custom filename for the txt file.
         * 
         * Remember, this filename are used for each process to read OLD cached files and the
         * checksums to be able to make internal checks. If The name are dynamically and chnages each compile process
         * the caching functionalitynot available.
         * 
         */
        .setCacheFilename('images_cache')
        /**
         * Enable console output.
         * 
         * Default: false
         */
        .setDisplayLogging(true)
        /**
         * If he cache enabled, then after each compress process
         * old, unused (in current process) files are removed from the
         * cache directory.
         * 
         * Default: false
         */
        .setRemoveUnusedFiles(true)
        /**
         * If the destination folder contains current image
         * you can delete it, before copy it from cache.
         * 
         * This feature only available if caching are enabled.
         * 
         * Default: false
         */
        .setRemoveTargetIfExists(true)
        /**
         * Based on the node-image-hash module.
         * The number of bits in a row. The more bits, the more unique the hash.
         * 
         * Default: 32
         */
        .setBits(24)
        /**
         * Based on the node-image-hash module.
         * 
         * Available hash types:  hex, latin1, base64, binary
         * 
         * Default: 'hex'
         */
        .setHash('hex')
        /**
         * Generate, based on the original source image an webp file
         * 
         * If you are using the cache mechanism, the image are not compiled
         * from the cache and compressed image, but from the original source
         * 
         * Default: false
         */
        .setGenerateWebp(true)
        /**
         * Custom callback function to handle messages from module
         * 
         * Only available if logging enabled
         * 
         * Default: undefined (using internal console.log)
         */
        .setLoggingCallback(loggingCallback)
        /**
         * The start function return an Promise
         */
        .start()
        /**
         * After the promise are resolved
         */
        .then(() => {
            console.log("Done");
        })
        /**
         * On promise catch
         */
        .catch((e) => {
            console.error(e);
        });
    }
)();
