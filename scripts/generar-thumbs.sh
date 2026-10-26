#!/bin/zsh
setopt NULL_GLOB
cd ~/Desktop/flix/crochety/uploads/patrones
count=0; saltados=0; fallos=0
while IFS='|' read -r t H; do
  [ ${#H} -lt 16 ] && continue
  mkdir -p "$H"
  [ -f "$H/page-01.png" ] && continue
  pdfs=( ${H}*.pdf(N) )
  if [ ${#pdfs[@]} -eq 0 ]; then saltados=$((saltados+1)); continue; fi
  rm -f "$H"/page-*.png
  pdftoppm -png -r 72 -f 1 -l 1 "${pdfs[1]}" "$H/page" 2>/dev/null
  g=( "$H"/page-*.png(N) )
  if [ ${#g[@]} -gt 0 ]; then
    mv "${g[1]}" "$H/page-01.png"
    count=$((count+1))
    [ $((count % 100)) -eq 0 ] && echo "$count portadas..."
  else
    fallos=$((fallos+1))
  fi
done < /tmp/thumb_map.txt
echo "LISTO: $count portadas ($saltados sin PDF, $fallos corruptos)"
