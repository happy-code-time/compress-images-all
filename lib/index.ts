const gulp = require("gulp");
const imagemin = require("gulp-imagemin");
const svgmin = require("gulp-svgmin");
const jpeg = require('imagemin-jpeg-recompress');
const optipng = require('imagemin-optipng');
const gifsicle = require('imagemin-gifsicle');
const path = require('path');
const resolvePath = path.resolve;
const fs = require('fs');
const { readFile } = require('fs/promises')
const { readdir } = fs.promises;
const getPixels = require("get-pixels");
//@ts-ignore
const { performance } = require('perf_hooks');
//@ts-ignore
const crypto = require("crypto");

class CompressImagesAll {
    private cacheDirectory: string;
    private source: string;
    private destination: string;
    private extensions: any[];
    private count: number;
    private root: any;
    private directories: any[];
    private globalImagesCount: number;
    private cachedHashChecksums: { [key: string]: any };
    private cachedHashChecksumsTemp: { [key: string]: any };

    constructor() {
        this.cacheDirectory = '';
        this.source = ''
        this.destination = ''
        this.extensions = []
        this.globalImagesCount = 0;
        this.count = -1;
        this.root = {};
        this.directories = [];
        this.cachedHashChecksums = {};
        this.cachedHashChecksumsTemp = {};
    }

    setSource(source: string = '') {
        this.source = source;
    }

    getSource(): string {
        return this.source;
    }

    setDestination(destination: string = '') {
        this.destination = destination;
    }

    getDestination(): string {
        return this.destination;
    }

    setCachedDirectory(directory: string) {
        this.cacheDirectory = directory;
    }

    getCachedDirectory(): string {
        return this.cacheDirectory;
    }

    setExtensions(extensions = []) {
        this.extensions = extensions
    }

    getExtensions() {
        return this.extensions
    }

