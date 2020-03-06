const request = require('request');
const fs = require('fs');

const outputDir = 'output/';
const baseUrl = 'https://www.bing.com';
const imageApi = '/HPImageArchive.aspx?format=js&idx=0&n=8&mkt=en-GB';

request(baseUrl + imageApi, (err, res, body) => {
    var json = JSON.parse(body);
    var allImages = json['images'];

    for (var i = 0; i < allImages.length; i++)
    {
        var image = allImages[i];
        console.log(`date: ${image['startdate']}`);
        console.log(`\t ${image['title']}`);
        console.log(`\t ${baseUrl + image['url']}`);
        console.log(`\t hash: ${image['hsh']}`);

        downloadImage(image);
    }
});

function downloadImage(image)
{
    fs.exists(`${outputDir + image['startdate']}.jpg`, (exists) => {
        if (!exists) {
            var file = fs.createWriteStream(`${outputDir + image['startdate']}.jpg`);
            request(baseUrl + image['url']).pipe(file).on('close', () => {
                console.log(`Downloaded ${image['startdate']}.jpg`);
            });
        } else {
            console.log(`${image['startdate']}.jpg already exists`);
        }
    });
}