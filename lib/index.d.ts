declare const gulp: any;
declare const imagemin: any;
declare const optipng: any;
declare const gifsicle: any;
declare const svg: any;
declare const path: any;
declare const fs: any;
declare const jpeg: any;
declare const webp: any;
declare const md5: any;
declare const avif: any;
declare const stream: any;
declare const resolvePath: any;
declare const readdir: any;
declare const performance: any;
declare class CompressImagesAll {
    private cacheDirectory;
    private source;
    private destination;
    private extensions;
    private count;
    private root;
    private directories;
    private globalImagesCount;
    private max;
    private cachedHashChecksums;
    private cachedHashChecksumsTemp;
    private removeUnusedFiles;
    private displayLogging;
    private cachedFilename;
    private timeStart;
    private timeEnd;
    private removeTargetIfExists;
    private generateWebp;
    private generateAvif;
    private loggingCallback;
    private webpOptions;
    private avifOptions;
    constructor();
    setSource(source?: string): CompressImagesAll;
    getSource(): string;
    setDestination(destination?: string): CompressImagesAll;
    getDestination(): string;
    setCachedDirectory(directory: string): CompressImagesAll;
    getCachedDirectory(): string;
    setExtensions(extensions?: never[]): CompressImagesAll;
    getExtensions(): any[];
    setRemoveUnusedFiles(removeUnusedFiles: boolean): CompressImagesAll;
    getRemoveUnusedFiles(): boolean;
    setDisplayLogging(displayLogging: boolean): CompressImagesAll;
    getDisplayLogging(): boolean;
    setCacheFilename(cachedFilename: string): CompressImagesAll;
    getCacheFilename(): string;
    setRemoveTargetIfExists(removeTargetIfExists: boolean): CompressImagesAll;
    getRemoveTargetIfExists(): boolean;
    setGenerateWebp(generateWebp: boolean): CompressImagesAll;
    getGenerateWebp(): boolean;
    setGenerateAvif(generateAvif: boolean): CompressImagesAll;
    getGenerateAvif(): boolean;
    setLoggingCallback(loggingCallback: any): CompressImagesAll;
    getLoggingCallback(): boolean;
    setWebpOptions(webpOptions: {
        [key: string]: any;
    }): CompressImagesAll;
    getWebpOptions(): {
        [key: string]: any;
    };
    setAvifOptions(avifOptions: {
        [key: string]: any;
    }): CompressImagesAll;
    getAvifOptions(): {
        [key: string]: any;
    };
    progressSingleDirectory(directory: string, singleSourcePath: {
        cachedPath: string;
        files: string[];
        count: number;
    }): Promise<unknown>;
    readCacheFilesContent(name: string, count?: number): Promise<string>;
    fromCachedBufferToFile(destination: string, filename: string, sourceCachePath: string): Promise<boolean>;
    writeCacheBuffer(hashFilePath: string, base64Source: string): Promise<boolean>;
    processWebp(source: string, destination: string, filename_webp: string, hashFilePath_webp: string): Promise<boolean>;
    processAvif(source: string, destination: string, filename_avif: string, hashFilePath_avif: string): Promise<boolean>;
    processSingleImageWithCacheDirectory(source: string, destination: string, cachedPath: string): Promise<unknown>;
    changeExt(filename: string, newExt: string): string;
    createBufferFile(filename: string, fileContent: string): Promise<boolean>;
    processSingleImage(source: string, destination: string): Promise<unknown>;
    createCachedDirectory(): void;
    logger(message: string): void;
    Async(p: any): Promise<boolean>;
    makeDir(destination?: string): Promise<boolean>;
    getFiles(dir: string, files?: {}): Promise<{
        [direcotry: string]: [files: string[], count: number];
    }>;
    getChecksums(): Promise<{
        [directory: string]: string;
    }>;
    saveFileWithChecksums(cachedHashChecksums: {
        [key: string]: any;
    }): Promise<boolean>;
    fileExists(filepath: string): boolean;
    calculateHash(filePath: string): Promise<string>;
    compress(): Promise<unknown>;
    start(): Promise<unknown>;
}
