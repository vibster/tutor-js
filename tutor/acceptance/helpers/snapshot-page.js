import path from 'path';
import fs from 'fs';
import { git } from './git';
import pixelmatch from 'pixelmatch';
import { PNG } from 'pngjs';
const { imagesDir } = require('./images-dir');


async function compare(file) {
  const prevFile = `${file}.png`;
  const testFile = `${file}-new.png`;
  if (!fs.existsSync(prevFile)) {
    fs.renameSync(testFile, prevFile);
    return Promise.resolve({ file: prevFile, status: 'NEW' });
  }

  return new Promise((resolve) => {
    let filesRead = 0;
    let current;
    let old;
    const doneReading = () => {
      if (++filesRead < 2) return;

      var diff = new PNG({width: old.width, height: old.height});
      const mismatched = pixelmatch(old.data, current.data, diff.data, old.width, old.height, { threshold: 0.1 });
      if (mismatched > 100) {
        const diffFile = `${file}-diff.png`;
        diff.pack().pipe(fs.createWriteStream(diffFile));
        resolve({ differences: diffFile, file: prevFile, testFile, status: 'MODIFIED' });
      } else {
        fs.unlinkSync(testFile);
        resolve({ file: prevFile, status: 'OK' });
      }
    };

    current = fs.createReadStream(testFile).pipe(new PNG())
      .on('parsed', doneReading);
    old = fs.createReadStream(prevFile).pipe(new PNG())
      .on('parsed', doneReading);
  });

}

export default async function snapshot(page, name) {
  const role = global.__SERVER__.role;
  const fileBase = path.join(imagesDir, `${role}-${name}`);
  return page.screenshot({
    path: `${fileBase}-new.png`, fullPage: true,
  }).then(() => compare(fileBase));
}
