export * from './euara-lib';
export * from './manifest';

//import { Euara, EuaraConfig} from './euara-lib';
//import { ManifestSigner, ManifestSignerType, ManifestSignatureStatus, ManifestState  } from './manifest';

//let cli = new Euara();

//let testFile = '/home/evan/temp/9';

//cli.read(testFile).then(x => console.log(x.validate()));
//cli.createFromManifest(testFile, '0.0.0').then(x => console.log(x.validate()));


/*let manifestFile: string = 'testm.json';

let signer = new ManifestSigner();
signer.email = 'hurdevan@hurdevan.com';
signer.name = 'Evan Hurd';
signer.publickey = "1234";
signer.type = ManifestSignerType.developer;

cli.create("apps-ssms", "0.0.0")
.then(m => {
    let privateKey = m.addSigner(signer); 
    m.sign('Evan Hurd', privateKey);
    let status = m.validate();
    console.log(
        'IS Valid', status.isValid,
        'missingSignatures', status.missingSignatures,
        'IS isNew', status.isNew,) && status.signatures.forEach( s => console.log(
            s.name,
            "isMissing:", s.isMissing,
            "isSigned:", s.isSigned,
            "isInvalid:", s.isInvalid,
            "isValid:", s.isValid
        )
    );
    console.log(m.toString());

})
.catch(e => console.log(e));*/