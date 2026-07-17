const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const IMAGES = path.join(ROOT, 'images');
const ASSETS = path.join(IMAGES, 'Assets');
const PROCESSUS = path.join(IMAGES, 'Processus');

// Maps source → destination (source is actual file, dest is what HTML expects)
const files = [
  // Assets
  { src: path.join(ASSETS, 'logo.png'),        dest: path.join(ASSETS, 'logo.webp'),        resize: { width: 68, height: 68 } },
  { src: path.join(ASSETS, 'logo2.png'),       dest: path.join(ASSETS, 'logo2.webp'),       resize: { width: 300 } },
  { src: path.join(ASSETS, 'servis.jpeg'),     dest: path.join(ASSETS, 'servis.webp'),     resize: { width: 600, height: 400 } },
  { src: path.join(ASSETS, 'servis.jpeg'),     dest: path.join(ASSETS, 'servis.avif'),     resize: { width: 600, height: 400 } },

  // Service cards
  { src: path.join(IMAGES, 'SchoolSupplies.png'),              dest: path.join(IMAGES, 'SchoolSupplies.webp'),              resize: { width: 676 } },
  { src: path.join(IMAGES, 'PrintingServices.png'),             dest: path.join(IMAGES, 'PrintingServices.webp'),             resize: { width: 676 } },
  { src: path.join(IMAGES, 'events.png'),                      dest: path.join(IMAGES, 'events.webp'),                      resize: { width: 676 } },
  { src: path.join(IMAGES, 'awards.png'),                      dest: path.join(IMAGES, 'awards.webp'),                      resize: { width: 676 } },
  { src: path.join(IMAGES, 'Goodies_scolaires.png'),            dest: path.join(IMAGES, 'Goodies_scolaires.webp'),            resize: { width: 676 } },
  { src: path.join(IMAGES, 'CCTVFIX.png'),                     dest: path.join(IMAGES, 'CCTVFIX.webp'),                     resize: { width: 676 } },
  { src: path.join(IMAGES, 'Réparation réseau Wi-Fi.png'),     dest: path.join(IMAGES, 'Reparation-reseau-Wi-Fi.webp'),     resize: { width: 676 } },
  { src: path.join(IMAGES, 'Photographie & Documentation.png'), dest: path.join(IMAGES, 'Photographie-Documentation.webp'), resize: { width: 676 } },
  { src: path.join(IMAGES, 'Réparation informatique & CCTV.png'), dest: path.join(IMAGES, 'Reparation-informatique-CCTV.webp'), resize: { width: 676 } },
  { src: path.join(IMAGES, 'Programmation.png'),               dest: path.join(IMAGES, 'Programmation.webp'),               resize: { width: 676 } },
  { src: path.join(IMAGES, 'Consulting.png'),                  dest: path.join(IMAGES, 'Consulting.webp'),                  resize: { width: 676 } },
  { src: path.join(IMAGES, 'Demander un service personnalisé.png'), dest: path.join(IMAGES, 'Demander-service-personnalise.webp'), resize: { width: 676 } },
  { src: path.join(IMAGES, 'programmingServices.png'),         dest: path.join(IMAGES, 'programmingServices.webp'),         resize: { width: 676 } },
  { src: path.join(IMAGES, 'awards2.png'),                     dest: path.join(IMAGES, 'awards2.webp'),                     resize: { width: 676 } },

  // Processus
  { src: path.join(PROCESSUS, 'soumission.png'),               dest: path.join(PROCESSUS, 'soumission.webp'),               resize: { width: 400 } },
  { src: path.join(PROCESSUS, 'validation.png'),               dest: path.join(PROCESSUS, 'validation.webp'),               resize: { width: 400 } },
  { src: path.join(PROCESSUS, 'exécution.png'),                dest: path.join(PROCESSUS, 'execution.webp'),                resize: { width: 400 } },
  { src: path.join(PROCESSUS, 'Delevart.png'),                 dest: path.join(PROCESSUS, 'Delevart.webp'),                 resize: { width: 400 } },
];

async function main() {
  let ok = 0, err = 0;
  for (const f of files) {
    try {
      if (!fs.existsSync(f.src)) {
        console.log(`  SKIP  ${path.basename(f.src)} → not found`);
        continue;
      }
      const stat = fs.statSync(f.src);
      const srcSize = (stat.size / 1024).toFixed(0);
      let pipeline = sharp(f.src);

      if (f.resize) {
        const meta = await sharp(f.src).metadata();
        const opts = {};
        if (f.resize.width) opts.width = f.resize.width;
        if (f.resize.height) opts.height = f.resize.height;
        if (!f.resize.height) opts.fit = 'inside';
        pipeline = pipeline.resize(opts);
      }

      const ext = path.extname(f.dest).toLowerCase();
      if (ext === '.avif') {
        pipeline = pipeline.avif({ quality: 70 });
      } else {
        pipeline = pipeline.webp({ quality: 80 });
      }

      await pipeline.toFile(f.dest);
      const dstStat = fs.statSync(f.dest);
      const dstSize = (dstStat.size / 1024).toFixed(0);
      console.log(`  OK    ${(path.basename(f.src) + '        ').slice(0, 20)} → ${(path.basename(f.dest) + '        ').slice(0, 25)} ${srcSize}K → ${dstSize}K (${((1 - dstStat.size / stat.size) * 100).toFixed(0)}% reduction)`);
      ok++;
    } catch (e) {
      console.log(`  FAIL  ${path.basename(f.src)}: ${e.message}`);
      err++;
    }
  }
  console.log(`\nDone: ${ok} converted, ${err} failed`);
}

main();
