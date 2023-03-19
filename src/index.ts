
// import Stream from 'node-rtsp-stream';
import Mpeg1Muxer from 'node-rtsp-stream/mpeg1muxer';


// import axios, {isCancel, AxiosError} from 'axios';
// import https from 'https';
import M3U8 from '@monyone/ts-fragmenter'

// import MemoryStream from './memory-stream';


import express from 'express';
import cors from 'cors';


import * as fs from 'fs';
import net from 'net';


let m3u8 = new M3U8({ 
  length: 2,
  partTarget: 0.5,
  lowLatencyMode: true,
});


const PORT = 3001

const tsFragmenterThreads = [];
const mpegMuxThreads = [];
const MAX_THREADS = 10;

const app = express()
app.use(cors());
app.listen(PORT || 3001, () => {
  console.log("Start on port 3001.")
});






// test reading named pipe

// https://stackoverflow.com/a/52622889
fs.open('./myfifo1', fs.constants.O_RDONLY | fs.constants.O_NONBLOCK, (err, fd) => {
  // Handle err
  const pipe = new net.Socket({ fd });
  // Now `pipe` is a stream that can be used for reading from the FIFO.
  // pipe.on('data', (data) => {
  //   // process data ...
  //   console.log(data);
  // });

  pipe.pipe(m3u8)
});














// const manifestFunction = (req: express.Request, res: express.Response) => {
//   if (!req.params.idx || +req.params.idx < 0 || +req.params.idx > (tsFragmenterThreads.length-1)) {
//     res.statusMessage = 'Not found';
//     return res.status(404).end();
//   }

//   const m3u8 = tsFragmenterThreads[+req.params.idx];

//   const { _HLS_msn, _HLS_part } = req.query;

//   if (_HLS_msn && _HLS_part) {
//     const msn = Number.parseInt(_HLS_msn as string);
//     const part = Number.parseInt(_HLS_part as string);

//     if (m3u8.isFulfilledPartial(msn, part)) {
//       res.set('Content-Type', 'application/vnd.apple.mpegurl')
//       res.send(m3u8.getManifest());
//     } else {
//       m3u8.addPartialCallback(msn, part, () => {
//         res.set('Content-Type', 'application/vnd.apple.mpegurl')
//         res.send(m3u8.getManifest());
//       })
//     }
//   } else if (_HLS_msn) {
//     const msn = Number.parseInt(_HLS_msn as string);
//     const part = 0;

//     if (m3u8.isFulfilledPartial(msn, part)) {
//       res.set('Content-Type', 'application/vnd.apple.mpegurl')
//       res.send(m3u8.getManifest());
//     } else {
//       m3u8.addPartialCallback(msn, part, () => {
//         res.set('Content-Type', 'application/vnd.apple.mpegurl')
//         res.send(m3u8.getManifest());
//       })
//     }
//   } else {
//     res.set('Content-Type', 'application/vnd.apple.mpegurl')
//     res.send(m3u8.getManifest());
//   }
// }


// const segmentFunction = (req: express.Request, res: express.Response) => {
//   if (!req.params.idx || +req.params.idx < 0 || +req.params.idx > (tsFragmenterThreads.length-1)) {
//     res.statusMessage = 'Not found';
//     return res.status(404).end();
//   }

//   const m3u8 = tsFragmenterThreads[+req.params.idx];

//   const { msn } = req.query;
//   const _msn = Number.parseInt(msn as string)

//   if (!m3u8.inRangeSegment(_msn)) {
//     res.status(404).end();
//     return;
//   }

//   if (m3u8.isFulfilledSegment(_msn)) {
//     res.set('Content-Type', 'video/mp2t');
//     res.send(m3u8.getSegment(_msn));
//   } else {
//     m3u8.addSegmentCallback(_msn, () => {
//       res.set('Content-Type', 'video/mp2t');
//       res.send(m3u8.getSegment(_msn));
//     });
//   }
// }

// const partFunction = (req: express.Request, res: express.Response) => {
//   if (!req.params.idx || +req.params.idx < 0 || +req.params.idx > (tsFragmenterThreads.length-1)) {
//     res.statusMessage = 'Not found';
//     return res.status(404).end();
//   }

//   const m3u8 = tsFragmenterThreads[+req.params.idx];

//   const { msn, part } = req.query;

//   const _msn = Number.parseInt(msn as string);
//   const _part = Number.parseInt(part as string);

//   if (!m3u8.inRangePartial(_msn, _part)) {
//     res.status(404).end();
//     return;
//   }

