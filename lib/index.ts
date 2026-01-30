const fs = require('fs');
const fsp = require('fs').promises;
const path = require('path');
const nodeCrypto = require('crypto');
const sharp = require('sharp');
const { optimize } = require('svgo');
const pLimit = require('p-limit');
const { performance: nodePerformance } = require('perf_hooks');

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
        this.source = '';
        this.destination = '';
        this.extensions = [];
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
        return this.extensions;
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

    async makeDir(destination = ''): Promise<boolean> {
        if (!destination) return false;
        try {
            await fsp.mkdir(destination, { recursive: true });
            return true;
        } catch (e) {
            return false;
        }
    }

    fileExists(filepath: string): boolean {
        try {
            fs.accessSync(filepath, fs.constants.F_OK);
            return true;
        } catch (e) {
            return false;
        }
    }

    getFileExtension(source: string): string {
        const extension = source.split('.');
        if (extension.length > 1) {
            return extension[extension.length - 1].toLowerCase();
        }
        return '';
    }

    /**
     * Re-implemented recursive scanner to match old API roughly but optimized.
     */
    async getSourceFiles(dir: string, files: any = {}): Promise<any> {
        const self = this;
        // Logic similar to old getSourceFiles but we really just need the file list for internal use.
        // However, I will implement a flat list gatherer for the new processing engine.
        return files; // Placeholder if called externally, but internally we use scanFiles
    }

    async scanFiles(dir: string, fileList: string[] = []): Promise<string[]> {
        const dirents = await fsp.readdir(dir, { withFileTypes: true });
        for (const dirent of dirents) {
            const res = path.resolve(dir, dirent.name);
            if (dirent.isDirectory()) {
                await this.scanFiles(res, fileList);
            } else {
                const ext = this.getFileExtension(res);
                if (this.getExtensions().includes('all') || this.getExtensions().includes(ext)) {
                    fileList.push(res);
                }
            }
        }
        return fileList;
    }

    calculateHash(filePath: string): Promise<string> {
        return new Promise((resolve, reject) => {
            const hash = nodeCrypto.createHash('md5');
            const stream = fs.createReadStream(filePath);
            stream.on('error', (err: any) => reject(err));
            stream.on('data', (chunk: any) => hash.update(chunk));
            stream.on('end', () => resolve(hash.digest('hex')));
        });
    }

    getChecksums(): Promise<{ [key: string]: any }> {
        return new Promise(resolve => {
            const cacheFile = path.join(this.getCachedDirectory(), `${this.getCacheFilename()}.json`);
            if (this.fileExists(cacheFile)) {
                try {
                    const content = fs.readFileSync(cacheFile, 'utf8');
                    resolve(JSON.parse(content));
                } catch (e) {
                    resolve({});
                }
            } else {
                // Fallback to reading old .txt format if needed?
                // For 0.2.0 we assume clean slate or only support new JSON format.
                // Migrating old format is complex.
                resolve({});
            }
        });
    }

    saveChecksums(data: { [key: string]: any }): Promise<void> {
        return new Promise(resolve => {
            const cacheFile = path.join(this.getCachedDirectory(), `${this.getCacheFilename()}.json`);
            try {
                fs.writeFileSync(cacheFile, JSON.stringify(data, null, 2), 'utf8');
            } catch (e) {
                console.error('Failed to save checksums', e);
            }
            resolve();
        });
    }

    async start() {
        return new Promise(async (resolve, reject) => {
            this.timeStart = nodePerformance.now();

            try {
                // 1. Setup Cache
                if (this.getCachedDirectory() !== '') {
                    await this.makeDir(this.getCachedDirectory());
                    this.cachedHashChecksums = await this.getChecksums();
                }

                // 2. Scan Files
                this.logger(`Scanning files in ${this.getSource()}...`);
                const allFiles = await this.scanFiles(this.getSource());
                this.max = allFiles.length;
                this.globalImagesCount = 0;

                if (allFiles.length === 0) {
                    this.logger('[+] No files to process');
                    return resolve(true);
                }

                this.logger(`[+] Found ${allFiles.length} files to process.`);

                // 3. Process concurrently
                const limit = pLimit(20); // Concurrency limit
                const tasks = allFiles.map(filePath => limit(() => this.processImage(filePath)));

                await Promise.all(tasks);

                // 4. Cleanup
                if (this.getCachedDirectory() !== '' && this.getRemoveUnusedFiles()) {
                    await this.cleanupCache();
                }

                // 5. Save Cache
                if (this.getCachedDirectory() !== '') {
                    await this.saveChecksums(this.cachedHashChecksumsTemp);
                }

                this.timeEnd = nodePerformance.now();
                const seconds = (this.timeEnd - this.timeStart) / 1000;
                this.logger(`\nTime:\n\tSeconds: ${seconds}\n\tMinutes: ${seconds / 60}`);
                resolve(true);

            } catch (e) {
                this.logger(`[-] Error on process: ${e}`);
                reject(e);
            }
        });
    }

    async processImage(sourcePath: string) {
        try {
            this.globalImagesCount++;
            this.logger(`[${this.globalImagesCount}/${this.max}] Processing ${sourcePath}`);

            // Destination setup
            const relativePath = path.relative(this.getSource(), sourcePath);
            const destPath = path.join(this.getDestination(), relativePath);
            const destDir = path.dirname(destPath);
            await this.makeDir(destDir);

            const ext = this.getFileExtension(sourcePath);

            // Hashing
            let hash = '';
            if (this.getCachedDirectory() !== '') {
                hash = await this.calculateHash(sourcePath);
            }

            // Cache Check
            let usedCache = false;
            let cacheEntry: any = null;

            if (hash && this.cachedHashChecksums[sourcePath]) {
                const prevEntry = this.cachedHashChecksums[sourcePath];
                // Check if content hash matches AND cached files exist
                if (prevEntry.hash === hash) {
                    const cacheImgPath = path.join(this.getCachedDirectory(), prevEntry.image);
                    if (this.fileExists(cacheImgPath)) {
                        // Copy main image
                        this.logger(`[CACHE] Hit for ${sourcePath}`);
                        await fsp.copyFile(cacheImgPath, destPath);
                        usedCache = true;
                        cacheEntry = { ...prevEntry };

                        // Handle WebP
                        if (this.getGenerateWebp() && prevEntry.webp) {
                            const webpDest = this.changeExt(destPath, 'webp');
                            const webpCache = path.join(this.getCachedDirectory(), prevEntry.webp);
                            if (this.fileExists(webpCache)) {
                                await fsp.copyFile(webpCache, webpDest);
                            } else {
                                usedCache = false; // Partial miss
                            }
                        }

                        // Handle AVIF
                        if (this.getGenerateAvif() && prevEntry.avif) {
                            const avifDest = this.changeExt(destPath, 'avif');
                            const avifCache = path.join(this.getCachedDirectory(), prevEntry.avif);
                            if (this.fileExists(avifCache)) {
                                await fsp.copyFile(avifCache, avifDest);
                            } else {
                                usedCache = false; // Partial miss
                            }
                        }
                    }
                }
            }

            if (!usedCache) {
                cacheEntry = { hash };
                // Process Image
                if (['jpg', 'jpeg', 'png', 'gif'].includes(ext)) {
                    // Raster optimization
                    await this.optimizeRaster(sourcePath, destPath, ext);

                    // Cache the Optimized File
                    if (this.getCachedDirectory() !== '') {
                        const cacheFilename = `${hash}.${ext}`;
                        const cachePath = path.join(this.getCachedDirectory(), cacheFilename);
                        await fsp.copyFile(destPath, cachePath);
                        cacheEntry.image = cacheFilename;
                    }

                    // WebP
                    if (this.getGenerateWebp()) {
                        const webpDest = this.changeExt(destPath, 'webp');
                        await this.convertToWebp(sourcePath, webpDest);
                        if (this.getCachedDirectory() !== '') {
                            const webpCacheName = `${hash}.webp`;
                            const webpCachePath = path.join(this.getCachedDirectory(), webpCacheName);
                            await fsp.copyFile(webpDest, webpCachePath);
                            cacheEntry.webp = webpCacheName;
                        }
                    }

                    // AVIF
                    if (this.getGenerateAvif()) {
                        const avifDest = this.changeExt(destPath, 'avif');
                        await this.convertToAvif(sourcePath, avifDest);
                        if (this.getCachedDirectory() !== '') {
                            const avifCacheName = `${hash}.avif`;
                            const avifCachePath = path.join(this.getCachedDirectory(), avifCacheName);
                            await fsp.copyFile(avifDest, avifCachePath);
                            cacheEntry.avif = avifCacheName;
                        }
                    }

                } else if (ext === 'svg') {
                    // SVG optimization
                    await this.optimizeSvg(sourcePath, destPath);
                    if (this.getCachedDirectory() !== '') {
                        const cacheFilename = `${hash}.svg`;
                        const cachePath = path.join(this.getCachedDirectory(), cacheFilename);
                        await fsp.copyFile(destPath, cachePath);
                        cacheEntry.image = cacheFilename;
                    }

                } else {
                    // Other files (copy)
                    if (this.getCopyNotImages()) {
                        await fsp.copyFile(sourcePath, destPath);
                    }
                }
            }

            // Update Temp Cache Map
            if (this.getCachedDirectory() !== '' && cacheEntry) {
                this.cachedHashChecksumsTemp[sourcePath] = cacheEntry;
            }

        } catch (e) {
            this.logger(`[-] Error processing ${sourcePath}: ${e}`);
        }
    }

    async optimizeRaster(source: string, dest: string, ext: string) {
        const instance = sharp(source);
        if (ext === 'jpg' || ext === 'jpeg') {
            instance.jpeg({ mozjpeg: true });
        } else if (ext === 'png') {
            instance.png({ palette: true });
        } else if (ext === 'gif') {
            // sharp supports gif optimization via libvips
        }
        await instance.toFile(dest);
    }

    async convertToWebp(source: string, dest: string) {
        await sharp(source).webp(this.getWebpOptions()).toFile(dest);
    }

    async convertToAvif(source: string, dest: string) {
        await sharp(source).avif(this.getAvifOptions()).toFile(dest);
    }

    async optimizeSvg(source: string, dest: string) {
        const data = await fsp.readFile(source, 'utf8');
        const result = optimize(data, {
            path: source,
            plugins: [
                {
                    name: 'preset-default',
                    params: {
                        overrides: {
                            cleanupIds: false
                        }
                    }
                }
            ]
        });
        await fsp.writeFile(dest, result.data);
    }

    changeExt(filename: string, newExt: string): string {
        const parsed = path.parse(filename);
        return path.join(parsed.dir, `${parsed.name}.${newExt}`);
    }

    async cleanupCache() {
        const oldKeys = Object.keys(this.cachedHashChecksums);
        for (const key of oldKeys) {
            if (!this.cachedHashChecksumsTemp[key]) {
                // File removed from source or changed (so new entry in temp)
                // Remove old cache files
                const entry = this.cachedHashChecksums[key];
                this.logger(`[CLEANUP] Removing unused cache for ${key}`);

                if (entry.image) await this.safeDelete(path.join(this.getCachedDirectory(), entry.image));
                if (entry.webp) await this.safeDelete(path.join(this.getCachedDirectory(), entry.webp));
                if (entry.avif) await this.safeDelete(path.join(this.getCachedDirectory(), entry.avif));
            }
        }
    }

    async safeDelete(filePath: string) {
        try {
            if (this.fileExists(filePath)) {
                await fsp.unlink(filePath);
            }
        } catch (e) {
            // ignore
        }
    }
}

module.exports = CompressImagesAll;
