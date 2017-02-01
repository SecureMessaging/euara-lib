export declare class NPMFeed {
    _id: string;
    name: string;
    distTags: NPMFeedDistTags;
    versions: NPMPackageVersions;
}
export declare class NPMPackageVersion {
    name: string;
    title: string;
    version: string;
    _id: string;
    _npmVersion: string;
    dist: NPMPackageDist;
}
export declare class NPMPackageDist {
    shasum: string;
    tarball: string;
}
export interface NPMFeedDistTags {
    [tag: string]: string;
}
export interface NPMPackageVersions {
    [version: string]: NPMPackageVersion;
}
