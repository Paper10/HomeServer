const fs = require('fs')
const path = require('path')
const express = require('express')
const app = express()

app.set('view engine', 'ejs')
app.use(express.static(__dirname + '/views'))

const directory_data = fs.readFileSync('directory', 'utf-8');
let directory = directory_data.trim();
const port_data = fs.readFileSync('port', 'utf-8');
let port = parseInt(port_data);
let errormessage = ""

console.log(`Directory : ${directory}`);
console.log(`Port : ${port}`);
fetch('https://api64.ipify.org/?format=json')
  .then(response => response.json())
  .then(data => console.log(`URL : ${data.ip}:${port}`))
  .catch(error => console.error(error));
  
app.get('/', (req,res) => {
  var files = fs.readdirSync(directory);
  res.render('main', {
    dir: directory,
    medialist: files,
    error: errormessage
  })
  errormessage = ""
})

app.get('/changedir/:dirname', (req,res) => {
  const { dirname } = req.params
  try{
    var files = fs.readdirSync(dirname)
    fs.writeFileSync('directory', dirname)
    directory = dirname
  } catch (err){
    errormessage = dirname + " is not valid Folder name."
  }
  res.write("OK")
})

app.get('/view/:fileName', (req, res) => {
    const { fileName } = req.params
    res.render('video', {
      title: fileName,
      videoSource: `../video/${fileName}`
    })
  })

app.get('/video/:fileName', (req, res) => {
    const { fileName } = req.params
    const fullPath = `${directory}/${fileName}`
    const fileStat = fs.statSync(fullPath)
    const { size } = fileStat
    const { range } = req.headers

    // 범위에 대한 요청이 있을 경우
    if (range) {
    // bytes= 부분을 없애고 - 단위로 문자열을 자름
    const parts = range.replace(/bytes=/, '').split('-')
    // 시작 부분의 문자열을 정수형으로 변환
    const start = parseInt(parts[0])
    // 끝 부분의 문자열을 정수형으로 변환 (끝 부분이 없으면 총 파일 사이즈에서 - 1)
    const end = parts[1] ? parseInt(parts[1]) : size - 1
    // 내보낼 부분의 길이
    const chunk = end - start + 1
    // 시작 부분과 끝 부분의 스트림을 읽음
    const stream = fs.createReadStream(fullPath, { start, end })
    // 응답
    res.writeHead(206, {
      'Content-Range': `bytes ${start}-${end}/${size}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunk,
      'Content-Type': 'video/mp4'
    })
    // 스트림을 내보냄
    stream.pipe(res)
  } else {
    // 범위에 대한 요청이 아님
    res.writeHead(200, {
      'Content-Length': size,
      'Content-Type': 'video/mp4'
    })
    // 스트림을 만들고 응답에 실어보냄
    fs.createReadStream(fullPath).pipe(res)
  }
})

app.get('/openzip/:filename', (req, res) => {
  const filename = req.params.filename;
  const zipFilePath = path.join(directory, filename);

  // 'adm-zip' library:
  const AdmZip = require('adm-zip');
  const zip = new AdmZip(zipFilePath);
  const zipEntries = zip.getEntries();

  const images = [];
  for (const zipEntry of zipEntries) {
    if (!zipEntry.isDirectory) {
      if (zipEntry.entryName.match(/\.(jpg|jpeg|png|gif)$/i)) {
        const imageData = zip.readFile(zipEntry.entryName);
        const base64Image = Buffer.from(imageData).toString('base64');
        images.push({
          name: zipEntry.entryName,
          data: base64Image
        });
      }
    }
  }

  res.render('photos', {
    title: req.params.filename,
    images: images
  });
});

app.listen(port)