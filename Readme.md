## Compress images all

    This Javascript based module is a collection of different photo compression modules and has a few features. You can:
        
    1) Cachen Photos
    
    Minified images can be cached, so on the next run you can compile only the photos that are NEW and the others are simply copied from the cache to the Zile directory.
    
    2) Delete unused photos from cache
    
     You can automatically delete photos from the cache. This happens after the compile process. All images currently compiled in the source directory are compared to the cache, if there are differences, deleted the photos from the difference (cache directory) to keep the hard drive clean.

    3) Move "Other Files" only

    Unsupported formats such as:.mp4,.ts,.mov,.pdf,.odt can easily be moved or ignored. If these are to be ignored, they remain in the source directory, if they are to be copied, they are simply copied to the destination directory.

    4) WEBP

    All images (in.jpg,.jpeg,.png format) can be compiled to.webp files, this means the same image quality but a significantly smaller size (kilobytes, megabytes) of the image.

    5) AVIF

    All images (in.jpg,.jpeg,.png) format can be compiled to.avif files, this means the same image quality but a much smaller size (kilobytes, megabytes) of the image. As a rule, even smaller than.webp formats.

## Clone repository for local purposes

    git clone ssh://git@github.com/happy-code-time/compress-images-all.git compress-images-all && cd compress-images-all

## Install

    # npm
    npm i --save-dev compress-images-all

    # yarn
    yarn add --dev compress-images-all

## Development
    
    # npm
    npm install && npm run watch
    
    # yarn
    yarn install && yarn run watch

## Production

    # npm 
    npm install && npm run build
    
    # yarn
    yarn install && yarn run build

## Functions

    setSource - Set source path. Default: '' (empty string).
    
    setDestination - Set destination path. Default: '' (empty string).
    
    setExtensions - Set allowed files, other files will be ignored. If an file extension added to the array, the file will be ignored. Default: [] (empty array).

        Supported extensions are: 
            
            - jpg and jpeg hanled by package: gulp-imagemin
            - png hanled by package: imagemin-optipng
            - gif hanled by package: imagemin-gifsicle
            - ico hanled by package: none
            - svg hanled by package: gulp-svgmin

    setCachedDirectory - Set cache directory for more performance after the first compilation process are done. If the same directory/image are compiled again, the image are readed from the cache directory. If an image content has been changed, but the name not, this module will detect this and compile this image again and replace in cache. Default: '' (empty string -> ignored).

    setCacheFilename - If using cached option then you can set custom filename for the txt file. Remember, this filename are used for each process to read OLD cached files and the checksums to be able to make internal checks. If The name are dynamically and chnages each compile process the caching functionalitynot available.

    setDisplayLogging - Enable console output. Default: false.

    setRemoveUnusedFiles - If he cache enabled, then after each compress process old, unused (in current process) files are removed from the cache directory. Default: false.

    setRemoveTargetIfExists - If the destination folder contains current image you can delete it, before copy it from cache. This feature only available if caching are enabled. This feature only available if the caching algorithm are set to 'custom' (default). Default: false.

    setGenerateWebp - Generate, based on the original source image an webp file. If you are using the cache mechanism, the image are not compiled from the cache and compressed image, but from the original source. Default: false.

    setWebpOptions - If setGenerateWebp are true then you can pass custom options based on the module https://www.npmjs.com/package/gulp-webp. Default: {}.

    setGenerateAvif - Generate, based on the original source image an avif file. If you are using the cache mechanism, the image are not compiled from the cache and compressed image, but from the original source. Default: false.

    setAvifOptions - If setGenerateAvif are true then you can pass custom options based on the module https://www.npmjs.com/package/gulp-avif. Default: {}.

    setLoggingCallback - Custom callback function to handle messages from module. Only available if logging enabled. Default: undefined (using internal console.log).

    setCopyNotImages - If there are files other then supported (image extensions), then just copy the file froim source to destination.

## Usage with gulp

    const CompressImagesAll = require('compress-images-all');

    gulp.task('compress', async () => {
        
        const loggingCallback = (message) => {
            console.log(message);
        };

        return await new Promise(async (resolve, reject) => {
            await new CompressImagesAll()
            .setSource(path.join(__dirname, 'source'))
            .setDestination(path.join(__dirname, 'public'))
            .setExtensions(['jpg', 'jpeg', 'png', 'gif', 'ico', 'svg'])
            .setCachedDirectory('/tmp/compress-images-all')
            .setCacheFilename('images_cache')
            .setDisplayLogging(false)
            .setRemoveUnusedFiles(true)
            .setRemoveTargetIfExists(true)
            .setGenerateWebp(true)
            .setWebpOptions(
                {
                    quality: 50,
                    lossless: false,
                }
            )
            .setGenerateAvif(true)
            .setAvifOptions(
                {
                    quality: 50,
                    lossless: false,
                    speed: 8,
                }
            )
            .setLoggingCallback(loggingCallback)
            .start()
            .then(() => {
                console.log("Done");
            })
            .catch((e) => {
                console.error(e);
            });
        });
    });

## Usage with node.js in development mode

    # Terminal
    cd /path/to/compress-images-all 
    yarn install
    yarn run build or yarn run watch
    node node.js

# Image compression test

    - Size before each compression for 261 images was 184.5MB
    - Size after each compression for 261 images was 103.6MB

    - Time without cache: Seconds: 786.9346095170006, Minutes: 13.115576825283343
    - Time with cache: Seconds: 2.759671592000872, Minutes: 0.04599452653334787
