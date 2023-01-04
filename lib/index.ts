const gulp = require("gulp");
const imagemin = require("gulp-imagemin");
const optipng = require('imagemin-optipng');
const gifsicle = require('imagemin-gifsicle');
const svg = require('gulp-svgmin');
const path = require('path');
const fs = require('fs');
const jpeg = require('imagemin-jpeg-recompress');
const webp = require('gulp-webp');
const md5 = require("md5");
const avif = require('gulp-avif');
const stream = require('stream');
const resolvePath = path.resolve;
const { readdir } = fs.promises;
//@ts-ignore
const { performance } = require('perf_hooks');

class CompressImagesAll {
    private cacheDirectory: string;
    private source: string;
    private destination: string;
    private extensions: any[];
    private count: number;
    private root: any;
    private sourceDirectoriesNames: any[];
    private globalImagesCount: number;
    private max: number;
    private cachedHashChecksums: { [key: string]: any };
    private cachedHashChecksumsTemp: { [key: string]: any };
    private removeUnusedFiles: boolean;
    private displayLogging: boolean;
    private cachedFilename: string;
    private timeStart: any;
    private timeEnd: any;
    private removeTargetIfExists: boolean;
    private generateWebp: boolean;
    private generateAvif: boolean;
    private loggingCallback: any;
    private webpOptions: { [key: string]: any };
    private avifOptions: { [key: string]: any };
    private copyNotImages: boolean;

    constructor() {
        this.cacheDirectory = '';
        this.source = ''
        this.destination = ''
        this.extensions = []
        this.globalImagesCount = 0;
        this.max = 0;
        this.count = -1;
        this.root = {};
        this.sourceDirectoriesNames = [];
        this.cachedHashChecksums = {};
        this.cachedHashChecksumsTemp = {};
        this.removeUnusedFiles = false;
        this.displayLogging = false;
        this.cachedFilename = 'cachedFiles';
        this.removeTargetIfExists = false;
        this.generateWebp = false;
        this.generateAvif = false;
        this.loggingCallback = undefined;
        this.webpOptions = {};
        this.avifOptions = {};
        this.copyNotImages = false;
    }

    /**
     * ####################################################################################################################################
     * Setter and getter
     * ####################################################################################################################################
     */

    setCopyNotImages(copyNotImages: boolean = false): CompressImagesAll {
        if (typeof true === typeof copyNotImages) {
            this.copyNotImages = copyNotImages;
        }

        return this;
    }

    getCopyNotImages(): boolean {
        return this.copyNotImages;
    }

    setSource(source: string = ''): CompressImagesAll {
        if (typeof '' === typeof source && 0 < source.length) {
            this.source = source;
        }

        return this;
    }

    getSource(): string {
        return this.source;
    }

    setDestination(destination: string = ''): CompressImagesAll {
        if (typeof '' === typeof destination && 0 < destination.length) {
            this.destination = destination;
        }

        return this;
    }

    getDestination(): string {
        return this.destination;
    }

    setCachedDirectory(directory: string): CompressImagesAll {
        if (typeof '' === typeof directory && 0 < directory.length) {
            this.cacheDirectory = directory;
        }

        return this;
    }

    getCachedDirectory(): string {
        return this.cacheDirectory;
    }

    setExtensions(extensions = []): CompressImagesAll {
        if (typeof [] === typeof extensions) {
            this.extensions = extensions;
        }

        return this;
    }

    getExtensions() {
        return this.extensions
    }

    setRemoveUnusedFiles(removeUnusedFiles: boolean): CompressImagesAll {
        if (typeof true === typeof removeUnusedFiles) {
            this.removeUnusedFiles = removeUnusedFiles;
        }

        return this;
    }

    getRemoveUnusedFiles(): boolean {
        return this.removeUnusedFiles;
    }

    setDisplayLogging(displayLogging: boolean): CompressImagesAll {
        if (typeof true === typeof displayLogging) {
            this.displayLogging = displayLogging;
        }

        return this;
    }

    getDisplayLogging(): boolean {
        return this.displayLogging;
    }

    setCacheFilename(cachedFilename: string): CompressImagesAll {
        if (typeof '' === typeof cachedFilename && 0 < cachedFilename.length) {
            this.cachedFilename = cachedFilename;
        }

        return this;
    }

    getCacheFilename(): string {
        return this.cachedFilename;
    }

