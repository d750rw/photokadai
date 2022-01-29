const imageThumbnail = require('image-thumbnail')
const fs = require("fs")
var sizeOf = require('image-size');
const srcImgDir = '../album-images/'
const dstnImgDir = '../public/lg/thumbs/'
const dstnCacheImgDir = '../public/lg/cache/'
const completeImgDir = '../completed/'
const appImgDir = dstnImgDir.replace('../public/', '')
const appCacheImgDir = dstnCacheImgDir.replace('../public/', '')
const imagesFile = '../public/lg/images.json'
let images = readImagesJson(imagesFile)
if (!images) images = { files: {} }
const optThumb = { width: 250, jpegOptions: { force: true, quality: 90 } }
const optCache = { percentage: 100, jpegOptions: { force: true, quality: 50 } }
let rgx = new RegExp(`\.(jpg|jpeg)$`)
let suffix = ''
const firstArg = process.argv[2]
const moveAfterComplete = process.argv[3]

const thumbGen = (file, dDir, moveAfterComplete, isLastFile, options) => {
  const fname = file.replace(rgx, `${suffix}.jpg`)
  const dFile = `${dDir}${fname}`
  const sFile = `${srcImgDir}${file}`
  if (fs.existsSync(dFile)) {
    console.log(`thumbGen skipping ${dFile}`)
    return
  } else {
    console.log(`thumbGen'ing ${file}`)
  }
  imageThumbnail(sFile, options)
    .then(thumbnail => fs.writeFile(dFile, thumbnail, (err) => {
      if (err) {
        console.error(`Current Working Directory: ${process.cwd()}`)
        return console.error(`Err while writing: ${err}`)
      } else if (moveAfterComplete) {
        populateImagesJson(sFile, fname)
        fs.rename(sFile, `${completeImgDir}${file}`, (err => { }))
        if (isLastFile) {
          fs.writeFileSync(imagesFile, JSON.stringify(images));
        }
      }
    })).catch(err => console.error(`Err on thumbGen: ${file}: ${err}`))
}


if (firstArg === 'cache') {
  fs.readdir(srcImgDir, (err, files) => files && files.forEach((file, index) => {
    if (file.endsWith('.jpg')) {
      thumbGen(file, dstnCacheImgDir, moveAfterComplete, (index === files.length - 1), optCache)
    }
  }))
} else {
  fs.readdir(srcImgDir, (err, files) => files && files.forEach((file, index) => { if (file.endsWith('.jpg')) thumbGen(file, dstnImgDir, moveAfterComplete, (index === files.length - 1), optThumb) }))
}

function populateImagesJson(sFile, fname) {
  const dimensions = sizeOf(sFile)
  const hs = hash(fname)
  images.files[`${fname}_${hs}`] = {
    "id": hs,
    "size": `${dimensions.width}-${dimensions.height}`,
    "src": appCacheImgDir + fname,
    "thumb": appImgDir + fname,
    "subHtml": fname
  }
}

function hash(input) {  // https://stackoverflow.com/a/7616484/234110
  var hash = 0, i, chr;
  if (input.length === 0) return hash;
  for (i = 0; i < input.length; i++) {
    chr = input.charCodeAt(i);
    hash = ((hash << 5) - hash) + chr;
    hash |= 0;
  }
  return hash;
}

function readImagesJson(imagesFile) {
  try {
    const t = JSON.parse(fs.readFileSync(imagesFile))
  } catch (e) {
    return undefined
  }
}
