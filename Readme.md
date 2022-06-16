## Code available at 

    https://github.com/happy-code-time/compress-images-all

## Install

    # npm
    npm i --save-dev compress-images-all

    # yarn
    yarn add --dev compress-images-all
    
## Development and production build

    ## To work on the module, run the watcher
    
    # npm
    npm run watch
    
    # yarn
    yarn run watch

    ## To build an production file, run the production command
    
    # npm 
    npm run build
    
    # yarn
    yarn run build

## Usage with gulp

    const CompressImagesAll = require('compress-images-all');

    gulp.task('compress', async () => {
        
        const loggingCallback = (message) => {
            console.log(message);
        };

        return await new Promise(async (resolve, reject) => {
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
            * If using cached option then you can set a custom cache process.
            * 
            * If using a other name as 'custom', then the gulp-cache process/module are used
            * If using the 'gulp-cache' process then the options are not longer available:
            * - setRemoveUnusedFiles
            * - setRemoveTargetIfExists
            * - setAlgorithmBits
            * - setAlgorithmHash
            * 
            * Default: 'custom'
            */
            .setCacheAlgorithm('gulp-cache')
            /**
            * Enable console output.
            * 
            * Default: false
            */
            .setDisplayLogging(false)
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
            * This feature only available if the caching algorithm are set to 'custom' (default)
            * 
            * Default: false
            */
            .setRemoveTargetIfExists(true)
            /**
             * Based on the node-image-hash module.
             * The number of bits in a row. The more bits, the more unique the hash.
             *
             * This feature only available if the caching algorithm are set to 'custom' (default)
             * 
             * Default: 32
             */
            .setAlgorithmBits(24)
            /**
             * Based on the node-image-hash module.
             * 
             * Available hash types:  hex, latin1, base64, binary
             *
             * This feature only available if the caching algorithm are set to 'custom' (default)
             * 
             * Default: 'hex'
             */
            .setAlgorithmHash('base64')
            /**
             * Generate, based on the original source image an webp file
             * 
             * If you are using the cache mechanism, the image are not compiled
             * from the cache and compressed image, but from the original source
             *
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
        });
    });

# Image compression test with different bit value and hash algorithm

    - Size before each compression for 261 images was 184.5MB
    - Size after each compression for 261 images was 103.6MB

## Algorithm: hex

    - 32 bits
        - compression time before cache:

            - Seconds: 467.6469287039996
            - Minutes: 7.794115478399993

        - compression time with cache support:
        
            - Seconds: 157.7575704399999
            - Minutes: 2.629292840666665

        - with cache support and current algorithm we are saving -66,4% time

    - 8 bits
        - compression time before cache:

            - Seconds: 599.7059878739994
            - Minutes: 9.995099797899991

        - compression time with cache support:
            
            - Seconds: 179.34185507800058
            - Minutes: 2.989030917966676

        - with cache support and current algorithm we are saving -66,4% time

## Algorithm: binary

    - 16 bits
        - compression time before cache:

            - Seconds: 771.4073649600009
            - Minutes: 12.856789416000016

        - compression time with cache support:
        
            - Seconds: 168.5473699519988
            - Minutes: 2.8091228325333133

        - with cache support and current algorithm we are saving -78,3% time

    - 8 bits
        - compression time before cache:

            - Seconds: 481.86986221899974
            - Minutes: 8.031164370316663

        - compression time with cache support:
            
            - Seconds: 169.41651245300005
            - Minutes: 2.8236085408833342

        - with cache support and current algorithm we are saving -64,8% time

## Algorithm: base64

    - 16 bits
        - compression time before cache:

            - Seconds: 553.5850434539998
            - Minutes: 9.226417390899996

        - compression time with cache support:
        
            - Seconds: 194.11663765199947
            - Minutes: 3.235277294199991

        - with cache support and current algorithm we are saving -65% time

    - 8 bits
        - compression time before cache:

            - Seconds: 595.3672284929994
            - Minutes: 9.92278714154999

        - compression time with cache support:
            
            - Seconds: 163.12936889700032
            - Minutes: 2.718822814950005

        - with cache support and current algorithm we are saving -72,7% time