    setRemoveTargetIfExists(removeTargetIfExists: boolean): CompressImagesAll {
        if (typeof true === typeof removeTargetIfExists) {
            this.removeTargetIfExists = removeTargetIfExists;
        }

        return this;
    }

    getRemoveTargetIfExists(): boolean {
        return this.removeTargetIfExists;
    }

    setGenerateWebp(generateWebp: boolean): CompressImagesAll {
        if (typeof true === typeof generateWebp) {
            this.generateWebp = generateWebp;
        }

        return this;
    }

    getGenerateWebp(): boolean {
        return this.generateWebp;
    }

    setGenerateAvif(generateAvif: boolean): CompressImagesAll {
        if (typeof true === typeof generateAvif) {
            this.generateAvif = generateAvif;
        }

        return this;
    }

    getGenerateAvif(): boolean {
        return this.generateAvif;
    }

    setLoggingCallback(loggingCallback: any): CompressImagesAll {
        if (typeof function () { } === typeof loggingCallback) {
            this.loggingCallback = loggingCallback;
        }

        return this;
    }

    getLoggingCallback(): boolean {
        return this.loggingCallback;
    }

    setWebpOptions(webpOptions: { [key: string]: any }): CompressImagesAll {
        if (typeof {} === typeof webpOptions) {
            this.webpOptions = webpOptions;
        }

        return this;
    }

    getWebpOptions(): { [key: string]: any } {
        return this.webpOptions;
    }

    setAvifOptions(avifOptions: { [key: string]: any }): CompressImagesAll {
        if (typeof {} === typeof avifOptions) {
            this.avifOptions = avifOptions;
        }

        return this;
    }

    getAvifOptions(): { [key: string]: any } {
        return this.avifOptions;
    }

    /**
     * ####################################################################################################################################
     * Main functions
     * ####################################################################################################################################
     */

    /**
     * Process single folder with data
     * 
     * @param destination 
     * @param destinationInformation 
     * @returns 
     */
    progressSingleDirectory(destination: string, destinationInformation: { cachedPath: string, files: string[], count: number }) {
        const self = this;
        const { cachedPath, files, count } = destinationInformation;

        return new Promise(async (resolve, reject) => {
            try {
                if (await self.makeDir(destination)) {
                    let i = -1;

                    if ('' == this.getCachedDirectory()) {
                        this.logger(`[NO CACHE] Processing directory ${destination}`);
                    } else {
                        this.logger(`[CACHE] Processing directory ${destination}`);
                    }

                    /**
                     * Recursive loop for each images inside the folder
                     */
                    const nextImage = async () => {
                        i += 1;

                        /**
                         * No cache directory support
                         */
                        if ('' == this.getCachedDirectory()) {
                            await self.processSingleImage(files[i], destination);
                        } else {
                            /**
                             * Support cache directory custom hash check
                             */
                            await self.processSingleImageWithCacheDirectory(files[i], destination, cachedPath);
                            /**
                             * Save tmp file on the last loop
                             */
                            if (this.max <= this.globalImagesCount) {
                                /**
                                 * Calculate diff, to delete unwanted files from the cache directory
                                 */
                                if (this.getRemoveUnusedFiles()) {
                                    const diff: { originalPath: string; image: string; webp: string; avif: string }[] = [];
                                    const oldCompiledImages = Object.getOwnPropertyNames(this.cachedHashChecksums);

                                    for (let x = 0; x < oldCompiledImages.length; x++) {
                                        const v = this.cachedHashChecksums[oldCompiledImages[x]];

                                        if (undefined === this.cachedHashChecksumsTemp[oldCompiledImages[x]]) {
                                            diff.push(
                                                {
                                                    ...JSON.parse(v),
                                                    originalPath: oldCompiledImages[x]
                                                }
                                            );
                                        }
                                    }

                                    for (let x = 0; x < diff.length; x++) {
                                        const { originalPath, image, webp, avif } = diff[x];

                                        this.logger(`Removing unused generated files based on origin source: ${originalPath}`);

                                        if (this.fileExists(image)) {
                                            fs.unlinkSync(image);
                                            this.logger(`Removed unused cached file: ${image}`);
                                        }

                                        if (this.fileExists(webp)) {
                                            fs.unlinkSync(webp);
                                            this.logger(`Removed unused cached file: ${webp}`);
                                        }

                                        if (this.fileExists(avif)) {
                                            fs.unlinkSync(avif);
                                            this.logger(`Removed unused cached file: ${avif}`);
                                        }
                                    }
                                }
                                /**
                                 * Save current hashes (image hashes) to the cache directory
                                 */
                                await this.saveFileWithChecksums(this.cachedHashChecksumsTemp);
                            }
                        }

                        if (i !== files.length - 1) {
                            nextImage();
                        }
                        else {
                            /**
                             * End of current directory, send signal to process next directory in objects tree (this.directories)
                             */
                            resolve(true);
                        }
                    };

                    nextImage();
                }
            }
            catch (e) {
                self.logger(`[-] Error processing single image: ${e}`);
                reject(false);
            }
        });
    }

