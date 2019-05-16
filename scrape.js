const osmosis = require('osmosis');
const path = require('path');
const fs = require('fs');
const http = require('http');
const unzip = require('unzip');

const MODEL_PATH = path.join(__dirname, 'models');

function unzipModel(heroName, modelDir) {
    const readStream = fs.createReadStream(modelDir);

    const unzipDir = path.join(MODEL_PATH, heroName)
    if (!fs.existsSync(unzipDir)) {
        fs.mkdirSync(unzipDir);
        readStream
            .pipe(unzip.Extract({
                path: unzipDir
            }))
    }

    // readStream.
}

const PATH = 'http://www.dota2.com/workshop/requirements'

osmosis
    .get(PATH)
    .find('td > a')
    .set('heroName')
    .set({
        href: '@href'
    })
    .follow('@href')
    .find('div.answer > a')
    .set({
        modelLink: '@href'
    })
    .data(links => {
        if (!fs.existsSync(MODEL_PATH)) {
            fs.mkdirSync(MODEL_PATH);
        }
        let modelDir = path.join(MODEL_PATH,
            links.heroName.replace(/ /g, '_').toLowerCase() + '.zip');
        if (!fs.existsSync(modelDir)) {
            let writeStream = fs.createWriteStream(modelDir);
            let request = http.get(links.modelLink, res => {
                if (res && res.statusCode === 200) {
                    res.pipe(writeStream);
                    writeStream.on('close', () => {
                        writeStream.close();
                    });
                } else {
                    console.log(`Couldn't get the model for the hero ${links.heroName}`);
                }
                res.on('end', () => {
                    unzipModel(links.heroName, modelDir);
                });
            });
        } else {
            unzipModel(links.heroName, modelDir);
        }
    });