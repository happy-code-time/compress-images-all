declare const gulp: any;
declare const imagemin: any;
declare const svgmin: any;
declare const jpeg: any;
declare const optipng: any;
declare const gifsicle: any;
declare const path: any;
declare const resolvePath: any;
declare const fs: any;
declare const readFile: any;
declare const readdir: any;
declare const getPixels: any;
declare const performance: any;
declare const crypto: any;
declare class CompressImagesAll {
    private cacheDirectory;
    private source;
    private destination;
    private extensions;
    private count;
    private root;
    private directories;
    private globalImagesCount;
    private cachedHashChecksums;
    private cachedHashChecksumsTemp;
    constructor();
    setSource(source?: string): void;
    getSource(): string;
    setDestination(destination?: string): void;
    getDestination(): string;
    setCachedDirectory(directory: string): void;
    getCachedDirectory(): string;
    setExtensions(extensions?: never[]): void;
    getExtensions(): any[];
    start(): Promise<unknown>;
    compress(): Promise<unknown>;
    progressSingleDirectory(directory: string, singleSourcePath: {
        cachedPath: string;
        files: string[];
        count: number;
    }): Promise<unknown>;
    processSingleImageWithCacheDirectory(source: string, destination: string, cachedPath: string): Promise<unknown>;
    processSingleImage(source: string, destination: string): Promise<unknown>;
    createCachedDirectory(): void;
    logger(message: string): void;
    Async(p: any): Promise<unknown>;
    makeDir(destination?: string): Promise<unknown>;
    getFiles(dir: string, files?: {}): Promise<unknown>;
    getChecksums(): Promise<{
        [key: string]: any;
    }>;
    saveChecksums(cachedHashChecksums: {
        [key: string]: any;
    }): Promise<boolean>;
    fileExists(filepath: string): boolean;
    calculateHash(file: string): Promise<string>;
}