    readCacheFilesContent(name: string, count: number = 0): Promise<string> {
        return new Promise(resolve => {
            if (this.fileExists(name)) {
                const data = fs.readFileSync(
                    name,
                    { encoding: 'base64', flag: 'r' }
                );

                resolve(data);
            } else {

                if (2 >= count) {
                    return resolve('');
                }

                count += 1;

                setTimeout(() => {
                    this.readCacheFilesContent(name, count);
                }, 500);
            }
        })
    };

    fromCachedBufferToFile(destination: string, filename: string, sourceCachePath: string): Promise<boolean> {
        return new Promise(async (resolve) => {
            /**
             * Remove source if exists
             */
            if (true === this.getRemoveTargetIfExists() && this.fileExists(`${destination}/${filename}`)) {
                fs.unlinkSync(`${destination}/${filename}`);
            }
            /**
             * Get files buffer from txt file (string)
             */
            const dataString = await this.readCacheFilesContent(sourceCachePath);
            /**
             * Copy buffer from txt file 
             * to a new file
             */
            const buffer = Buffer.from(dataString, 'base64');
            fs.createWriteStream(`${destination}/${filename}`).write(buffer);

            resolve(true);
        });
    }

    writeCacheBuffer(hashFilePath: string, base64Source: string): Promise<boolean> {
        return new Promise(async (resolve) => {

            if (this.fileExists(hashFilePath)) {
                fs.unlink(path.join(this.getCachedDirectory(), hashFilePath), async () => {
                    await this.createBufferFile(hashFilePath, base64Source);
                });
            } else {
                await this.createBufferFile(hashFilePath, base64Source);
            }

            resolve(true);
        });
    }

    processWebp(source: string, destination: string, filename_webp: string, hashFilePath_webp: string, ext: string): Promise<boolean> {
        return new Promise(async (resolve) => {
            /**
             * Cache file does not exists, so create an webp file
             */
            await this.createImageWebp(source, destination, ext);
            /**
             * Write buffer string to cached file
             */
            const bufferCacheFileWebp = await this.readCacheFilesContent(`${destination}/${filename_webp}`);
            await this.writeCacheBuffer(hashFilePath_webp, bufferCacheFileWebp);

            resolve(true);
        });
    }

    processAvif(source: string, destination: string, filename_avif: string, hashFilePath_avif: string, ext: string): Promise<boolean> {
        return new Promise(async (resolve) => {
            /**
             * Cache file does not exists, so create an avif file
             */
            await this.createImageAvif(source, destination, ext);
            /**
             * Write buffer string to cached file
             */
            const bufferCacheFileAvif = await this.readCacheFilesContent(`${destination}/${filename_avif}`);
            await this.writeCacheBuffer(hashFilePath_avif, bufferCacheFileAvif);

            resolve(true);
        });
    }

