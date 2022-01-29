const imageThumbnail = require('image-thumbnail')
const fs = require("fs")
const sizeOf = require('image-size')
// const CryptoJS = require("crypto-js")
// const CryptoJS_AES = require("crypto-js/aes")
// const generator = require('generate-password')
// const albumKey = generator.generate({ length: 32, numbers: true, excludeSimilarCharacters: true })
// console.log(`albumKey: ${albumKey}`)
const rgx = new RegExp(`\.(jpg|jpeg)$`)
const suffix = ''

const srcImgDir = '../album-images/'
const dstnThumbsDir = '../public/lg/thumbs/'
const dstnImgDir = '../public/lg/images/'
const dstnOrigDir = '../album-images-processed/'

const appImgDir = dstnImgDir.replace('../public/', '')
const appDstnImgDir = dstnImgDir.replace('../public/', '')

const imagesFile = '../public/lg/images.json'
const readJson = (input) => { try { return JSON.parse(fs.readFileSync(input)) } catch (e) { return undefined } }
const images = readJson(imagesFile) || { files: {}, protected: false }

const optionThumb = { width: 250, jpegOptions: { force: true, quality: 90 } }
const optionCompress = { percentage: 100, jpegOptions: { force: true, quality: 50 } }

images.protected = process.argv[2] || false



const hashString = (input) => { // Simplified version of https://bit.ly/34kDb4P
  var hash = 0, i, chr
  if (input.length === 0) return hash
  for (i = 0; i < input.length; i++) {
    chr = input.charCodeAt(i)
    hash = ((hash << 5) - hash) + chr
    hash |= 0
  }
  return hash >= 0 ? hash : (hash * -1)
}

const compress = (sFileName, isLastFile) => {
  const sFile = `${srcImgDir}${sFileName}`
  const sFileNameSuffixd = sFileName.replace(rgx, `${suffix}.jpg`)
  // Generate thumbnail image
  const dFileThum = `${dstnThumbsDir}${sFileNameSuffixd}`
  if (fs.existsSync(dFileThum)) {
    console.warn(`Skipping ${dFileThum}`)
  } else {
    imageThumbnail(sFile, optionThumb).then(dFileThumbContent => fs.writeFile(dFileThum, dFileThumbContent, (err) => {
      // Generate compressed image
      const dFileCompress = `${dstnImgDir}${sFileNameSuffixd}`
      if (fs.existsSync(dFileCompress)) {
        console.warn(`Skipping ${dFileCompress}`)
      } else {
        imageThumbnail(sFile, optionCompress).then(dFileCompressContent => fs.writeFile(dFileCompress, dFileCompressContent, (err) => {
          if (err) {
            return console.error(`Err writing: ${err}`)
          } else {
            // Generate json about current Image
            const dimensions = sizeOf(sFile)
            const id = `${sFileNameSuffixd}_${hashString(sFileNameSuffixd)}`
            images.files[id] = {
              "id": id,
              "size": `${dimensions.width}-${dimensions.height}`,
              "src": appDstnImgDir + sFileNameSuffixd,
              "thumb": appImgDir + sFileNameSuffixd,
              "subHtml": sFileNameSuffixd
            }
            fs.rename(sFile, `${dstnOrigDir}${sFileName}`, (err => { if (err) console.error(`Err renaming: ${err}`) }))
            if (isLastFile) fs.writeFile(imagesFile, JSON.stringify(images), (err) => {
              if (err) console.error(`Err json write to ${imagesFile} \n${err} \n${JSON.stringify(images)}`)
            })
          }
        })).catch(err => console.error(`Err compressing: ${sFileName}: ${err}`))
      }
    })).catch(err => console.error(`Err Thumb: ${sFileName}: ${err}`))
  }
}

fs.readdir(srcImgDir, (err, files) => {
  const filesToProcess = files && files.length && files.filter(file => file.match(rgx))
  const lastFileIndex = filesToProcess && (filesToProcess.length - 1)
  filesToProcess && filesToProcess.forEach((file, index) => {
    if (file.endsWith('.jpg') || file.endsWith('.jpeg')) {
      compress(file, (index === lastFileIndex))
    }
  })
})