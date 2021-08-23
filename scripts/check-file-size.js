const fs = require('fs');
const chalk = require('chalk');

const MAX_BYTES = 1024 * 13;
const filename = './dist/game.zip';

function getFilesizeInBytes(filename)
{
    return fs.statSync(filename).size;
}

function fileIsUnderMaxSize(fileSize)
{
    return fileSize <= MAX_BYTES;
}

fileSize = getFilesizeInBytes(filename);
fileSizeDifference = Math.abs(MAX_BYTES - fileSize);

if (fileIsUnderMaxSize(fileSize))
{
    console.log(chalk.green(`The file is under the limit.`));
    console.log(chalk.green(`USED: ${ (fileSize / MAX_BYTES * 100).toFixed(2).padStart(5) } % | ${ (fileSize + "").padStart(5) } BYTES`));
    console.log(chalk.green(`LEFT: ${ ((MAX_BYTES - fileSize) / MAX_BYTES * 100).toFixed(2).padStart(5) } % | ${ (MAX_BYTES - fileSize + "").padStart(5) } BYTES`));
    process.exit(0);
} else
{
    console.log(chalk.red(`The file is ${ fileSize } bytes (${ fileSizeDifference } bytes over the limit).`));
    console.log(chalk.red(`USED: ${ (fileSize / MAX_BYTES * 100).toFixed(2).padStart(5) } % | ${ (fileSize + "").padStart(5) } BYTES`));
    process.exit(0);
}