    async processSingleImageWithCacheDirectory(source: string, destination: string, cachedPath: string) {
        const self = this;

        return new Promise(async (resolve) => {
            try {
                this.globalImagesCount += 1;
                this.logger(`[${this.globalImagesCount}/${this.max}]`);
                /**
                 * Get filename
                 * 
                 * image.png
                 * imagex.jpg
                 */
                let filename: string[] | string = source.split('/');
                filename = filename[filename.length - 1];
                /**
                 * File extension
                 */
                let ext: string = '';
                let extension: string[] = source.split('.');

                if (undefined !== extension[extension.length - 1]) {
                    ext = extension[extension.length - 1].toLowerCase();
                }
                /**
                 * Cached file path
                 */
                const fullFilePath = `${cachedPath}/${filename}`;
                /**
                 * Calculate Buffer from path (file)
                 */
                let base64Source: string = await this.calculateHash(source);

                const hashFilename = `${md5(fullFilePath)}.image.txt`;
                const hashFilePath = path.join(this.getCachedDirectory(), hashFilename);

                const hashFilename_stored_minified = `${md5(fullFilePath)}.minified.txt`;
                const hashFilePath_stored_minified = path.join(this.getCachedDirectory(), hashFilename_stored_minified);
                /**
                 * Webp cache behavior
                 */
                const hashFilename_webp = `${md5(fullFilePath)}.webp.txt`;
                const hashFilePath_webp = path.join(this.getCachedDirectory(), hashFilename_webp);
                const filename_webp = this.changeExt(filename, 'webp');
                /**
                 * Avif cache behavior
                 */
                const hashFilename_avif = `${md5(fullFilePath)}.avif.txt`;
                const hashFilePath_avif = path.join(this.getCachedDirectory(), hashFilename_avif);
                const filename_avif = this.changeExt(filename, 'avif');
                /**
                 * ############################################
                 * Cache file exists
                 * ############################################
                 */
                if (this.fileExists(hashFilePath) && this.fileExists(hashFilePath_stored_minified)) {
                    /**
                     * Get the checksum from the original file, that was stored
                     */
                    const bufferCacheFile = await this.readCacheFilesContent(hashFilePath);
                    /**
                     * Found match, so do not compile it again
                     */
                    if (bufferCacheFile === base64Source) {
                        this.logger(`Copy file from cache ${fullFilePath}`);
                        /**
                         * Copy the original (minified) image to the destination
                         */
                        await this.fromCachedBufferToFile(destination, filename, hashFilePath_stored_minified);
                        /**
                         * Webp file
                         */
                        if (this.getGenerateWebp() && ['png', 'jpg', 'jpeg'].includes(ext)) {
                            /**
                             * Copy from buffer to file
                             */
                            if (this.fileExists(hashFilePath_webp)) {
                                await this.fromCachedBufferToFile(destination, filename_webp, hashFilePath_webp);
                            } else {
                                await this.processWebp(source, destination, filename_webp, hashFilePath_webp, ext);
                            }
                        }
                        /**
                         * AVIF
                         */
                        if (this.getGenerateAvif() && ['png', 'jpg', 'jpeg'].includes(ext)) {
                            /**
                             * Copy from buffer to file
                             */
                            if (this.fileExists(hashFilePath_avif)) {
                                await this.fromCachedBufferToFile(destination, filename_avif, hashFilePath_avif);
                            } else {
                                await this.processAvif(source, destination, filename_avif, hashFilePath_avif, ext);
                            }
                        }

                        /**
                         * Write to an temporary new created object
                         */
                        this.cachedHashChecksumsTemp[fullFilePath] = {
                            image: hashFilePath,
                            webp: hashFilePath_webp,
                            avif: hashFilePath_avif,
                        };
                        /**
                         * ############################################
                         * End of cache file exists
                         * ############################################
                         */
                        return resolve(true);
                    }
                }
                /**
                 * Match in cache not found so compile it
                 */
                this.logger(`Processing ${source}`);
                let compiled = false;
                /**
                 * Compress images
                 */
                if (['png', 'jpg', 'jpeg', 'gif'].includes(ext)) {
                    compiled = await this.compileImage(source, destination, ext);

                    if (this.getGenerateWebp() && ['png', 'jpg', 'jpeg'].includes(ext)) {
                        await this.processWebp(source, destination, filename_webp, hashFilePath_webp, ext);
                    }

                    if (this.getGenerateAvif() && ['png', 'jpg', 'jpeg'].includes(ext)) {
                        await this.processAvif(source, destination, filename_avif, hashFilePath_avif, ext);
                    }
                }

                if ('svg' == ext) {
                    compiled = await this.createImageSvg(source, destination);
                }

                if ('ico' == ext) {
                    compiled = await this.moveIco(source, destination);
                }
                /**
                 * Just move current unsupported file to the 
                 * destination folder
                 */
                if (false === compiled && true === this.getCopyNotImages()) {
                    await self.moveFile(source, destination);
                }
                /**
                 * If the image has been compiled, then save its hash
                 * We need to read it on the next compile process
                 * to avoid compiling the same image multiple time - thats tha cache support!
                 */
                if (true == compiled) {
                    /**
                     * Save generated hash of hashed file
                     * 
                     * [
                     *  "/tmp/compress-images-all/2.jpg" = "cabfdf3be79ed370ccf6b18ec332926...",
                     *  "/tmp/compress-images-all/3.jpg" = "81e80813d79b356a4169ec9dsaqdas3..."
                     * ]
                     */
                    this.cachedHashChecksumsTemp[fullFilePath] = {
                        image: hashFilePath,
                        webp: hashFilePath_webp,
                        avif: hashFilePath_avif,
                    };
                    /**
                     * DEFAULT 
                     * 
                     * Write buffer to file, to access
                     * it as cache machinsim opn the next loop
                     */
                    await this.writeCacheBuffer(hashFilePath, base64Source); // Original 3.9MB hashed file
                    /**
                     * We have to store an second version/ compiled version to the cache
                     * The reason is, that we have to check if the cache image and the original image are the same based on its checksum, we cannot
                     * just save the compiled image, becouse the checksum of the compiled image is different then the original
                     */
                    await this.writeCacheBuffer(hashFilePath_stored_minified, await this.calculateHash(`${destination}/${filename}`)); // minified hash file
                }

                resolve(true);
            }
            catch (e) {
                this.logger(`[-] Error on single image: ${source} | ${e}`);
                resolve(false);
            }
        });
    };

