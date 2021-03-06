/// <reference path="./manifest.ts" />
/// <reference path="./npm-objects.ts" />
/// <reference path="./crypto.ts" />

import { NPMFeed, NPMPackageDist } from './npm-objects';
import { Observable, Observer } from 'rxjs';
import { Manifest, ManifestSigner, ManifestSignature, ManifestReleaseType, ManifestSignatureStatus, ManifestSignatureStatuses, ManifestSignerType, ManifestState, SigningRules } from './manifest';
import { Crypto } from './crypto';
import { Utils } from './utils';

export class Euara {
    private config: EuaraConfig;
    private utils: Utils;

    constructor() {
        this.config = new EuaraConfig();
        this.utils = new Utils();
    }

    async create (packageName: string, packageVersion: string): Promise<Manifest>{
        let manifest = new Manifest();
        let feed = await this.utils.getNPMFeed(this.config.npmRegistry, packageName);
        let tarballFile = await this.utils.downloadTarball(feed, packageVersion);
        manifest.checksum = await this.utils.getFileChecksum(tarballFile);
        manifest.name = packageName;
        manifest.version = this.utils.getTagVersion(feed, packageVersion);
        manifest.releaseType.release = true;
        return manifest;
    }

    async createFromManifest (manifestFile: string, packageVersion: string): Promise<Manifest>{
        let manifest = await this.read(manifestFile);
        let feed = await this.utils.getNPMFeed(this.config.npmRegistry, manifest.name);
        let tarballFile = await this.utils.downloadTarball(feed, packageVersion);
        manifest.checksum = await this.utils.getFileChecksum(tarballFile);
        manifest.version = packageVersion;
        manifest.version = this.utils.getTagVersion(feed, packageVersion);
        manifest.releaseType.release = true;
        manifest.signatures = [];
        manifest.releaseType.release = true;
        manifest.releaseType.addSigner = false;
        manifest.releaseType.removeSigner = false;
        manifest.releaseType.rollback = false;
        manifest.releaseType.updateSigningRules = false;

        return manifest;
    }


    async read(manifestFile: string): Promise<Manifest> {
        let manifestObject = await this.readManifestFile(manifestFile);
        return this.mapObjectToManifest('Manifest', manifestObject);
    }

    private mapObjectToManifest(type: string, object: Object): any {
        let instance;
        if(type == 'Manifest') {
            instance = new Manifest();
        } else if (type == 'ManifestReleaseType') {
            instance = new ManifestReleaseType();
        } else if (type == 'SigningRules') {
            instance = new SigningRules();
        } else if (type == 'ManifestSigner') {
            instance = new ManifestSigner();
        } else if (type == 'ManifestSignature') {
            instance = new ManifestSignature();
        } else {
            instance = {};
        }
        
        for(let key in object) {
            if(key == 'releaseType') {
                instance['releaseType'] = this.mapObjectToManifest('ManifestReleaseType', object[key]);
            } else if (key == 'signers') {
                object[key]
                    .forEach(x => instance['signers']
                    .push(this.mapObjectToManifest('ManifestSigner', x)));
            } else if (key == 'signingRules') {
                instance['signingRules'] = this.mapObjectToManifest('SigningRules', object[key]);
            } else if (key == 'signatures') {
                object[key]
                    .forEach(x => instance['signatures']
                    .push(this.mapObjectToManifest('ManifestSignature', x)));
            } else {
                instance[key] = object[key];
            }
        }

        return instance
    }

    async write(manifest: Manifest, manifestFile: string) {
        return this.writeManifestFile(manifestFile, manifest);
    }

    async writePrivateKey(privateKey: string, fileName: string) {
        return this.utils.writeFile(fileName, privateKey);
    }

    async sign(manifest: Manifest, signer: string, privateKeyFile: string) {
        let privateKey = await this.utils.readFile(privateKeyFile);
        return manifest.sign(signer, privateKey);
    }

    async incrementManifestVersion(manifest: Manifest): Promise<Manifest> {
        let version = manifest.manifestVersion;
        try {
            let feed = await this.utils.getNPMFeed(this.config.npmRegistry, manifest.name + '-manifest');
            version = feed.distTags['latest'];
        } catch(err) {}
        let major = version.split('.')[0];
        let minor = version.split('.')[1];
        let patch = parseInt(version.split('.')[2]) + 1;
        manifest.manifestVersion = `${major}.${minor}.${patch}`;
        return manifest;
    }

    async publishManifest(manifest: Manifest) {
        let packageJson = this.convertManifestToNpmPackageJson(manifest);
        let tmpDir = await this.utils.newTmpDir(false);
        await this.writeManifestFile(tmpDir + '/manifest.json', manifest);
        await this.utils.writeFile(tmpDir + '/package.json', packageJson);
        let result = await this.utils.exec(`npm publish ${tmpDir} --access public`);
        return true;
    }

    async downloadManifest(manifestName: string, manifestVersion:string = 'latest'): Promise<Manifest> {
        let feed = await this.utils.getNPMFeed(this.config.npmRegistry, manifestName + '-manifest');
        if(!feed) {
            throw "Manifest not found in NPM registry";
        }
        let tarballFile = await this.utils.downloadTarball(feed, manifestVersion);
        let mfs = await this.unZip(tarballFile);
        let manifestJson = mfs.readFileSync('/package/manifest.json', 'utf8');
        let manifestObj = JSON.parse(manifestJson);
        let manifest = this.mapObjectToManifest('Manifest', manifestObj);
        return ( manifest as Manifest);
    }

    public unZip(tarballFile: string): Promise<any> {
        return this.utils.extractTarball(tarballFile);
    }

    async downloadRelease(manifestName: string, manifestVersion:string = 'latest'): Promise<ReleaseDownload>{
        let manifest = await this.downloadManifest(manifestName, manifestVersion);
        let feed = await this.utils.getNPMFeed(this.config.npmRegistry, manifest.name);
        let tarballFile = await this.utils.downloadTarball(feed, manifest.version);
        let checksum = await this.utils.getFileChecksum(tarballFile);
        if(manifest.checksum != checksum) {
            throw "checksum of release tarball does not match release manifest.";
        }
        let status = manifest.validate();
        let release = new ReleaseDownload();
        release.tarball = tarballFile;
        release.validity = status;
        release.manifest = manifest;
        return release;
    }

    private async readManifestFile(manifestFile: string): Promise<Object> {
        return JSON.parse(await this.utils.readFile(manifestFile)) as Object;
    }

    private async writeManifestFile(manifestFile: string, manifest: Manifest){
        return this.utils.writeFile(manifestFile, JSON.stringify(manifest));
    }

    private getManifestChecksum(manifest: Manifest): string {
        return manifest.getChecksum();
    }

    private manifestToString(manifest: Manifest): string {
        return manifest.toString();
    }

    private convertManifestToNpmPackageJson(manifest: Manifest): string {
        return JSON.stringify({
            name : manifest.name + '-manifest',
            version: manifest.manifestVersion
        });
    }
}

export class EuaraConfig {
    npmRegistry: string = "http://localnpm:4873/"; //"https://registry.npmjs.org/";
    package: string;
    manifestFile: string;
    version: string;
}


//npm set registry https://registry.npmjs.org/^C

export class ReleaseDownload {
    tarball: string;
    validity: ManifestState;
    manifest: Manifest;
}