//   if (m3u8.isFulfilledPartial(_msn, _part)) {
//     res.set('Content-Type', 'video/mp2t');
//     res.send(m3u8.getPartial(_msn, _part));
//   } else {
//     m3u8.addPartialCallback(_msn, _part, () => {
//       res.set('Content-Type', 'video/mp2t');
//       res.send(m3u8.getPartial(_msn, _part));
//     })
//   }
// }












// // let stream = null;
// // stream.stream.stdout.pipe(m3u8)

// let stream = new Stream({
//   name: 'name',
//   streamUrl: 'rtsp://localhost:8554/mystream',
//   wsPort: 0,
//   ffmpegOptions: { // options ffmpeg flags
//     '-stats': '', // an option with no neccessary value uses a blank string
//     '-r': 30 // options with required values specify the value after the key
//   }
// })

// // setTimeout(() => {
//   stream.stream.stdout.pipe(m3u8)
// // }, 5000)



// const ffmpegPath = undefined;
// const ffmpegOptions = { // options ffmpeg flags
//   '-c:v': 'libx264',
//   '-stats': '', // an option with no neccessary value uses a blank string
//   '-r': 30 // options with required values specify the value after the key
// }



// for (let i=0; i<MAX_THREADS; i++) {
//   tsFragmenterThreads.push(
//     new M3U8({ 
//       length: 2,
//       partTarget: 0.5,
//       lowLatencyMode: true,
//     })
//   );

//   mpegMuxThreads.push(
//     new Mpeg1Muxer({
//       ffmpegOptions,
//       url: 'rtsp://localhost:8554/mystream',
//       ffmpegPath: ffmpegPath == undefined ? "ffmpeg" : ffmpegPath
//     })
//   )

//   mpegMuxThreads[i].stream.stdout.pipe(tsFragmenterThreads[i]);



// }

// app.get(`/:idx/manifest.m3u8`, manifestFunction);
// app.get(`/:idx/segment`, segmentFunction);
// app.get(`/:idx/part`, partFunction);


// const muxer = new Mpeg1Muxer({
//   ffmpegOptions,
//   url: 'rtsp://localhost:8554/mystream',
//   ffmpegPath: ffmpegPath == undefined ? "ffmpeg" : ffmpegPath
// })
// const stream = muxer.stream
// // muxer.on('mpeg1data', (data) => {
// //   console.log('qwerty')
// //   // console.log(data);
// // })
// stream.stdout.pipe(m3u8);










// // DO NOT DO THIS IF SHARING PRIVATE DATA WITH SERVICE
// const httpsAgent = new https.Agent({ rejectUnauthorized: false });

// const SCRAPER_INTERVAL = 500;



// const TIMESTAMP_PLACEHOLDER = '#EXT-X-PROGRAM-DATE-TIME:';
// const SEGMENT_DURATION_PLACEHOLDER = '#EXTINF:';


// let latestSegment: string | null = null;
// let latestSegmentDuration: number | null = null;
// let currentPlaylist: string = '';



// const timeout = (ms: any) => {
//     return new Promise(resolve => setTimeout(resolve, ms));
// }

// const requestApi = (url: string, method = 'get'): Promise<any> => {
//     return axios({
//         method,
//         url,
//         httpsAgent
//     });
// }

// const downloadBinary = (url: string, contentType: string): Promise<any> => {
//     return axios.get(url, {
//         //responseType: 'arraybuffer', // Important
//         responseType: 'stream', // Important
//         headers: {
//             'Content-Type': contentType
//         },
//         httpsAgent
//     });
// };


// const analysePlaylist = async (data: string): Promise<boolean>  => {
//     currentPlaylist = data;
//     const playlist = data.split('\n');
//     // console.log(playlist);

// //    latestSegment = null;
// //    latestSegmentDuration = null;
//     let foundNewSegment = false;

//     // crawl backwards from bottom of playlist
//     for (let i = playlist.length-1; i>=0; i--){

//         if (playlist[i] && playlist[i][0] !== '#') {
//             if (latestSegment !== playlist[i]) {
//                 foundNewSegment = true;
//                 latestSegment = playlist[i];

//                 latestSegmentDuration = parseFloat(playlist[i-1]
//                     .replace(SEGMENT_DURATION_PLACEHOLDER, '')
//                     .replace(',', '')) * 1000;
//             }
//             break;
//         }
        
//     }

//     console.log(foundNewSegment)
//     console.log(latestSegment)
//     console.log(latestSegmentDuration);
//     return foundNewSegment;
// };





// const loopFunction = async () => {
//     console.log('begin');


//     const resp = await requestApi('http://localhost:8888/mystream/stream.m3u8?_HLS_skip=YES','get');
//     const newSegment = await analysePlaylist(resp.data);
//     if (newSegment) {
//         await downloadBinary(`http://localhost:8888/mystream/${latestSegment}`, 'video/MP2T')
//             .then((response) => {

