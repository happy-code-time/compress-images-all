const path = require('path');
const CompressImage = require('.');

(
    async () => {
        /**
         * New instance
         */
        const compress = new CompressImage();
        /**
         * Set source path
         */
         compress.setSource(path.join(__dirname, '../../assets/images'));
        /**
         * Set destination path
         */
         compress.setDestination(path.join(__dirname, '../../public/images'));
        /**
         * Set allowed files, other files will be ignored.
         * If an file extendsion added to the array, the file will be ignored
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
         */
        compress.setExtensions(['jpg', 'jpeg', 'png', 'gif', 'ico', 'svg']);
        /**
         * Set cache directory for more performance after the first compilation process are done
         * 
         * If the same directory/image are compiled again, the image are readed from the cache
         * directory.
         * 
         * If an image content has been changed, but the name not, this module will detect this
         * and compile this image again and replace in cache
         * 
         */
        compress.setCachedDirectory('/tmp/compress-images-all')
        /**
         * The start function return an Promise
         */
        await compress
            .start()
            .then(() => {
                console.log("Done");
            })
            .catch((e) => {
                console.error(e);
            })
        ;
    }
)();
