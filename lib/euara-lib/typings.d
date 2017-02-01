export declare class EuaraTool {
    constructor();
    create (packageName: string, version: string, outputfile: string);
    addSigner(manifestFile: string, signer: ManifestSigner );
    sign(manifestFile: string, signerName: string, privateKeyFile: string);
    verify(manifestFile: string, signerName: string);
}

export declare enum ManifestSignatureStatuses {
    NULL = 0,
    MISSING = 1 << 0,
    SIGNED = 1 << 1,
    VALID = 1 << 2,
    INVALID = 1 << 3    
}

export declare class EuaraToolConfig {
    npmRegistry: string ;
    package: string;
    manifestFile: string;
    version: string;
}

export declare class ManifestSignatureStatus {
    name: string;
    status: ManifestSignatureStatuses;
    isMissing: boolean;
    isSigned: boolean;
    isValid: boolean;
    isInvalid: boolean;
}

export declare class ManifestState {
    signatures: ManifestSignatureStatus[];
    isValid: boolean;
    isInvalid: boolean;
    missingSignatures: boolean;
    isNew: boolean;
}

export declare class Manifest {
    manifestVersion: string;
    name: string;
    version: string;
    checksum: string;
    releaseType: ManifestReleaseType;
    signers: ManifestSigner[];
    signingRules: SigningRules;
    signatures: ManifestSignature[];
}

export declare class ManifestReleaseType {
    rollback: boolean;
    release: boolean;
    addSigner: boolean;
    removeSigner: boolean;
    updateSigningRules: boolean;  
}

export declare class SigningRules {
    signaturesNeededRelease: number;
    signaturesNeededToRollback: number;
    signaturesNeededToRemoveSigner: number;
    signaturesNeededToAddSigner: number;
}

export declare class ManifestSigner {
    name: string;
    email: string;
    publickey: string;
    type: ManifestSignerType;
    addedByManifest: string;
}

export declare class ManifestSignature {
    name: string;
    signature: string;
}

export declare enum ManifestSignerType {
    developer,
    signer
}