export declare class Crypto {
    private _clib;
    private _keyLength;
    constructor();
    generateKey(): RSAKey;
    sign(data: string, privateKey: string): string;
    verify(data: any, signature: any, publicKey: string): boolean;
    private b64Encode(data);
    private b64Decode(data);
}
export declare class RSAKey {
    publicKey: string;
    privateKey: string;
}
