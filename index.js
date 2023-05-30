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

console.log(`Directory : ${directory}`);
console.log(`Port : ${port}`);
fetch('https://api64.ipify.org/?format=json')
  .then(response => response.json())
  .then(data => console.log(`URL : ${data.ip}:${port}`))
  .catch(error => console.error(error));
  
app.get('/', (req,res) => {
  var files = fs.readdirSync(directory);
  var filelist = [];
  for(var i =0; i < files.length; i++){
    var file = files[i];
    var suffix = file.substr(file.length - 4, file.length);
    if(suffix == '.mp4'){
      filelist.push(file)
    }
  }
  res.render('main', {
    videolist: filelist
  })
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
app.listen(port)