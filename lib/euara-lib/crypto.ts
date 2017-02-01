let NodeRSA = require('node-rsa');


export class Crypto {
    private _clib: any;
    private _keyLength: number = 2048;

    constructor () {
        this._clib = new NodeRSA();
        
    }

    public generateKey(): RSAKey {
        var key = new NodeRSA({b: this._keyLength});
        let rsaKey = new RSAKey();
        rsaKey.privateKey = key.exportKey('pkcs1-private-pem');
        rsaKey.publicKey = key.exportKey('pkcs1-public-pem');
        return rsaKey;
    }

    public sign(data:string, privateKey: string): string {
        let key = new NodeRSA({signingScheme: 'pkcs1-sha256'});
        key.importKey(privateKey, 'pkcs1-private-pem');
        return key.sign(this.b64Encode(data)).toString('base64');
    }

    public verify(data: any, signature: any, publicKey: string): boolean {
        let key = new NodeRSA({signingScheme: 'pkcs1-sha256'});
        key.importKey(publicKey, 'pkcs1-public-pem');
        try {
            return key.verify(this.b64Encode(data), signature, 'utf8', 'base64');
        } catch(e) {
            console.log(e);
            return false;
        }
        
    }

    private b64Encode(data: any) {
        return new Buffer(data).toString('base64');
    }

    private b64Decode(data: string ) {
        return new Buffer(data, 'base64').toString('binary');
    }
}


export class RSAKey {
    publicKey: string;
    privateKey: string;
}
