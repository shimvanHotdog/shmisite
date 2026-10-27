#!/bin/bash
# Makes the small, fast copies of the header photo.
# Use: replace images/header.jpg with your photo, then run   ./make-header-images.sh
# Needs cwebp (install with: brew install webp)
set -e
cd "$(dirname "$0")/images"
tmp=$(mktemp -d)
for w in 640 960 1280 1920; do
  sips -Z $w header.jpg --out "$tmp/h.jpg" >/dev/null
  cwebp -quiet -q 60 -m 6 -sharp_yuv "$tmp/h.jpg" -o header-$w.webp
done
# a tiny copy that shows (blurred) the instant the page opens, while the real photo loads
sips -Z 48 header.jpg --out "$tmp/h.jpg" >/dev/null
cwebp -quiet -q 40 "$tmp/h.jpg" -o header-tiny.webp
rm -r "$tmp"
ls -la header*
