import { NPMFeed, NPMPackageDist } from './npm-objects';
export declare class Utils {
    getTagVersion(feed: NPMFeed, tag: string): string;
    getVersionDistribution(feed: NPMFeed, distVersion: string): NPMPackageDist;
    getNPMFeed(npmRegistry: string, feed: string): Promise<NPMFeed>;
    downloadTarball(feed: NPMFeed, version: string): Promise<string>;
    getFileChecksum(file: string): Promise<string>;
    checksumData(data: string): string;
    readFile(file: string): Promise<string>;
    writeFile(file: string, data: string): Promise<string>;
}
