const fs = require('fs');
const path = require('path');
const { pipeline } = require('stream/promises');

const outputDir = 'output/';
const baseUrl = 'https://www.bing.com';
const imageApi = '/HPImageArchive.aspx?format=js&idx=0&n=8&mkt=en-GB';

async function main() {
    try {
        // Ensure output directory exists
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        // Fetch image metadata from Bing API
        const response = await fetch(baseUrl + imageApi);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const body = await response.text();
        let json;

        try {
            json = JSON.parse(body);
        } catch (parseError) {
            throw new Error(`Failed to parse JSON response: ${parseError.message}`);
        }

        const allImages = json['images'];

        if (!allImages || !Array.isArray(allImages)) {
            throw new Error('Invalid API response: missing or invalid images array');
        }

        for (const image of allImages) {
            console.log(`date: ${image['startdate']}`);
            console.log(`\t ${image['title']}`);
            console.log(`\t ${baseUrl + image['url']}`);
            console.log(`\t hash: ${image['hsh']}`);

            await downloadImage(image);
        }

        console.log('\nAll images processed successfully!');
    } catch (error) {
        console.error('Error in main process:', error.message);
        console.error('Full error:', error);
        process.exit(1);
    }
}

async function downloadImage(image) {
    try {
        const filename = `${image['startdate']}.jpg`;
        const filepath = path.join(outputDir, filename);

        // Check if file already exists (using synchronous check)
        if (fs.existsSync(filepath)) {
            console.log(`${filename} already exists`);
            return;
        }

        // Download the image
        const imageUrl = baseUrl + image['url'];
        const response = await fetch(imageUrl);

        if (!response.ok) {
            throw new Error(`Failed to download image: HTTP ${response.status}`);
        }

        if (!response.body) {
            throw new Error('Response body is null');
        }

        // Stream the image to file
        const fileStream = fs.createWriteStream(filepath);
        await pipeline(response.body, fileStream);

        console.log(`Downloaded ${filename}`);
    } catch (error) {
        console.error(`Error downloading ${image['startdate']}.jpg:`, error.message);
    }
}

// Run the main function
main();