    changeExt(filename: string, newExt: string): string {
        const names = filename.split('.');
        names[names.length - 1] = newExt;

        return names.join('.');
    }

    createBufferFile(filename: string, fileContent: string): Promise<boolean> {
        return new Promise(resolve => {
            fs.writeFile(
                filename,
                fileContent,
                {
                    encoding: "base64",
                    flag: "w",
                },
                (error: string) => {
                    if (error) {
                        throw new Error(error);
                    }

                    resolve(true);
                }
            );
        });
    }

    async processSingleImage(source: string, destination: string) {
        const self = this;
        let compiled = false;

        return new Promise(async (resolve) => {
            try {
                this.globalImagesCount += 1;
                this.logger(`[${this.globalImagesCount}/${this.max}]`);
                this.logger(`Processing ${source}`);
                /**
                 * File extension
                 */
                const ext: string = self.getFileExtension(source);
                
                if (['png', 'jpg', 'jpeg', 'gif'].includes(ext)) {
                    compiled = await this.compileImage(source, destination, ext);

                    if (this.getGenerateWebp() && ['png', 'jpg', 'jpeg'].includes(ext)) {
                        await self.createImageWebp(source, destination, ext);
                    }

                    if (this.getGenerateAvif() && ['png', 'jpg', 'jpeg'].includes(ext)) {
                        await self.createImageAvif(source, destination, ext);
                    }
                }

                if ('svg' == ext) {
                    compiled = await self.createImageSvg(source, destination);
                }

                if ('ico' == ext) {
                    compiled = await self.moveIco(source, destination);
                }

                if (false === compiled && true === this.getCopyNotImages()) {
                    await self.moveFile(source, destination);
                }

                resolve(true);
            }
            catch (e) {
                this.logger(`[-] Error on single image: ${source} | ${e}`);
                resolve(false);
            }
        });
    };

    getFileExtension(source: string): string {
        let ext: string = '';
        let extension: string[] = source.split('.');

        if (undefined !== extension[extension.length - 1]) {
            ext = extension[extension.length - 1].toLowerCase();
        }

        return ext;
    }

    getFilename(source: string): string {
        const filename: string[] | string = source.split('/');

        return filename[filename.length - 1];
    }

    /**
     * Compress jpg, jpeg, png and gif images into destination folder
     * 
     * @param source 
     * @param destination 
     * @param ext 
     * @returns 
     */
    compileImage(source: string, destination: string, ext: string): Promise<boolean> {
        return new Promise(async (resolve) => {
            this.logger(`Compiling ${ext} to ${destination}`);

            await this.Async(
                gulp
                    .src(source)
                    .pipe(
                        imagemin(
                            [
                                jpeg(),
                                optipng(
                                    {
                                        bitDepthReduction: true,
                                        colorTypeReduction: true,
                                        optimizationLevel: 3,
                                        paletteReduction: true,
                                    }
                                ),
                            ],
                            {
                                verbose: false,
                                silent: true
                            }
                        ),
                        //@ts-ignore
                        gifsicle(
                            {
                                interlaced: true,
                                optimizationLevel: 3,
                            }
                        ),
                    )
                    .pipe(gulp.dest(destination)
                    )
            );

            resolve(true);
        });
    }