    start() {
        return new Promise(async (resolve, reject) => {
            try {

                if(!this.getCachedDirectory().length) {
                    reject('Cache directory not provided');
                }
                
                this.cachedHashChecksums = await this.getChecksums();
                /**
                 * Create nested object - result of reading source tree
                 * 
                 * {
                 *  '/var/www/html/public/images/time : {
                 *      files: [
                 *          '/var/www/html/assets/images/time/natalia-ventskovskaya-xvKg3qsZBp8-unsplash.jpg',
                 *          '/var/www/html/assets/images/time/nathan-dumlao-5Hl5reICevY-unsplash.jpg',
                 *          '/var/www/html/assets/images/time/saffu-E4kKGI4oGaU-unsplash.jpg'
                 *      ],
                 *      count: 3,
                 *      cachedPath: '/tmp/compress-images-all/time'
                 *  },
                 * 
                 *  '/var/www/html/public/images/ig : {
                 *      files: [
                 *          '/var/www/html/assets/images/ig/jenny-pace-K5IUb0kBZZ8-unsplash.jpg',
                 *          '/var/www/html/assets/images/ig/markus-spiske-K-iJz15pfww-unsplash.jpg',
                 *          '/var/www/html/assets/images/ig/mgg-vitchakorn-zXNC_lBBVGE-unsplash.jpg',
                 *          '/var/www/html/assets/images/ig/monika-grabkowska-nVoDL1YDWRE-unsplash.jpg',
                 *          '/var/www/html/assets/images/ig/raspopova-marina-Kd6uDjOVwDE-unsplash.jpg'
                 *      ],
                 *      count: 5,
                 *      cachedPath: '/tmp/compress-images-all/ig'
                 *  }
                 * }
                 */
                this.root = await this.getFiles(this.getSource());
                this.directories = Object.keys(this.root);

                if (!this.directories.length) {
                    this.logger('[+] No files to proocess');
                    return resolve(true);
                }


                this.logger(`[+] Processing directories: ${this.directories.length}`);
                await this.compress();
                resolve(true);
            }
            catch (e) {
                this.logger(`[-] Error on process: ${e}`);
                reject(e);
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


    progressSingleDirectory(directory: string, singleSourcePath: { cachedPath: string, files: string[], count: number }) {
        const self = this;
        const { cachedPath, files, count } = singleSourcePath;

        return new Promise(async (resolve, reject) => {
            try {
                if (await self.makeDir(directory)) {
                    let i = -1;

                    /**
                     * Recursive loop
                     */
                    const nextImage = async () => {
                        i += 1;

                        await self.processSingleImage(files[i], directory, cachedPath);

                        if(0 >= this.globalImagesCount){
                            await this.saveChecksums(this.cachedHashChecksumsTemp);
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

    async processSingleImage(source: string, destination: string, cachedPath: string) {
        const self = this;

        return new Promise(async (resolve, reject) => {
            try {
                this.globalImagesCount -= 1;
                this.logger(`${this.globalImagesCount}`);
                /**
                 * Get filename
                 */
                let filename: string[] | string = source.split('/');
                filename = filename[filename.length - 1];
                /**
                 * File extension
                 */
                let ext: string[] | string = source.split('.');

                if (undefined !== ext[ext.length - 1]) {
                    ext = ext[ext.length - 1];
                }
                /**
                 * Cached file path
                 */
                const c = `${cachedPath}/${filename}`;
                /**
                 * Cache file exists
                 */
                let hashCachedFile: string = '';

                if(this.fileExists(c)) {
                    hashCachedFile = await this.calculateHash(c);
                    /**
                     * Hash of file exists and is the same as generate to avoid ignoring images thats content has been changed but the name not
                     */
                    const paths = Object.getOwnPropertyNames(this.cachedHashChecksums);
                    let match = '';

                    for(let x = 0; x < paths.length; x++){
                        /**
                         * 1. 
                         * Paths are equal
                         * k[x] === path
                         * 
                         * 2.
                         * Checksum of the save match are the same
                         * this.cachedHashChecksums[c] === hashCachedFile
                         */
                        if(paths[x] === c && this.cachedHashChecksums[c] === hashCachedFile){
                            match = hashCachedFile;
                        }
                    }

                    if('' !== match){
                        this.logger(`Copy file from cache: ${c}`);

                        await self.Async(
                            gulp
                                .src(c)
                                .pipe(gulp.dest(destination)
                            )
                        );

                        if(!hashCachedFile.length){
                            hashCachedFile = await this.calculateHash(c);
                        }
    
                        this.cachedHashChecksumsTemp[c] = hashCachedFile;
                        return resolve(true);
                    }
                }

                this.logger(`Compiling image: ${source}`);

                /**
                 * Compress images
                 */
                if ('svg' === ext) {
                    await self.Async(
                        gulp
                            .src(source)
                            .pipe(svgmin())
                            .pipe(gulp.dest(cachedPath)
                        )
                    );
                }

                if ('png' == ext) {
                    await self.Async(
                        gulp
                            .src(source)
                            .pipe(
                                imagemin([
                                    optipng({
                                        progressive: true,
                                    }),
                                ]),
                            )
                            .pipe(gulp.dest(cachedPath)
                        )
                    );
                }

                if ('jpg' == ext || 'jpeg' == ext) {
                    await self.Async(
                        gulp
                            .src(source)
                            .pipe(
                                imagemin([
                                    jpeg(),
                                ]),
                            )
                            .pipe(gulp.dest(cachedPath)
                        )
                    );
                }

                if ('gif' == ext) {
                    await self.Async(
                        gulp
                            .src(source)
                            .pipe(
                                imagemin([
                                    gifsicle(),
                                ]),
                            )
                            .pipe(gulp.dest(cachedPath)
                        )
                    );
                }

                if ('ico' == ext) {
                    await self.Async(
                        gulp
                            .src(source)
                            .pipe(gulp.dest(cachedPath)
                        )
                    );
                }

                if('ico' == ext || 'png' == ext || 'svg' == ext || 'jpg' == ext || 'jpeg' == ext || 'gif' == ext){
                    
                    if(!hashCachedFile.length){
                        hashCachedFile = await this.calculateHash(c);
                    }
                    
                    /**
                     * Save generated hash of hashed file
                     * 
                     * [
                     *  "/tmp/compress-images-all/2.jpg" = "cabfdf3be79ed370ccf6b18ec332926...",
                     *  "/tmp/compress-images-all/3.jpg" = "81e80813d79b356a4169ec9dsaqdas3..."
                     * ]
                     */
                    this.cachedHashChecksums[c] = hashCachedFile;
                    this.cachedHashChecksumsTemp[c] = hashCachedFile;

                    /**
                     * Copy from cache to origin destination
                     */
                    await self.Async(
                        gulp
                            .src(c)
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

    createCachedDirectory() {
        if (!fs.existsSync(this.getCachedDirectory())) {
            fs.mkdirSync(this.getCachedDirectory(), { 'recursive': true });
        }
    }

    logger(message: string): void {
        console.log('\x1b[33m', `${message}`);
    }

    /**
     * Each gulp process are an async process
     */
    Async(p: any) {
        return new Promise((res, rej) => p.on('error', (err: any) => rej(err)).on('end', () => res(true)));
    }

    makeDir(destination = '') {
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

    getFiles(dir: string, files = {}) {
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
                            extension = extension[extension.length - 1];
                            extension = extension.toLowerCase();

                            /**
                             * Append file names to the object holder
                             */
                            if (2 <= res.length && this.getExtensions().includes(extension)) {
                                this.globalImagesCount += 1;
                                f[destination].files.push(res);

                                let c = destination.replace(this.getDestination(), '');
                                c = c.replace(__dirname, '');
                                c = c.replace(`${this.getSource()}`, '');
                                f[destination].cachedPath = `${this.getCachedDirectory()}${c}`;

                                await self.makeDir(f[destination].cachedPath);
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

    getChecksums(): Promise<{[key: string]: any}>{
        return new Promise( resolve => {
            try{
                fs.readFile( path.join(this.getCachedDirectory(), 'cachedHashChecksums.txt'), 'utf8', (e: any, data: string) => {
                        if(e || 0 == data.length){
                            resolve([]);
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
                resolve([]);
            }
        });
    }

    saveChecksums(cachedHashChecksums: { [key: string]: any }): Promise<boolean>{
        return new Promise( resolve => {
            try{
                /**
                 * Open stream
                 */
                const file = fs.createWriteStream(path.join(this.getCachedDirectory(), 'cachedHashChecksums.txt'));
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
            } catch(e){
                resolve(false);
            }
        });
    }

    fileExists(filepath: string): boolean {
        let exists = true;

        try {
            fs.accessSync(filepath, fs.constants.F_OK);
        } catch (e) {
            exists = false;
        }

        return exists;
    }

    calculateHash(file: string): Promise<string> {
        return new Promise(async (resolve) => {
            const c = await readFile(file, 'utf8');
            const filename = file.split('/')[file.split('/').length-1];

            try{
                resolve(
                    //@ts-ignore
                    crypto.createHash('sha256').update(c).digest('hex') + crypto.createHash('sha256').update(filename).digest('hex')
                );
            } catch(e){
                resolve('');
            }
        });
    }
};

//Export the Method
module.exports = CompressImagesAll;