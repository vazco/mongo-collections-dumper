import fs from 'fs';
import EJSON from 'ejson';


exports.dump = async (params, callback) => {
    let {storage, db} = params;
    let storageHandler = storageHandlers[storage];
    if (!storageHandler) {
        throw 'MongoDumper.dump: invalid storage';
    }

    let collections = await db.listCollections().toArray();

    let collectionsData = [];

    Promise.all(collections.map(({name}) => new Promise(async (ok) => {
        let collection = await db.collection(name);
        let data = await collection.find().toArray();
        collectionsData.push({name, data});
        ok();
    }))).then(() => {
        callback(null, storageHandler.dump({collectionsData, ...params}));
    });
};

exports.restore = function (params, callback) {
    let {db, storage} = params;
    let collectionsData = storageHandlers[storage].restore(params);
    if (!collectionsData) {
        callback(null, {
            restored: false
        });
        return;
    }
    Promise.all(collectionsData.map(({name, data}) => new Promise(async (ok) => {
        let collection = await db.collection(name);
        await collection.remove({});
        if (data && data.length) {
            await collection.insert(data);
        }
        ok();
    }))).then(() => callback(null, {
        restored: true
    }));
};

const storageHandlers = {
    memory: {
        dump: ({collectionsData}) => collectionsData,
        restore: ({collectionsData}) => collectionsData
    },
    file: {
        dump: ({collectionsData, file}) => {
            try {
                fs.writeFileSync(file, EJSON.stringify(collectionsData, {
                    indent: 2,
                    canonical: true
                }));
            } catch (e) {
                console.warn(`MongoDumper.dump: can't write file ${file} (${e.code})`);
                return null;
            }
            return file;
        },
        restore: ({file}) => {
            try {
                let fileData = fs.readFileSync(file, {encoding: 'utf-8'});
                let collectionsData = EJSON.parse(fileData);
                return collectionsData;
            } catch (e) {
                console.warn(`MongoDumper.restore: can't read file ${file} (${e.code})`);
                return null;
            }
        }
    }
};