    /**
     * Compress svg image
     * 
     * @param source 
     * @param destination 
     * @returns 
     */
    createImageSvg(source: string, destination: string): Promise<boolean> {
        return new Promise(async (resolve) => {
            this.logger(`Compiling svg to ${destination}`);

            await this.Async(
                gulp
                    .src(source)
                    .pipe(
                        svg(
                            {
                                plugins: [
                                    {
                                        name: 'preset-default',
                                        params: {
                                            overrides: {
                                                cleanupIDs: false
                                            }
                                        }
                                    },
                                    { removeViewBox: true },
                                    { cleanupIDs: false }
                                ]
                            }
                        ),
                    )
                    .pipe(gulp.dest(destination)
                    )
            );

            resolve(true);
        });
    }

    /**
     * Move ico image into destination folder
     * 
     * @param source 
     * @param destination 
     * @returns 
     */
    moveIco(source: string, destination: string): Promise<boolean> {
        return new Promise(async (resolve) => {
            this.logger(`Copy ICO to ${destination}`);

            await this.Async(
                gulp
                    .src(source)
                    .pipe(gulp.dest(destination)
                    )
            );

            resolve(true);
        });
    }

    /**
     * Just move current unsupported file to the 
     * destination folder
     */
    moveFile(source: string, destination: string): Promise<boolean> {
        return new Promise(async (resolve, reject) => {
            this.logger(`Move file to ${destination}`);

            await this.Async(
                gulp
                    .src(source)
                    .pipe(gulp.dest(destination)
                    )
            );

            resolve(true);
        });
    }

    /**
     * Create webp image 
     * 
     * @param source 
     * @param destination 
     * @param ext 
     * @returns 
     */
    createImageWebp(source: string, destination: string, ext: string): Promise<boolean> {
        return new Promise(async (resolve, reject) => {
            try {
                if (this.getGenerateWebp() && ['png', 'jpg', 'jpeg'].includes(ext)) {
                    this.logger(`Creating webp`);

                    await this.Async(
                        gulp
                            .src(source)
                            .pipe(
                                webp(this.getWebpOptions())
                            )
                            .pipe(gulp.dest(destination)
                            )
                    );
                }

                resolve(true);
            } catch (e) {
                reject(false);
            }
        });
    }

    /**
     * Create AVIF image 
     * 
     * @param source 
     * @param destination 
     * @param ext 
     * @returns 
     */
    createImageAvif(source: string, destination: string, ext: string): Promise<boolean> {
        return new Promise(async (resolve, reject) => {
            try {
                if (this.getGenerateAvif() && ['png', 'jpg', 'jpeg'].includes(ext)) {
                    this.logger(`Creating avif`);

                    await this.Async(
                        gulp
                            .src(source)
                            .pipe(
                                avif(this.getAvifOptions())
                            )
                            .pipe(gulp.dest(destination)
                            )
                    );
                }

                resolve(true);
            } catch (e) {
                reject(false);
            }
        });
    }

    /**
     * Create cache directory
     */
    createCachedDirectory(): void {
        if (!fs.existsSync(this.getCachedDirectory())) {
            fs.mkdirSync(this.getCachedDirectory(), { 'recursive': true });
        }
    }
    /**
     * Log message to the stdout
     */
    logger(message: string): void {
        if (this.getDisplayLogging()) {
            if (this.getLoggingCallback()) {
                //@ts-ignore
                (this.getLoggingCallback())(message);
            } else {
                console.log('\x1b[32m', `${message}`);
            }
        }
    }

    /**
     * Each gulp process are an async process
     */
    Async(p: any): Promise<boolean> {
        return new Promise((res, rej) => p.on('error', (err: any) => rej(err)).on('end', () => res(true)));
    }

    /**
     * Create directory
     */
    makeDir(destination = ''): Promise<boolean> {
        return new Promise((resolve, reject) => {

            if (!destination) {
                return resolve(false);
            }

            try {
                if (!fs.existsSync(destination)) {
                    fs.mkdir(
                        destination,
                        {
                            recursive: true
                        },
                        (e: any) => {
                            if (e) {
                                resolve(false);
                            }
                            else {
                                resolve(true);
                            }
                        }
                    );

                    this.logger(`mkdir: ${destination}`);
                }
                else {
                    resolve(true);
                }
            }
            catch (e) {
                resolve(false);
            }
        });
    }

