const fs = require('fs');
const readline = require('readline');

const blockSize = 10 * 1024 * 1024;

async function externalSort(inputFilePath, outputFilePath) {
  const blocks = [];
  let block = [];
  let currentSize = 0;
  
  const inputStream = fs.createReadStream(inputFilePath);
  const rl = readline.createInterface({
    input: inputStream,
    output: process.stdout,
    terminal: false
  });

  for await (const line of rl) {
    block.push(line);
    currentSize += line.length;

    if (currentSize >= blockSize) {
      blocks.push(block);
      block = [];
      currentSize = 0;
    }
  }

  if (block.length > 0) {
    blocks.push(block);
  }

  const sortedBlocks = blocks.map(block => block.sort());
  const mergedSortedBlocks = mergeSortedBlocks(sortedBlocks);

  const output = fs.createWriteStream(outputFilePath);
  for (const line of mergedSortedBlocks) {
    output.write(line + '\n');
  }

  output.end();
}

function mergeSortedBlocks(sortedBlocks) {
  const mergedSorted = [];
  const blockPointers = new Array(sortedBlocks.length).fill(0);

  while (true) {
    let smallestLine = null;
    let smallestBlockIndex = null;

    for (let i = 0; i < sortedBlocks.length; i++) {
      const pointer = blockPointers[i];
      if (pointer < sortedBlocks[i].length) {
        const line = sortedBlocks[i][pointer];
        if (smallestLine === null || line < smallestLine) {
          smallestLine = line;
          smallestBlockIndex = i;
        }
      }
    }

    if (smallestLine === null) {
      break;
    }

    mergedSorted.push(smallestLine);
    blockPointers[smallestBlockIndex]++;
  }

  return mergedSorted;
}

externalSort('input.txt', 'output.txt');

