<h1 align="center">
    <a href="https://github.com/vazco">vazco</a>/Mongo Collections Dumper
</h1>

&nbsp;

This is lightweight utility that allows you to easily dump and restore mongo collections. No mongodump dependency. Data can be stored in memory or on disk. Useful for fixtures reload.

# Usage
## With memory storage
```javascript
import MongoDumper from 'mongo-collections-dumper';

let db = ...; // get database handler;

runSomeFixtures(); // prepare some data to dump

// save all collections in array
let fixturesData = MongoDumper.dump({
    storage: 'memory',
    db
});


// tests are great use case for mongo dumper
describe('Users', () => {
    beforeEach(function () {
        // rollback database to starting point before each test
        MongoDumper.restore({
            storage: 'memory',
            collectionsData: fixturesData,
            db
        });
    });
});

```

## With file storage
```javascript
import MongoDumper from 'mongo-collections-dumper';

let db = ...; // get database handler;

// fixtures for empty project are great use case for mongo dumper
if (databaseIsEmpty()) {

    // you can setup database from file added to project repo
    let {restored} = MongoDumper.restore({
        storage: 'file',
        file: 'fixtures.json',
        db
    });

    // if there's no file you can add fixtures and add them to repo
    if (!restored) {
        runSomeFixtures();

        MongoDumper.dump({
            storage: 'file',
            file: 'fixtures.json',
            db
        });        
    }

}
```

### License

<img src="https://vazco.eu/banner.png" align="right">

**Like every package maintained by [Vazco](https://vazco.eu/), Mongo Collections Dumper is [MIT licensed](https://github.com/vazco/uniforms/blob/master/LICENSE).**
