require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const dns = require('dns');
const {MongoClient} = require('mongodb');
const nanoid = require('nanoid');

const databaseUrl = process.env.DATABASE;

const app = express();
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, 'public')))

MongoClient.connect(databaseUrl, {useNewUrlParser: true})
    .then(client => {
        app.locals.db = client.db('shortener');
    })
    .catch(() => console.error('Failed to connect to the database'));

const shortenURL = (db, url) => {
    const shortenedURLs = db.collection('shortenedURLs');
    return shortenedURLs.findOneAndUpdate({original_url: url},
        {
            $setOnInsert: {
                original_url: url,
                short_id: nanoid(7),
            },
        },
        {
            returnOriginal: false,
            upsert: true,
        }
    );
};

const updateURL = (db, url, longurl) => {
    const shortenedURLs = db.collection('shortenedURLs');

    return shortenedURLs.findOneAndUpdate({short_id: url},
        {
            $set: {
                original_url: longurl,
                short_id: url,
            },
        },
        {
            returnNewDocument: true
        }
    );
};

const checkIfShortIdExists = (db, code) => db.collection('shortenedURLs')
    .findOne({short_id: code});

const checkIfShortIdExistsAndDelete = (db, code) => db.collection('shortenedURLs')
    .findOneAndDelete({short_id: code})

//Home page
app.get('/', (req, res) => {
    const htmlPath = path.join(__dirname, 'public', 'index.html');
    res.sendFile(htmlPath);
})

//Route to edit page
app.get('/edit', (req, res) => {
    const htmlPath = path.join(__dirname, 'public', 'edit.html');
    res.sendFile(htmlPath);
})



app.post('/edit/get', ((req, res) => {
    let shortUrl = req.body.url;
    let longUrl = req.body.longurl;
    const {db} = req.app.locals;
    let temp = shortUrl.split("/");
    let id = temp[temp.length -1];
    console.log(shortUrl)
    console.log(longUrl)
    console.log(id)
    updateURL(db, id, longUrl)
        .then(doc => {
            if (doc === null) return res.send('Uh oh. We could not find a link at that URL');
            res.send('Successfully updated')
        })

}))

app.post('/edit/delete', (req, res) => {
    let shortUrl = req.body.url;
    const {db} = req.app.locals;
    let temp = shortUrl.split("/");
    let id = temp[temp.length -1];
    checkIfShortIdExistsAndDelete(db, id)
        .then(doc => {
            if (doc === null) return res.send('Uh oh. We could not find a link at that URL');
            res.send('Successfully deleted')
        })
        .catch(console.error);

})

app.post('/new', (req, res) => {
    let originalUrl;
    try {
        originalUrl = new URL(req.body.url);
    } catch (err) {
        return res.status(400).send({error: 'invalid URL'});
    }

    dns.lookup(originalUrl.hostname, (err) => {
        if (err) {
            return res.status(404).send({error: 'Address not found'});
        }
        const {db} = req.app.locals;
        shortenURL(db, originalUrl.href)
            .then(result => {
                const doc = result.value;
                res.json({
                    original_url: doc.original_url,
                    short_id: doc.short_id,
                });
            })
            .catch(console.error);
    });
});

app.get('/:short_id', (req, res) => {
    const shortId = req.params.short_id;

    const {db} = req.app.locals;
    checkIfShortIdExists(db, shortId)
        .then(doc => {
            if (doc === null) return res.send('Uh oh. We could not find a link at that URL');

            res.redirect(doc.original_url)
        })
        .catch(console.error);

});

app.set('port', process.env.PORT || 4100);
const server = app.listen(app.get('port'), () => {
    console.log(`Express running → PORT ${server.address().port}`);
});
