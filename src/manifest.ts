import { NPMFeed, NPMPackageDist } from './npm-objects';
import { Utils } from './utils';
import { Crypto } from './crypto';

let crypto = new Crypto();
let utils = new Utils();

export class Manifest {
    manifestVersion: string = "0.0.1";
    name: string = null;
    version: string = null;
    checksum: string = null;
    releaseType: ManifestReleaseType = new ManifestReleaseType();
    signers: ManifestSigner[] = [];
    signingRules: SigningRules = new SigningRules();
    signatures: ManifestSignature[] = [];


    constructor() {}

    public validate() {
        let manifestCheck = this.getChecksum();
        console.log('\t Manifest Checksum:', manifestCheck);
        let manifestState = new ManifestState();
        manifestState.signatures = [];
        this.signers.forEach(signer => {
            let sigStatus = new ManifestSignatureStatus();
            let signature = this.signatures.find(x => x.name == signer.name);
            sigStatus.name= signer.name;
            if(!signature) {
                sigStatus.status |= ManifestSignatureStatuses.MISSING;
            }else if(crypto.verify(manifestCheck, signature.signature, signer.publickey) == false) {
                sigStatus.status |= ManifestSignatureStatuses.INVALID;
                sigStatus.status |= ManifestSignatureStatuses.SIGNED;
            } else {
                sigStatus.status |= ManifestSignatureStatuses.VALID;
                sigStatus.status |= ManifestSignatureStatuses.SIGNED;
            }
            manifestState.signatures.push(sigStatus);
        });

        return manifestState;
    }   

    public addSigner(signer: ManifestSigner) {
        let key = crypto.generateKey();
        signer.publickey = key.publicKey;
        this.signers.push(signer);
        return key.privateKey;
    }

    public removeSigner(signer: ManifestSigner) {
        let index = this.signers.findIndex(x => x == signer);
        if(index > -1) {
            this.signers.splice(index, 1);
            return true;
        }else{
            return false;
        }
    }

    public sign(signerName: string, privateKey: string) {
        let signatures = this.signatures;
        let signature = new ManifestSignature();
        signature.name = signerName;
        signatures.push(signature);
        let manifestCheck = this.getChecksum();
        signature.signature = crypto.sign(manifestCheck, privateKey);
        return this;
    }

    public getChecksum(): string {
        let manifestCopy: Manifest = JSON.parse(this.toString());
        manifestCopy.signatures = [];
        return utils.checksumData(this.toString(manifestCopy));
    }

    public toString(manifest?: Manifest): string {
        if(manifest) {
            return JSON.stringify(manifest); 
        } else {
            return JSON.stringify(this);
        }
    }

}

export class ManifestReleaseType {
    rollback: boolean = false;
    release: boolean = false;
    addSigner: boolean = false;
    removeSigner: boolean = false;
    updateSigningRules: boolean = false;  
}

export class SigningRules {
    signaturesNeededRelease: number = 1;
    signaturesNeededToRollback: number = 1;
    signaturesNeededToRemoveSigner: number = 1;
    signaturesNeededToAddSigner: number = 1;
}

export class ManifestSigner {
    name: string = null;
    email: string = null;
    publickey: string = null;
    type: ManifestSignerType = ManifestSignerType.developer;
    addedByManifest: string = null
}

export class ManifestSignature {
    name: string = null;
    signature: string = null;
}

export enum ManifestSignerType {
    developer,
    signer
}


class EuaraToolConfig {
    npmRegistry: string = "http://localhost:4873/"; //"https://registry.npmjs.org/";
    package: string;
    manifestFile: string;
    version: string;
}


export class ManifestSignatureStatus {
    name: string;
    status: ManifestSignatureStatuses;

    get isMissing(): boolean {
        return this.isStatus(ManifestSignatureStatuses.MISSING);
    }

    get isSigned(): boolean {
        return this.isStatus(ManifestSignatureStatuses.SIGNED);
    }

    get isValid(): boolean {
        return this.isStatus(ManifestSignatureStatuses.VALID);
    }

    get isInvalid(): boolean {
        return this.isStatus(ManifestSignatureStatuses.INVALID);
    }

    private isStatus(status: ManifestSignatureStatuses): boolean {
        return (this.status & status) != 0 || status == ManifestSignatureStatuses.NULL;
    }
}

export class ManifestState {
    signatures: ManifestSignatureStatus[];

    get isValid() {
        return this.signatures.filter(
            x => x.isValid == true && x.isSigned == true).length == this.signatures.length;
    }

    get isInvalid() {
        return this.signatures.filter(
            x => x.isInvalid == true && x.isSigned == true).length > 0;
    }

    get missingSignatures() {
        return this.signatures.filter(
            x => x.isMissing == true && x.isSigned == false).length > 0;
    }

    get isNew() {
        return this.signatures.filter(
            x => x.isMissing == true  && x.isSigned == false).length == this.signatures.length;
    }

}

export const enum ManifestSignatureStatuses {
    NULL = 0,
    MISSING = 1 << 0,
    SIGNED = 1 << 1,
    VALID = 1 << 2,
    INVALID = 1 << 3    
}