//                 m3u8 = new M3U8({
//                     length: 4,
//                     partTarget: 0.3,
//                 });

//                 response.data.pipe(m3u8)

// //                let writer: any = new MemoryStream();
// //                response.data.pipe(writer);
                
//                 m3u8.on('finish', () => {
//                     console.log('finished')
//                 });
//             })
//     }


//     setTimeout(async () => {
//         console.log('here');
//         loopFunction();
//     }, SCRAPER_INTERVAL);
// };



// loopFunction();





// app.get('/stream.m3u8', (req: express.Request, res: express.Response) => {

//     const llsManifest = m3u8.getManifest();

//     const newParts = llsManifest.slice(llsManifest.indexOf('#EXT-X-PART:DURATION')).split('\n');


//     currentPlaylist = currentPlaylist
//     .replace('#EXT-X-VERSION:3', '#EXT-X-VERSION:6')
//     .replace('#EXT-X-MEDIA-SEQUENCE','#EXT-X-PART-INF:PART-TARGET=0.300\n#EXT-X-SERVER-CONTROL:CAN-BLOCK-RELOAD=YES,PART-HOLD-BACK=1.050\n#EXT-X-MEDIA-SEQUENCE')

//     const qwerty = currentPlaylist.split('\n');
//     qwerty.splice(-3,0, ...newParts);
//     currentPlaylist = qwerty.join('\n');

//     res.set('Content-Type', 'application/vnd.apple.mpegurl')
//     let asdf = playlistSearchAndReplace(currentPlaylist, 'seg', 'http://localhost:8888/mystream/seg');
//     asdf = playlistSearchAndReplace(asdf, '?msn=0', `?msn=${latestSegment}`);

//     res.send(asdf);
// })


// const playlistSearchAndReplace = (playlist: string, findStr: string, replaceStr: string): string => {
//     return playlist.replaceAll(findStr, replaceStr);
// }





app.get('/manifest.m3u8', (req: express.Request, res: express.Response) => {
  const { _HLS_msn, _HLS_part } = req.query;

  if (_HLS_msn && _HLS_part) {
    const msn = Number.parseInt(_HLS_msn as string);
    const part = Number.parseInt(_HLS_part as string);

    if (m3u8.isFulfilledPartial(msn, part)) {
      res.set('Content-Type', 'application/vnd.apple.mpegurl')
      res.send(m3u8.getManifest());
    } else {
      m3u8.addPartialCallback(msn, part, () => {
        res.set('Content-Type', 'application/vnd.apple.mpegurl')
        res.send(m3u8.getManifest());
      })
    }
  } else if (_HLS_msn) {
    const msn = Number.parseInt(_HLS_msn as string);
    const part = 0;

    if (m3u8.isFulfilledPartial(msn, part)) {
      res.set('Content-Type', 'application/vnd.apple.mpegurl')
      res.send(m3u8.getManifest());
    } else {
      m3u8.addPartialCallback(msn, part, () => {
        res.set('Content-Type', 'application/vnd.apple.mpegurl')
        res.send(m3u8.getManifest());
      })
    }
  } else {
    res.set('Content-Type', 'application/vnd.apple.mpegurl')
    res.send(m3u8.getManifest());
  }
})

app.get('/segment', (req: express.Request, res: express.Response) => {
  const { msn } = req.query;
  const _msn = Number.parseInt(msn as string)

  if (!m3u8.inRangeSegment(_msn)) {
    res.status(404).end();
    return;
  }

  if (m3u8.isFulfilledSegment(_msn)) {
    res.set('Content-Type', 'video/mp2t');
    res.send(m3u8.getSegment(_msn));
  } else {
    m3u8.addSegmentCallback(_msn, () => {
      res.set('Content-Type', 'video/mp2t');
      res.send(m3u8.getSegment(_msn));
    });
  }
})

app.get('/part', (req: express.Request, res: express.Response) => {
  const { msn, part } = req.query;

  const _msn = Number.parseInt(msn as string);
  const _part = Number.parseInt(part as string);

  if (!m3u8.inRangePartial(_msn, _part)) {
    res.status(404).end();
    return;
  }

  if (m3u8.isFulfilledPartial(_msn, _part)) {
    res.set('Content-Type', 'video/mp2t');
    res.send(m3u8.getPartial(_msn, _part));
  } else {
    m3u8.addPartialCallback(_msn, _part, () => {
      res.set('Content-Type', 'video/mp2t');
      res.send(m3u8.getPartial(_msn, _part));
    })
  }
})