    /**
     * Read all files recurively from source path
     */
    getSourceFiles(dir: string, files = {}): Promise<{ [directory: string]: [files: string[], count: number] }> {
        const self = this;

        return new Promise(async (resolve, reject) => {
            try {
                const readSingleDirectory = async (directory: string, nestedDirectoriesAndFiles: { [key: string]: any }) => {
                    /**
                     * Get the last directory path element and set it of the end to the destination folder name
                     * Then the directory will be created
                     * 
                     * Example source folder: '/var/images/source'
                     * The output of this line will be: '/var/images/public'
                     */
                    const destination = `${directory.substring(0, directory.indexOf(this.getSource()),)}${this.getDestination()}${directory.substring(directory.indexOf(this.getSource()) + this.getSource().length, directory.length)}`;
                    const rootDirectories = await readdir(directory, { withFileTypes: true });
                    /**
                     * If current directory not inside root gholder, then 
                     * create key with default value
                     */
                    if (undefined === nestedDirectoriesAndFiles[destination]) {
                        nestedDirectoriesAndFiles[destination] = { files: [], count: 0 };
                    }

                    for (const childDirectories of rootDirectories) {
                        const resolvedPath = resolvePath(directory, childDirectories.name);

                        /**
                         * Found nested dir, so loop recursively
                         */
                        if (childDirectories.isDirectory()) {
                            nestedDirectoriesAndFiles = await readSingleDirectory(resolvedPath, nestedDirectoriesAndFiles);
                        } else {
                            const ext = this.getFileExtension(resolvedPath);
                            /**
                             * Append file names to the object holder
                             */
                            if (2 <= resolvedPath.length || (this.getExtensions().includes(ext) || this.getExtensions().includes('all'))) {
                                this.globalImagesCount += 1;
                                nestedDirectoriesAndFiles[destination].files.push(resolvedPath);

                                let c = destination.replace(this.getDestination(), '');
                                c = c.replace(__dirname, '');
                                c = c.replace(`${this.getSource()}`, '');

                                if ('' !== this.getCachedDirectory()) {
                                    nestedDirectoriesAndFiles[destination].cachedPath = `${this.getCachedDirectory()}${c}`;
                                    /**
                                     * Create cache directory
                                     */
                                    await self.makeDir(nestedDirectoriesAndFiles[destination].cachedPath);
                                    /**
                                     * Create destination directory
                                     */
                                    await self.makeDir(destination);

                                } else {
                                    nestedDirectoriesAndFiles[destination].cachedPath = '';
                                }
                            }
                        }

                        // nestedDirectoriesAndFiles[destination].count = nestedDirectoriesAndFiles[destination].files.length;
                    }

                    return nestedDirectoriesAndFiles;
                };

                files = await readSingleDirectory(dir, files);

                resolve(files);
            }
            catch (e) {
                self.logger(`[-] Error on getting source files: ${e}`);
                reject(e);
            }
        })
    };

    /**
     * Get content of the checksum saved file
     */
    getChecksums(): Promise<{ [directory: string]: string }> {
        return new Promise(resolve => {
            try {
                fs.readFile(path.join(this.getCachedDirectory(), `${this.getCacheFilename()}.txt`), 'utf8', (e: any, data: string) => {
                    if (e || 0 == data.length) {
                        resolve({});
                    } else {
                        try {
                            const r: { [key: string]: string } = {};
                            const lines = data.split('\n');

                            for (let x = 0; x < lines.length; x++) {
                                const l = lines[x];
                                const pair = l.split(':::::');

                                if (pair.length === 2 && 3 < pair[0].length && 3 < pair[1].length) {
                                    r[pair[0]] = pair[1];
                                }
                            }

                            resolve(r);
                        } catch (e) {
                            resolve({});
                        }
                    }
                }
                );
            } catch (e) {
                resolve({});
            }
        });
    }

    /**
     * Create an file to save new checksums
     */
    saveFileWithChecksums(cachedHashChecksums: { [key: string]: any }): Promise<boolean> {
        return new Promise(resolve => {
            try {
                /**
                 * Open stream
                 */
                fs.unlink(path.join(this.getCachedDirectory(), `${this.getCacheFilename()}.txt`), () => {
                    const file = fs.createWriteStream(path.join(this.getCachedDirectory(), `${this.getCacheFilename()}.txt`));
                    /**
                     * Handle error
                     */
                    file.on('error', function (err: any) {
                        console.error('Unable to write checksums of images to file.');
                        throw new Error(err);
                    });
                    /**
                     * Get object keys
                     */
                    const paths = Object.getOwnPropertyNames(cachedHashChecksums);
                    /**
                     * Save each result to a single line
                     */
                    paths.map(path => {
                        const hash = cachedHashChecksums[path];
                        file.write(`${path}:::::${JSON.stringify(hash)}` + '\n');
                    });
                    /**
                     * End stream
                     */
                    file.end();

                    resolve(true);
                });
            } catch (e) {
                resolve(false);
            }
        });
    }

