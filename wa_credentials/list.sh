for i in {1..300}; do
  remote_jids=$(jq -r '.processedHistoryMessages[].key.remoteJid' "${i}_credentials/creds.json")
  
  if [ -n "$remote_jids" ]; then
    echo "remote_jids=$remote_jids" >> no.txt
  else
    echo "Gagal mengambil nilai dari ${i}_credentials/creds.json"
  fi
done
