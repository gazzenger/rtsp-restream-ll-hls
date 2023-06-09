# rtsp-restream-ll-hls

Attempting to look for an efficient method to either
- restream an existing rtsp stream as LL-HLS
- output from an existing Gstreamer pipeline
- rejigging an existing hls stream into an ll-hls stream

## Requirements

- gstreamer
- gstreamer bad, ugly and vaapi plugins
- rtsp-simple-streamer
- vlc player

## Usage

This code has been overhauled
```
npm run start
```
The code will execute a Gstreamer testvideosrc, and output to a given FIFO file (./myfifo1)
The script located in `./src/index.ts` is also executed, and subscribes to the FIFO file.
As the MPEG-TS is streamed from GStreamer, it is read by the node script and served as LL-HLS.

The number of HLS streams is dictated by `MAX_THREADS`, with each HLS stream being served at,
`http://localhost:3001/:id/manifest.m3u8`


## GStreamer
A simple gstreamer generator for producing a test pattern, with a clock and time overlay
```
gst-launch-1.0 videotestsrc is-live=true ! clockoverlay halignment=right valignment=top ! timeoverlay ! videoconvert ! videoscale ! video/x-raw,width=640,height=480 ! x264enc speed-preset=veryfast tune=zerolatency bitrate=800 ! rtspclientsink location=rtsp://localhost:8554/mystream
```

## RTSP-Simple-Server

Update the config `/etc/rtsp-simple-server/rtsp-simple-server.yml`

Add the route `mystream`
```
paths:
  mystream:
	runOnDemand: gst-launch-1.0 videotestsrc is-live=true ! clockoverlay halignment=right valignment=top ! timeoverlay ! videoconvert ! videoscale ! video/x-raw,width=640,height=480 ! x264enc speed-preset=veryfast tune=zerolatency bitrate=800 ! rtspclientsink location=rtsp://localhost:8554/mystream
	runOnDemandRestart: yes
  all:
```

For testing HLS low latency, additionally also requires ssl enabled
```
hlsVariant: lowLatency
hlsVariant: lowLatency
hlsEncryption: yes
hlsServerKey: server.key
hlsServerCert: server.crt
```

Generate a snakeoil SSL certificate with
```
openssl genrsa -out server.key 2048
openssl req -new -x509 -sha256 -key server.key -out server.crt -days 3650
```

Run rtsp-simple-server from this directory with the command `sudo rtsp-simple-server`


## VLC Player
Test an RTSP steam with VLC
```
vlc --network-caching=50 rtsp://localhost:8554/mystream
```

## Configurating everything
To run a simple test stream with RTSP-simple-server, you much
- start rtsp-simple-server
- ensure the config is configured for the gstreamer test pattern
- open vlc player



## Testing
All testing is using a node library `@monyone/ts-fragmenter` which takes in a MPEG-TS stream and converts it into LL-HLS.

Testing has shown that an RTSP resources can be ingested and converted into MPEG-TS outputs using an FFMPEG child processes, using the library `node-rtsp-stream/mpeg1muxer`
This is not necessarily scalable, but does work with existing RTSP streams.

An alternative has been to directly ingest mpeg-ts from GStreamer using the `mpegtsmux/tsparse/ and fdsink` sinks.
- `fdsink` enables outputting directly to the stdpipe
- `multisocketsink` would in fact be a more valid sink, as this enables configuring UNIX sockets

For now fsink work with the following command, with the example node application, `node-llhls-origin-example`
```
gst-launch-1.0 videotestsrc is-live=true ! clockoverlay halignment=right valignment=top ! timeoverlay ! videoconvert ! videoscale ! video/x-raw,width=640,height=480 ! x264enc speed-preset=veryfast tune=zerolatency bitrate=800 ! video/x-h264, stream-format=avc, profile=high  ! h264parse config-interval=1 ! mpegtsmux ! tsparse ! fdsink  | npm run start
```



*some issues found include, the H.264 encoding MUST be set to HIGH, or baseline, as HEVC encoding can only be done with fmp4*
https://developer.apple.com/documentation/http_live_streaming/http_live_streaming_hls_authoring_specification_for_apple_devices




## Using Named Pipes
(b5e2c6530eb9b74b09972589e0298faabc86227c)

Use of named pipes will allow us to output directly from an existing GStreamer pipeline, replacing the existing HLSSink.

Start by creating the named pipe
```
mkfifo <FILENAME>
```

Then start the GStreamer test pipeline, with a filesink
```
gst-launch-1.0 videotestsrc is-live=true ! clockoverlay halignment=right valignment=top ! timeoverlay ! videoconvert ! videoscale ! video/x-raw,width=640,height=480 ! x264enc speed-preset=veryfast tune=zerolatency bitrate=800 ! video/x-h264, stream-format=avc, profile=high  ! h264parse config-interval=1 ! mpegtsmux ! tsparse ! filesink location=./myfifo1
```
This will now wait until that pipe is opened on the other end

i.e.
```
cat myfifo1 | npm run start
```


## Test HLS Streams
- https://www.theoplayer.com/test-your-stream-hls-dash-hesp (https://www.npmjs.com/package/theoplayer)
- https://demo.ovenplayer.com/
- https://github.com/video-dev/hls.js/
