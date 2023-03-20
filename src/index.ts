
import cors from 'cors';
import express from 'express';
import * as fs from 'fs';
import M3U8 from '@monyone/ts-fragmenter'
import net from 'net';
import { PassThrough } from 'stream';


const PORT = 3001
const PORT_TCP_SERVER_SINK = 3002


const MAX_THREADS = 200; // set to max n'o camera streams
const FIFO_NAME = './myfifo1'
const tsFragmenterThreads = [];
const mpegMuxThreads = [];

const app = express()
app.use(cors());
app.listen(PORT || 3001, () => {
  console.log(`Start on port ${PORT || 3001}.`)
});

const initThreads = async () => {

  for (let i=0; i<MAX_THREADS; i++) {
    tsFragmenterThreads.push(
      new M3U8({ 
        length: 2,
        partTarget: 0.2,
        lowLatencyMode: true,
      })
    );
  
    // https://stackoverflow.com/a/19561718
    mpegMuxThreads.push(new PassThrough());
  }

  // // https://stackoverflow.com/a/52622889
  // fs.open(FIFO_NAME, fs.constants.O_RDONLY | fs.constants.O_NONBLOCK, (err, fd) => {
  //   // Handle err
  //   const pipe = new net.Socket({ fd });
    
  //   pipe.setMaxListeners(0);

  //   for (let i=0; i<MAX_THREADS; i++) {
  //     pipe.pipe(mpegMuxThreads[i]);
  //     mpegMuxThreads[i].pipe(tsFragmenterThreads[i]);
  //   }
  // });


  // const server = net.createServer(socket => {
  //   socket.setMaxListeners(0);

  //   for (let i=0; i<MAX_THREADS; i++) {
  //     socket.pipe(mpegMuxThreads[i]);
  //     mpegMuxThreads[i].pipe(tsFragmenterThreads[i]);
  //   }
  // })
  
  // server.listen(PORT_TCP_SERVER_SINK, () => {
  //   console.log(`Start on port ${PORT_TCP_SERVER_SINK}.`)
  // });

  const client = new net.Socket();
  client.connect(PORT_TCP_SERVER_SINK, () => {
    console.log(`Start on port ${PORT_TCP_SERVER_SINK}.`)
  });

  client.setMaxListeners(0);

  for (let i=0; i<MAX_THREADS; i++) {
    client.pipe(mpegMuxThreads[i]);
    mpegMuxThreads[i].pipe(tsFragmenterThreads[i]);
  }
}

initThreads();

// https://github.com/monyone/node-llhls-origin-example/
const manifestFunction = (req: express.Request, res: express.Response) => {
  if (!req.params.idx || +req.params.idx < 0 || +req.params.idx > (tsFragmenterThreads.length-1)) {
    res.statusMessage = 'Not found';
    return res.status(404).end();
  }

  const m3u8 = tsFragmenterThreads[+req.params.idx];

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
}


const segmentFunction = (req: express.Request, res: express.Response) => {
  if (!req.params.idx || +req.params.idx < 0 || +req.params.idx > (tsFragmenterThreads.length-1)) {
    res.statusMessage = 'Not found';
    return res.status(404).end();
  }

  const m3u8 = tsFragmenterThreads[+req.params.idx];

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
}

const partFunction = (req: express.Request, res: express.Response) => {
  if (!req.params.idx || +req.params.idx < 0 || +req.params.idx > (tsFragmenterThreads.length-1)) {
    res.statusMessage = 'Not found';
    return res.status(404).end();
  }

  const m3u8 = tsFragmenterThreads[+req.params.idx];

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
}

app.get(`/:idx/manifest.m3u8`, manifestFunction);
app.get(`/:idx/segment`, segmentFunction);
app.get(`/:idx/part`, partFunction);
