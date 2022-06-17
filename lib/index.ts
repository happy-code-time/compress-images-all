const gulp = require("gulp");
const imagemin = require("gulp-imagemin");
const optipng = require('imagemin-optipng');
const gifsicle = require('imagemin-gifsicle');
const svg = require('gulp-svgmin');
const path = require('path');
const fs = require('fs');
const imageHash = require('node-image-hash');
const jpeg = require('imagemin-jpeg-recompress');
const webp = require('gulp-webp');
const md5 = require("md5");
const cache = require('gulp-cache');
const avif = require('gulp-avif');
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
    private directories: any[];
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
    private algorithmBits: number;
    private algorithmHash: string;
    private generateWebp: boolean;
    private generateAvif: boolean;
    private loggingCallback: any;
    private cacheAlgorithm: string;
    private webpOptions: { [key: string]: any };
    private avifOptions: { [key: string]: any };
    private clearGulpCache: boolean;

    constructor() {
        this.cacheDirectory = '';
        this.source = ''
        this.destination = ''
        this.extensions = []
        this.globalImagesCount = 0;
        this.max = 0;
        this.count = -1;
        this.root = {};
        this.directories = [];
        this.cachedHashChecksums = {};
        this.cachedHashChecksumsTemp = {};
        this.removeUnusedFiles = false;
        this.displayLogging = false;
        this.cachedFilename = 'cachedFiles';
        this.removeTargetIfExists = false;
        this.algorithmBits = 32;
        this.algorithmHash = 'hex';
        this.generateWebp = false;
        this.generateAvif = false;
        this.loggingCallback = undefined;
        this.cacheAlgorithm = 'custom';
        this.webpOptions = {

        };
        this.avifOptions = {

        };
        this.clearGulpCache = false;
    }

    setSource(source: string = ''): CompressImagesAll {
        if(typeof '' === typeof source && 0 < source.length){
            this.source = source;
        }

        return this;
    }

    getSource(): string {
        return this.source;
    }

    setDestination(destination: string = ''): CompressImagesAll {
        if(typeof '' === typeof destination && 0 < destination.length){
            this.destination = destination;
        }

        return this;
    }

    getDestination(): string {
        return this.destination;
    }

    setCachedDirectory(directory: string): CompressImagesAll {
        if(typeof '' === typeof directory && 0 < directory.length){
            this.cacheDirectory = directory;
        }

        return this;
    }

    getCachedDirectory(): string {
        return this.cacheDirectory;
    }

    setExtensions(extensions = []): CompressImagesAll {
        if(typeof [] === typeof extensions){
            this.extensions = extensions;
        }

        return this;
    }

    getExtensions() {
        return this.extensions
    }

    setRemoveUnusedFiles(removeUnusedFiles: boolean): CompressImagesAll {
        if(typeof true === typeof removeUnusedFiles){
            this.removeUnusedFiles = removeUnusedFiles;
        }

        return this;
    }

    getRemoveUnusedFiles(): boolean {
        return this.removeUnusedFiles;
    }

    setDisplayLogging(displayLogging: boolean): CompressImagesAll {
        if(typeof true === typeof displayLogging){
            this.displayLogging = displayLogging;
        }

        return this;
    }
    
    getDisplayLogging(): boolean {
        return this.displayLogging;
    }

    setCacheFilename(cachedFilename: string): CompressImagesAll {
        if(typeof '' === typeof cachedFilename && 0 < cachedFilename.length){
            this.cachedFilename = cachedFilename;
        }

        return this;
    }
    
    getCacheFilename(): string {
        return this.cachedFilename;
    }

    setRemoveTargetIfExists(removeTargetIfExists: boolean): CompressImagesAll {
        if(typeof true === typeof removeTargetIfExists){
            this.removeTargetIfExists = removeTargetIfExists;
        }

        return this;
    }
    
    getRemoveTargetIfExists(): boolean {
        return this.removeTargetIfExists;
    }

    setAlgorithmBits(algorithmBits: number): CompressImagesAll {
        if(typeof 1 === typeof algorithmBits){
            this.algorithmBits = algorithmBits;
        }

        return this;
    }

    getAlgorithmBits(): number {
        return this.algorithmBits;
    }

    setAlgorithmHash(algorithmHash: string): CompressImagesAll {
        if(typeof '' === typeof algorithmHash){
            this.algorithmHash = algorithmHash;
        }

        return this;
    }

    getAlgorithmHash(): string {
        return this.algorithmHash;
    }

    setGenerateWebp(generateWebp: boolean): CompressImagesAll {
        if(typeof true === typeof generateWebp){
            this.generateWebp = generateWebp;
        }

        return this;
    }
    
    getGenerateWebp(): boolean {
        return this.generateWebp;
    }

    setGenerateAvif(generateAvif: boolean): CompressImagesAll {
        if(typeof true === typeof generateAvif){
            this.generateAvif = generateAvif;
        }

        return this;
    }
    
    getGenerateAvif(): boolean {
        return this.generateAvif;
    }

    setLoggingCallback(loggingCallback: any): CompressImagesAll {
        if(typeof function(){} === typeof loggingCallback){
            this.loggingCallback = loggingCallback;
        }

        return this;
    }
    
    getLoggingCallback(): boolean {
        return this.loggingCallback;
    }

    setCacheAlgorithm(cacheAlgorithm: string): CompressImagesAll {
        if(typeof '' === typeof cacheAlgorithm){
            this.cacheAlgorithm = cacheAlgorithm;
        }

        return this;
    }
    
    getCacheAlgorithm(): string {
        return this.cacheAlgorithm;
    }

    setWebpOptions(webpOptions: { [key: string]: any } ): CompressImagesAll {
        if(typeof {} === typeof webpOptions){
            this.webpOptions = webpOptions;
        }

        return this;
    }
    
    getWebpOptions(): { [key: string]: any } {
        return this.webpOptions;
    }

    setAvifOptions(avifOptions: { [key: string]: any } ): CompressImagesAll {
        if(typeof {} === typeof avifOptions){
            this.avifOptions = avifOptions;
        }

        return this;
    }
    
    getAvifOptions(): { [key: string]: any } {
        return this.avifOptions;
    }

    setClearGulpCache(clearGulpCache: boolean): CompressImagesAll {
        if(typeof true === typeof clearGulpCache){
            this.clearGulpCache = clearGulpCache;
        }

        return this;
    }
    
    getClearGulpCache(): boolean {
        return this.clearGulpCache;
    }

    progressSingleDirectory(directory: string, singleSourcePath: { cachedPath: string, files: string[], count: number }) {
        const self = this;
        const { cachedPath, files, count } = singleSourcePath;

        return new Promise(async (resolve, reject) => {
            try {
                if (await self.makeDir(directory)) {
                    let i = -1;

                    if('' == this.getCachedDirectory()){
                        this.logger(`[NO CACHE] Processing directory ${directory}`);
                    } else {
                        if('custom' === this.getCacheAlgorithm()){
                            this.logger(`[CUSTOM CACHE] Processing directory ${directory}`);
                        } else {
                            this.logger(`[GULP-CACHE] Processing directory ${directory}`);
                        }
                    }

                    /**
                     * Recursive loop
                     */
                    const nextImage = async () => {
                        i += 1;

                        /**
                         * No cache directory support
                         */
                        if('' == this.getCachedDirectory()){
                            await self.processSingleImage(files[i], directory);
                        } else {
                            /**
                             * Support cache directory custom hash check
                             */
                            if('custom' === this.getCacheAlgorithm()){
                                await self.processSingleImageWithCacheDirectory(files[i], directory, cachedPath);

                                /**
                                 * Save tmp file on the last loop
                                 */
                                if(0 >= this.globalImagesCount){
                                    /**
                                     * Close nodejs process from "node-image-hash"
                                     * 
                                     * Close all underlying workers. 
                                     * If you use the asynchronous hashing algorithm, 
                                     * you need to call this at the end of your program 
                                     * to close all currently open workers. 
                                     * Otherwise, your program may keep running until 
                                     * manually interrupted.
                                     */
                                    imageHash.close();
                                    /**
                                     * Calculate diff, to delete unwanted files from the cache directory
                                     */
                                    if(this.getRemoveUnusedFiles()){
                                        const diff: string[] = [];
                                        const oldCompiledImages = Object.getOwnPropertyNames(this.cachedHashChecksums);

                                        for(let x = 0; x < oldCompiledImages.length; x++){
                                            if(undefined === this.cachedHashChecksumsTemp[oldCompiledImages[x]]){
                                                diff.push( oldCompiledImages[x] ); 
                                            }
                                        }
        
                                        for(let x = 0; x < diff.length; x++){
                                            fs.unlinkSync(diff[x]);
                                            this.logger(`Removed unused file: ${diff[x]}`)
                                        }
                                    }

                                    /**
                                     * Save file as new tmp file
                                     */
                                    await this.saveFileWithChecksums(this.cachedHashChecksumsTemp);
                                }
                            } else {
                                await self.processSingleImageWithCacheDirectoryGulpCache(files[i], directory, cachedPath);
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

    async processSingleImageWithCacheDirectory(source: string, destination: string, cachedPath: string) {
        const self = this;

        return new Promise(async (resolve, reject) => {
            try {
                this.globalImagesCount += 1;
                this.logger(`[${this.globalImagesCount}/${this.max}]`);
                /**
                 * Get filename
                 */
                let filename: string[] | string = source.split('/');
                filename = filename[filename.length - 1];
                /**
                 * File extension
                 */
                let ext: string = '';
                let extension: string[] = source.split('.');

                if (undefined !== extension[extension.length - 1]) {
                    ext = extension[extension.length-1].toLowerCase();
                }
                /**
                 * Cached file path
                 */
                const fullFilePath = `${cachedPath}/${filename}`;
                /**
                 * Calculate hash from path (file)
                 */
                let hashFromCurrentFile: string = await this.calculateHash(source);
                const hashFilename = `${md5(hashFromCurrentFile)}.txt`;
                const hashFilePath = path.join(this.getCachedDirectory(), hashFilename);
                /**
                 * Cache file exists
                 */
                if(this.fileExists(fullFilePath) && this.fileExists(hashFilePath)) {

                    const readCacheFilesContent = (name: string) => {
                        return new Promise( resolve => {
                            fs.readFile( name, 'utf8', (e: any, data: string) => {
                                if(e || 0 == data.length){
                                    console.log(e);
                                    resolve('');
                                } else {
                                    resolve(data);
                                }
                            });
                        })
                    };

                    const hashFromHashedFile = await readCacheFilesContent(hashFilePath);

                    /**
                     * Found match, so do not compile it again
                     */
                    if(hashFromHashedFile === hashFromCurrentFile){
                        this.logger(`Copy file from cache ${fullFilePath}`);

                        if(true === this.getRemoveTargetIfExists() && this.fileExists(`${destination}/${filename}`)){
                            fs.unlinkSync(`${destination}/${filename}`);
                        }

                        await self.Async(
                            gulp
                                .src(fullFilePath)
                                .pipe(gulp.dest(destination)
                            )
                        );

                        if(this.getGenerateWebp()){
                            this.logger(`Creating webp`);
        
                            await self.Async(
                                gulp
                                    .src(source)
                                    .pipe(
                                        webp(this.getWebpOptions())
                                    )
                                    .pipe(gulp.dest(destination)
                                )
                            );
                        }

                        if(this.getGenerateAvif() && ['png', 'jpg', 'jpeg'].includes(ext)){
                            this.logger(`Creating avif`);
        
                            await self.Async(
                                gulp
                                    .src(source)
                                    .pipe(
                                        avif(this.getAvifOptions())
                                    )
                                    .pipe(gulp.dest(destination)
                                )
                            );
                        }
                        
                        /**
                         * Write to an temporary new created object
                         */
                        this.cachedHashChecksumsTemp[fullFilePath] = hashFromCurrentFile;
                        return resolve(true);
                    }
                }

                /**
                 * Match not found so compile it
                 */
                this.logger(`Processing ${source}`);
                let compiled = false;
                /**
                 * Compress images
                 */
                if (['png', 'jpg', 'jpeg', 'gif'].includes(ext)) {
                    this.logger(`Cache file to ${cachedPath}`);

                    await self.Async(
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
                                        //@ts-ignore
                                        gifsicle(
                                            {
                                                interlaced: true,
                                                optimizationLevel: 3,
                                            }
                                        ),
                                    ],
                                    {
                                        verbose: false,
                                        silent: true
                                    }
                                ),
                            )
                            .pipe(gulp.dest(cachedPath)
                        )
                    );

                    compiled = true;
                }

                if ('svg' == ext) {
                    this.logger(`Cache file to ${cachedPath}`);

                    await self.Async(
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
                                            {removeViewBox: true},
                                            {cleanupIDs: false}
                                        ]
                                    }
                                ),
                            )
                            .pipe(gulp.dest(cachedPath)
                        )
                    );

                    compiled = true;
                }

                if ('ico' == ext) {
                    this.logger(`Cache file to ${cachedPath}`);

                    await self.Async(
                        gulp
                            .src(source)
                            .pipe(gulp.dest(cachedPath)
                        )
                    );

                    compiled = true;
                } 

                /**
                 * Just move current unsupported file to the 
                 * destination 
                 */
                if( (this.getExtensions().includes(ext) || this.getExtensions().includes('all')) && false === compiled){
                    this.logger(`Cache file to ${cachedPath}`);

                    await self.Async(
                        gulp
                            .src(source)
                            .pipe(gulp.dest(cachedPath)
                        )
                    );
                }
                /**
                 * If we not have a hash from cached file
                 * then generate one
                 */
                if(true == compiled){
                    /**
                     * Save generated hash of hashed file
                     * 
                     * [
                     *  "/tmp/compress-images-all/2.jpg" = "cabfdf3be79ed370ccf6b18ec332926...",
                     *  "/tmp/compress-images-all/3.jpg" = "81e80813d79b356a4169ec9dsaqdas3..."
                     * ]
                     */
                    this.cachedHashChecksumsTemp[fullFilePath] = hashFromCurrentFile;

                    /**
                     * Copy from cache to origin destination
                    */
                    this.logger(`Copy file to ${destination}`);

                    await self.Async(
                        gulp
                            .src(fullFilePath)
                            .pipe(gulp.dest(destination)
                        )
                    );

                    /**
                     * Write hash file
                     */
                    const createFile = (filename: string, fileContent: any) => {
                        return new Promise( resolve => {
                            const file = fs.createWriteStream(hashFilePath);
                            /**
                             * Handle error
                             */
                            file.on('error', function(err: any) {
                                console.error('Unable to write cache file.');
                                throw new Error(err);
                            });

                            file.write(fileContent);

                            /**
                             * End stream
                             */
                            file.end();
                            resolve(true);
                        });
                    }

                    if(this.fileExists(hashFilename)){
                        fs.unlink(path.join(this.getCachedDirectory(), hashFilename), async () => {
                            await createFile(hashFilename, hashFromCurrentFile);
                        });
                    } else {
                        await createFile(hashFilename, hashFromCurrentFile);
                    }
                }

                if(this.getGenerateWebp()){
                    this.logger(`Creating webp`);

                    await self.Async(
                        gulp
                            .src(source)
                            .pipe(
                                webp(this.getWebpOptions())
                            )
                            .pipe(gulp.dest(destination)
                        )
                    );
                }

                if(this.getGenerateAvif() && ['png', 'jpg', 'jpeg'].includes(ext)){
                    this.logger(`Creating avif`);

                    await self.Async(
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
            }
            catch (e) {
                this.logger(`[-] Error on single image: ${source} | ${e}`);
                resolve(false);
            }
        });
    };

    async processSingleImageWithCacheDirectoryGulpCache(source: string, destination: string, cachedPath: string) {
        const self = this;

        return new Promise(async (resolve, reject) => {
            try {
                this.globalImagesCount += 1;
                this.logger(`[${this.globalImagesCount}/${this.max}]`);
                /**
                 * Get filename
                 */
                let filename: string[] | string = source.split('/');
                filename = filename[filename.length - 1];
                /**
                 * File extension
                 */
                let ext: string = '';
                let extension: string[] = source.split('.');

                if (undefined !== extension[extension.length - 1]) {
                    ext = extension[extension.length-1].toLowerCase();
                }
                /**
                 * Match not found so compile it
                 */
                this.logger(`Processing ${source}`);
                
                if(this.getGenerateWebp()){
                    this.logger(`Creating webp`);

                    await self.Async(
                        gulp
                            .src(source)
                            .pipe(
                                webp(this.getWebpOptions())
                            )
                            .pipe(gulp.dest(destination)
                        )
                    );
                }

                if(this.getGenerateAvif() && ['png', 'jpg', 'jpeg'].includes(ext)){
                    this.logger(`Creating avif`);

                    await self.Async(
                        gulp
                            .src(source)
                            .pipe(
                                avif(this.getAvifOptions())
                            )
                            .pipe(gulp.dest(destination)
                        )
                    );
                }
                /**
                 * Compress images
                 */
                if (['png', 'jpg', 'jpeg', 'gif'].includes(ext)) {
                    await self.Async(
                        gulp
                            .src(source)
                            .pipe(
                                cache(
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
                                            //@ts-ignore
                                            gifsicle(
                                                {
                                                    interlaced: true,
                                                    optimizationLevel: 3,
                                                }
                                            ),
                                        ],
                                        {
                                            verbose: false,
                                            silent: true
                                        }
                                    ),
                                    {
                                        fileCache: new cache.Cache({ cacheDirName: this.getCachedDirectory() })
                                    }
                                )
                            )
                            .pipe(gulp.dest(destination)
                        )
                    );
                }

                if ('svg' == ext) {
                    await self.Async(
                        gulp
                            .src(source)
                            .pipe(
                                cache(
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
                                                {removeViewBox: true},
                                                {cleanupIDs: false}
                                            ]
                                        }
                                    ),
                                    {
                                        fileCache: new cache.Cache({ cacheDirName: this.getCachedDirectory() })
                                    }
                                )
                            )
                            .pipe(gulp.dest(destination)
                        )
                    );
                }

                if ('ico' == ext) {
                    await self.Async(
                        gulp
                            .src(source)
                            .pipe(gulp.dest(destination))
                        )
                    ;
                } 

                resolve(true);
            }
            catch (e) {
                this.logger(`[-] Error on single image: ${source} | ${e}`);
                resolve(false);
            }
        });
    };

    async processSingleImage(source: string, destination: string) {
        const self = this;

        return new Promise(async (resolve, reject) => {
            try {
                this.globalImagesCount += 1;
                this.logger(`[${this.globalImagesCount}/${this.max}]`);
                /**
                 * Get filename
                 */
                let filename: string[] | string = source.split('/');
                filename = filename[filename.length - 1];
                /**
                 * File extension
                 */
                let ext: string = '';
                let extension: string[] = source.split('.');

                if (undefined !== extension[extension.length - 1]) {
                    ext = extension[extension.length-1].toLowerCase();
                }

                this.logger(`Processing ${source}`);
                let compiled = false;

                /**
                 * Compress images
                 */
                if (['png', 'jpg', 'jpeg', 'gif'].includes(ext)) {
                    this.logger(`Move file to ${destination}`);
                    
                    await self.Async(
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

                    compiled = true;
                }

                if ('svg' == ext) {
                    this.logger(`Move file to ${destination}`);

                    await self.Async(
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
                                            {removeViewBox: true},
                                            {cleanupIDs: false}
                                        ]
                                    }
                                ),
                            )
                            .pipe(gulp.dest(destination)
                        )
                    );

                    compiled = true;
                }

                if ('ico' == ext) {
                    this.logger(`Move file to ${destination}`);

                    await self.Async(
                        gulp
                            .src(source)
                            .pipe(gulp.dest(destination)
                        )
                    );

                    compiled = true;
                }

                /**
                 * Just move some file
                 * thats currently not supported 
                 */
                if( (this.getExtensions().includes(ext) || this.getExtensions().includes('all')) && false === compiled){
                    this.logger(`Move file to ${destination}`);

                    await self.Async(
                        gulp
                            .src(source)
                            .pipe(gulp.dest(destination)
                        )
                    );
                }

                if(this.getGenerateWebp()){
                    this.logger(`Creating webp`);

                    await self.Async(
                        gulp
                            .src(source)
                            .pipe(
                                webp(this.getWebpOptions())
                            )
                            .pipe(gulp.dest(destination)
                        )
                    );
                }

                if(this.getGenerateAvif() && ['png', 'jpg', 'jpeg'].includes(ext)){
                    this.logger(`Creating avif`);

                    await self.Async(
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
            }
            catch (e) {
                this.logger(`[-] Error on single image: ${source} | ${e}`);
                resolve(false);
            }
        });
    };

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
        if(this.getDisplayLogging()){
            if(this.getLoggingCallback()){
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
    makeDir(destination = ''): Promise<boolean>{
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
    getFiles(dir: string, files = {}): Promise< { [direcotry: string]: [ files: string[], count: number] } > {
        const self = this;

        return new Promise(async (resolve, reject) => {
            try {
                const readSingleDirectory = async (d: string, f: { [key: string]: any }) => {
                    const destination = `${d.substring(0, d.indexOf(this.getSource()),)}${this.getDestination()}${d.substring(d.indexOf(this.getSource()) + this.getSource().length, d.length,)}`;
                    const root = await readdir(d, { withFileTypes: true });

                    if (undefined === f[destination]) {
                        f[destination] =
                        {
                            files: [],
                            count: 0,
                        }
                    }

                    for (const directory of root) {
                        const res = resolvePath(d, directory.name);

                        /**
                         * Found nested dir
                         */
                        if (directory.isDirectory()) {
                            f = await readSingleDirectory(res, f);
                        }
                        else {
                            let extension = res.split('.');
                            let ext = extension[extension.length - 1].toLowerCase();

                            /**
                             * Append file names to the object holder
                             */
                            if (2 <= res.length || (this.getExtensions().includes(ext) || this.getExtensions().includes('all'))) {
                                this.globalImagesCount += 1;
                                f[destination].files.push(res);

                                let c = destination.replace(this.getDestination(), '');
                                c = c.replace(__dirname, '');
                                c = c.replace(`${this.getSource()}`, '');

                                if('' !== this.getCachedDirectory()){
                                    f[destination].cachedPath = `${this.getCachedDirectory()}${c}`;

                                    if('custom' === this.getCacheAlgorithm()){
                                        await self.makeDir(f[destination].cachedPath);
                                    }

                                    await self.makeDir(destination);
                                } else {
                                    f[destination].cachedPath = '';
                                }
                            }
                        }

                        f[destination].count = f[destination].files.length;
                    }

                    return f
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
    getChecksums(): Promise<{[directory: string]: string}>{
        return new Promise( resolve => {
            try{
                fs.readFile( path.join(this.getCachedDirectory(), `${this.getCacheFilename()}.txt`), 'utf8', (e: any, data: string) => {
                        if(e || 0 == data.length){
                            resolve({});
                        } else {
                            try{
                                const r: {[key: string]: string} = {};
                                const lines = data.split('\n');

                                for(let x = 0; x < lines.length; x++){
                                    const l = lines[x];
                                    const pair = l.split(':::::');

                                    if(pair.length === 2 && 3 < pair[0].length && 3 < pair[1].length){
                                        r[pair[0]] = pair[1];
                                    }
                                }

                                resolve(r);
                            } catch(e){
                                resolve({});
                            }
                        }
                    }
                );
            } catch(e){
                resolve({});
            }
        });
    }

    /**
     * Create an file to save new checksums
     */
    saveFileWithChecksums(cachedHashChecksums: { [key: string]: any }): Promise<boolean>{
        return new Promise( resolve => {
            try{
                /**
                 * Open stream
                 */
                fs.unlink(path.join(this.getCachedDirectory(), `${this.getCacheFilename()}.txt`), () => {
                    const file = fs.createWriteStream(path.join(this.getCachedDirectory(), `${this.getCacheFilename()}.txt`));
                    /**
                     * Handle error
                     */
                    file.on('error', function(err: any) {
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
                     paths.map( path => {
                        const hash = cachedHashChecksums[path];
                        file.write(`${path}:::::${hash}` + '\n');
                    });
                    /**
                     * End stream
                     */
                    file.end();
    
                    resolve(true);
                });
            } catch(e){
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
            /**
             * File extension
             */
            let ext: string[] | string = filePath.split('.');

            if (undefined !== ext[ext.length - 1]) {
                ext = ext[ext.length - 1];
                ext = ext.toLowerCase();
            }

            //@ts-ignore
            if(['jpg', 'jpeg', 'png'].includes(ext)){
                try{
                    imageHash
                        .hash(filePath, this.getAlgorithmBits(), this.getAlgorithmHash())
                        .then( (hash: { hash: string, type: string } ) => {
                            resolve(hash.hash);
                        })
                        .catch( (e: any) => {
                            this.logger(e);
                            resolve(filePath);
                        })
                } catch(e){
                    resolve(filePath);
                }
            } else {
                resolve(filePath);
            }
        });
    }

    /**
     * Root node
     */
     compress() {
        const self = this;

        return new Promise(async (resolve, reject) => {
            const compress = async () => {
                self.count += 1;

                if (undefined === self.directories[self.count]) {
                    resolve(true);
                }
                else {
                    /**
                     * Recursive loop
                     */
                    if (self.root[self.directories[self.count]].files.length == 0) {
                        await self.compress();
                    }
                    else {
                        /**
                         * Process single path
                         * Single path stored in this.root as object key with settings
                         */
                        await self.progressSingleDirectory(
                            /**
                             * Source directory
                             */
                            self.directories[self.count],
                            /**
                             * Single directory 
                             */
                            self.root[self.directories[self.count]],
                        );
                    }

                    compress();
                }
            };

            compress();
        });
    }

    start() {
        return new Promise(async (resolve, reject) => {
            this.timeStart = performance.now();

            try {

                if('' !== this.getCachedDirectory() && !this.fileExists(this.getCachedDirectory())) {
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
                this.root = await this.getFiles(this.getSource());
                this.directories = Object.keys(this.root);

                if (!this.directories.length) {
                    this.logger('[+] No files to proocess');
                    return resolve(true);
                }


                this.logger(`[+] Processing directories: ${this.directories.length}`);
                this.max = this.globalImagesCount;
                this.globalImagesCount = 0;

                if('' !== this.getCachedDirectory() && 'custom' !== this.getCacheAlgorithm() && true === this.getClearGulpCache()){
                    cache.clearAll();
                }

                await this.compress();
                this.timeEnd = performance.now();
                this.logger(`\nTime:\n\tSeconds: ${(this.timeEnd - this.timeStart)/1000}\n\tMinutes: ${(this.timeEnd - this.timeStart)/1000/60}`);
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