    /**
     * Check if file exists
     */
    fileExists(filepath: string): boolean {
        let exists = true;

        try {
            fs.accessSync(filepath, fs.constants.F_OK);
        } catch (e) {
            exists = false;
        }

        return exists;
    }

    /**
     * Calculate hash from a file
     */
    calculateHash(filePath: string): Promise<string> {
        return new Promise(async (resolve) => {
            try {
                resolve(
                    fs.readFileSync(filePath, 'base64')
                );
            } catch (e) {
                console.error(e);
                resolve('');
            }
        });
    }

    /**
     * Compress each single directory in recursive loop
     */
    compress() {
        const self = this;
        
        return new Promise(async (resolve, reject) => {
            const compress = async () => {
                self.count += 1;
                
                /**
                 * If no more directory to process, then resolve
                 */
                if (undefined === self.sourceDirectoriesNames[self.count]) {
                    resolve(true);
                } else {
                    /**
                     * If directory is empty, process next item inside sourceDirectoriesNames
                     */
                    if (self.root[self.sourceDirectoriesNames[self.count]].files.length == 0) {
                        await self.compress();
                    } else {
                        /**
                         * Process single path
                         * Single path stored in this.root as object key with settings
                         */
                        const destination = self.sourceDirectoriesNames[self.count];
                        const destinationInformation = self.root[self.sourceDirectoriesNames[self.count]];

                        await self.progressSingleDirectory(destination, destinationInformation);
                    }
                    /**
                     * Recursion call until this.directory[this.count] undefined
                     */
                    compress();
                }
            };
            /**
             * Initial call the recursive function
             */
            compress();
        });
    }

    start() {
        return new Promise(async (resolve, reject) => {
            this.timeStart = performance.now();

            try {

                if ('' !== this.getCachedDirectory() && !this.fileExists(this.getCachedDirectory())) {
                    this.createCachedDirectory();
                }
                /**
                 * '/tmp/compress-images-all/1.jpg': '000003e01ff8ffff185c17ec642627f6324c13cc03e07beffcbf16f407e00660',
                 * '/tmp/compress-images-all/2.jpg': 'e620ef60d938fd800000007e67ffe1ffe37f8f81f007e003e00370037c071fff',
                 * '/tmp/compress-images-all/third/3.jpg': '7ff81c78007c01fc1ffc7ffc3e0000c0ffff09ff00e10008effce4fcc050c090'
                 */
                this.cachedHashChecksums = await this.getChecksums();
                /**
                 * Create nested object - result of reading source tree
                 * 
                 * {
                 *   '/home/x9/Desktop/compress-images-all-main/public': {
                 *       files: [
                 *       '/home/x9/Desktop/compress-images-all-main/source/1.jpg',
                 *       '/home/x9/Desktop/compress-images-all-main/source/2.jpg'
                 *       ],
                 *       count: 2,
                 *       cachedPath: '/tmp/compress-images-all'
                 *   },
                 *   '/home/x9/Desktop/compress-images-all-main/public/third': {
                 *       files: [ '/home/x9/Desktop/compress-images-all-main/source/third/3.jpg' ],
                 *       count: 1,
                 *       cachedPath: '/tmp/compress-images-all/third'
                 *   }
                 * }
                 */
                this.root = await this.getSourceFiles(this.getSource());
                this.sourceDirectoriesNames = Object.keys(this.root);

                if (!this.sourceDirectoriesNames.length) {
                    this.logger('[+] No files to proocess');
                    return resolve(true);
                }


                this.logger(`[+] Processing directories: ${this.sourceDirectoriesNames.length}`);
                this.max = this.globalImagesCount;
                this.globalImagesCount = 0;

                await this.compress();

                this.timeEnd = performance.now();
                this.logger(`\nTime:\n\tSeconds: ${(this.timeEnd - this.timeStart) / 1000}\n\tMinutes: ${(this.timeEnd - this.timeStart) / 1000 / 60}`);
                resolve(true);
            }
            catch (e) {
                this.logger(`[-] Error on process: ${e}`);
                reject(e);
            }
        });
    }
};

//Export the Method
module.exports = CompressImagesAll;
