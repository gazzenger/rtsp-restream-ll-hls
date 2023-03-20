#!/bin/bash

# rm -f ./myfifo1
# mkfifo ./myfifo1

# gst-launch-1.0 videotestsrc is-live=true ! clockoverlay halignment=right valignment=top ! timeoverlay ! videoconvert ! videoscale ! video/x-raw,width=640,height=480 ! x264enc speed-preset=veryfast tune=zerolatency bitrate=800 ! video/x-h264, stream-format=avc, profile=high  ! h264parse config-interval=1 ! mpegtsmux ! tsparse ! filesink location=./myfifo1
# gst-launch-1.0 videotestsrc is-live=true ! clockoverlay halignment=right valignment=top ! timeoverlay ! videoconvert ! videoscale ! video/x-raw,width=640,height=480 ! x264enc speed-preset=veryfast tune=zerolatency bitrate=800 ! video/x-h264, stream-format=avc, profile=high  ! h264parse config-interval=1 ! mpegtsmux ! tsparse ! tcpclientsink host=localhost port=3002
gst-launch-1.0 videotestsrc is-live=true ! clockoverlay halignment=right valignment=top ! timeoverlay ! videoconvert ! videoscale ! video/x-raw,width=640,height=480 ! x264enc speed-preset=veryfast tune=zerolatency bitrate=800 ! video/x-h264, stream-format=avc, profile=high  ! h264parse config-interval=1 ! mpegtsmux ! tsparse ! tcpserversink host=127.0.0.1 port=3002
