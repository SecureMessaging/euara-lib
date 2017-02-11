import { NPMFeed, NPMPackageDist } from './npm-objects';
import { Observable, Observer } from 'rxjs';
import { Manifest, ManifestSigner, ManifestSignature } from './manifest';
import * as fs from 'fs';
import * as http from 'http';
import * as checksum from 'checksum';
import * as request from 'request';
import tmp = require('tmp');
var untarToMemory = require('untar-memory')
let exec = require('child_process').exec;


export class Utils {
    public getTagVersion(feed: NPMFeed, tag: string) {
        return feed.distTags[tag] ? feed.distTags[tag] : tag;
    }

    public getVersionDistribution(feed: NPMFeed, distVersion: string): NPMPackageDist {
        let version = this.getTagVersion(feed, distVersion);
        if(feed.versions[version]) {
            return feed.versions[version].dist;
        }
    }

    public getNPMFeed(npmRegistry: string, feed: string): Promise<NPMFeed> {
        return new Observable<NPMFeed>((o: Observer<NPMFeed>) => {
            request({
                url: `${npmRegistry}${feed}/`,
                json: true
            }, function (error, response, body) {
                if (!error && response.statusCode === 200) {
                    body.distTags = body['dist-tags'];
                    o.next(body);
                }else{
                    Observable.throw(new Error(error));
                }
                o.complete();
            })
        }).toPromise();
    }

    public downloadTarball(feed: NPMFeed,  version: string): Promise<string>{
        let dist = this.getVersionDistribution(feed, version);
        let url = dist.tarball;
        return new Observable<string>((o: Observer<string>) => {
            setTimeout(() => {       
                let fileName = tmp.tmpNameSync() + '.tar';
                var file = fs.createWriteStream(fileName, { encoding: 'binary'});
                var request = http.get(url, function(response: any) {
                    response.setEncoding('binary');
                    response.pipe(file);
                });
                file.on('finish', function() {
                    file.close();
                    o.next(fileName);
                    o.complete();
                });
            }, 100);
        }).toPromise();
    }

    public getFileChecksum(file: string): Promise<string> {
        return new Observable<string>((o: Observer<string>) => {
            checksum.file(file, function (err: any, sum: any) {
                o.next(sum);
                o.complete();
            });
        }).toPromise();
    }

    public checksumData(data:string): string {
        return checksum(data);
    }

    public readFile(file: string): Promise<string> {
        return new Observable<string>((o: Observer<string>) => {
            fs.readFile(file, {encoding: 'utf-8'}, function(err: any, data: any){
                
                if (!err){
                    o.next(data);
                }else{
                    o.error(err);
                }
                o.complete();
            });
        }).toPromise();
    }

    public writeFile(file: string, data: string): Promise<string> {
        return new Observable<string>((o: Observer<string>) => {
            fs.writeFile(file, data, function(err: any) {
                if(err) {
                    o.error(err); 
                }else{
                    o.next(null);
                }
                o.complete();
            }); 
        }).toPromise();
    }

    public extractTarball(fileName: string): Promise<any> {
        return new Observable<any>((o: Observer<any>) => {
            untarToMemory(fileName)
            .then((memoryFileSystem) => {
                o.next(memoryFileSystem);
                o.complete();
            })
            .catch((err) => {
                o.error(err);
                o.complete();
            });
        }).toPromise();
    }

    public newTmpDir(cleanup: boolean = true) {
        return new Observable<string>((o: Observer<string>) => {
            tmp.dir({unsafeCleanup: cleanup}, (err, path) => {
                o.next(path);
                o.complete();
            });
        }).toPromise();
    }

    public exec(cmd: string) {
        return new Observable<string>((o: Observer<string>) => {
            exec(cmd, function(error, stdout, stderr) {
                if(error) {
                    o.error(stderr)
                    
                } else {
                    o.next(stdout);
                }
                o.complete();
            });
        }).toPromise();
    }
}
