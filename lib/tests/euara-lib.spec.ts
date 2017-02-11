import { Euara, NpmUtils, Manifest, ManifestSigner, ManifestSignerType } from '../euara-lib';
import { readFile, existsSync } from 'fs';
let utils = new NpmUtils();
let cmdUsed: string = '';
function handlePromise(test: () => Promise<any>) {
    return function(done) {
      test()
      .then(() => done())
      .catch((e: Error) => { console.log(e) ;fail(e.message);})
    }
}
jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000;

describe("Euara Lib", function() {
  
  let euara: Euara;
  let dir: string;
  let manifestFile: string;
  let manifest: Manifest;
  let signer;
  let privateKey: string;
  let privateKeyFile: string;
  let createFromManifestFile: string

  /*describe("Can Read and Write", function() {
    beforeEach(handlePromise(async function() {
      euara = new Euara();
      dir = await utils.newTmpDir();
      manifestFile = dir + '/manifest.json';
      euara['utils'].getNPMFeed = new UtilsMock().getNPMFeed;
      euara['utils'].downloadTarball = new UtilsMock().downloadTarball;
      //euara['utils'].getFileChecksum = new UtilsMock().getFileChecksum;
    }));

    it("can create manifest", handlePromise(async function() {
      manifest = await euara.create("apps-ssms-test", "latest");
      expect(manifest.name).toBe("apps-ssms-test");
    }));

    it("can save manifest", handlePromise(async function() {
      manifest = await euara.create("apps-ssms-test", "latest");
      await euara.write(manifest, manifestFile);
      let contents = JSON.parse(await utils.readFile(manifestFile));
      expect(contents.name).toBe("apps-ssms-test");
    }));

    it("can save manifest", handlePromise(async function() {
      manifest = await euara.create("apps-ssms-test", "latest");
      await euara.write(manifest, manifestFile);
      let contents = JSON.parse(await utils.readFile(manifestFile));
      expect(contents.name).toBe("apps-ssms-test");
      createFromManifestFile = manifestFile;
    }));

    it("can create from manifest", handlePromise(async function() {
      manifest = await euara.create("apps-ssms-test", "latest");
      await euara.write(manifest, manifestFile);
      let contents = JSON.parse(await utils.readFile(manifestFile));
      expect(contents.name).toBe("apps-ssms-test");
      createFromManifestFile = manifestFile;
    }));
  });


  describe("Can add Signers and Sign", function() {
    beforeEach(handlePromise(async function() {
      euara = new Euara();
      dir = await utils.newTmpDir();
      manifestFile = dir + '/manifest.json';
      privateKeyFile = dir + '/key.priv';
      euara['utils'].getNPMFeed = new UtilsMock().getNPMFeed;
      euara['utils'].downloadTarball = new UtilsMock().downloadTarball;
      //euara['utils'].getFileChecksum = new UtilsMock().getFileChecksum;

      manifest = await euara.create("apps-ssms-test", "latest");
      let signer = new ManifestSigner();
      signer.email = 'hurdevan@hurdevan.com';
      signer.name = 'Evan Hurd';
      signer.publickey = "1234";
      signer.type = ManifestSignerType.developer; 
      privateKey = manifest.addSigner(signer);
      await utils.writeFile(privateKeyFile, privateKey);
    }));

    it("Can add Signer", handlePromise(async function() {
      expect(manifest.signers.length).toBe(1);
      expect(manifest.signers[0].name).toBe('Evan Hurd');
    }));

    it("Signer can Sign", handlePromise(async function() {
      await euara.sign(manifest,'Evan Hurd', privateKeyFile);
      expect(manifest.signatures.length).toBe(1);
      expect(manifest.signatures[0].name).toBe('Evan Hurd');
      expect(manifest.signatures[0].signature.length).toBeTruthy();
    }));

  });

  describe("Handles validation states", function() {
    beforeEach(handlePromise(async function() {
      euara = new Euara();
      dir = await utils.newTmpDir();
      manifestFile = dir + '/manifest.json';
      privateKeyFile = dir + '/key.priv';
      euara['utils'].getNPMFeed = new UtilsMock().getNPMFeed;
      euara['utils'].downloadTarball = new UtilsMock().downloadTarball;
      //euara['utils'].getFileChecksum = new UtilsMock().getFileChecksum;
      manifest = await euara.create("apps-ssms-test", "latest");
      let signer = new ManifestSigner();
      signer.email = 'hurdevan@hurdevan.com';
      signer.name = 'Evan Hurd';
      signer.publickey = "1234";
      signer.type = ManifestSignerType.developer; 
      privateKey = manifest.addSigner(signer);
      await utils.writeFile(privateKeyFile, privateKey);
    }));

    it("Manifest is missing signature ", handlePromise(async function() {
      let test = manifest.validate();
      expect(test.missingSignatures).toBeTruthy();
      expect(test.isNew).toBeTruthy();
      expect(test.isInvalid).toBeFalsy();
      expect(test.isValid).toBeFalsy();
    }));

    it("Manifest is signed and valid", handlePromise(async function() {
      await euara.sign(manifest,'Evan Hurd', privateKeyFile);
      let test = manifest.validate();
      expect(test.missingSignatures).toBeFalsy();
      expect(test.isNew).toBeFalsy();
      expect(test.isInvalid).toBeFalsy();
      expect(test.isValid).toBeTruthy();
    }));

    it("Manifest to be invalided by modification", handlePromise(async function() {
      await euara.sign(manifest,'Evan Hurd', privateKeyFile);
      manifest.name = "Changed";
      let test = manifest.validate();
      expect(test.missingSignatures).toBeFalsy();
      expect(test.isNew).toBeFalsy();
      expect(test.isInvalid).toBeTruthy();
      expect(test.isValid).toBeFalsy();
    }));

  });*/

  describe("Publication", function() {
    beforeEach(handlePromise(async function() {
      euara = new Euara();
      dir = await utils.newTmpDir();
      manifestFile = dir + '/manifest.json';
      privateKeyFile = dir + '/key.priv';
      manifest = await euara.create("apps-ssms-test", "latest");
      manifest = await euara.incrementManifestVersion(manifest);
      let signer = new ManifestSigner();
      signer.email = 'hurdevan@hurdevan.com';
      signer.name = 'Evan Hurd';
      signer.publickey = "1234";
      signer.type = ManifestSignerType.developer; 
      privateKey = manifest.addSigner(signer);
      await utils.writeFile(privateKeyFile, privateKey);
      await euara.sign(manifest,'Evan Hurd', privateKeyFile);
    }));

    it("Manifest can be published", handlePromise(async function() {
      await euara.publishManifest(manifest);
      expect(true).toBeTruthy(); 
    }));

  });

  describe("Download and Verify", function() {

    it("Get Release", handlePromise(async function() {
      let release = await euara.downloadRelease('apps-ssms-test', 'latest');
      console.log('Release Download ',release);
      expect(release.tarball).toBeTruthy();
      expect(release.validity.isValid).toBeTruthy();
    }));

  });

});

class UtilsMock {
  async getNPMFeed(npmRegistry: string, feed: string): Promise<any> {
    let content = await utils.readFile('./lib/tests/data/npmFeed1.json');
    let obj = JSON.parse(content);
    obj.distTags = obj['dist-tags'];
    return obj;
  }

  async downloadTarball(feed: any,  version: string): Promise<string> {
    return "./lib/tests/data/tarball.tgz";
  }

  async downloadBadTarball(feed: any,  version: string): Promise<string> {
    return "./lib/tests/data/tarball.tgz";
  }

  async getFileChecksum(file: string): Promise<any> {
    return "RandomChecksome";
  }

  async getBadFileChecksum(file: string): Promise<any> {
    return "RandomChecksome";
  }

  async exec(cmd: string): Promise<any> {
    cmdUsed = cmd;
    return true;
  }

}