<?php

$s = $argv['1'];
$n = $argv['2'];

$curl = curl_init();

curl_setopt_array($curl, [
    CURLOPT_PORT => "3000",
    CURLOPT_URL => "http://localhost:3000/send-message",
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_ENCODING => "",
    CURLOPT_MAXREDIRS => 10,
    CURLOPT_TIMEOUT => 30,
    CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
    CURLOPT_CUSTOMREQUEST => "POST",
    CURLOPT_POSTFIELDS => "{\n  \"session\": \"" . $s . "\",\n  \"to\": \"" . $n . "\",\n  \"text\": \"Assalamualaikum\\n\\n*Perkenalkan Saya*\\n*NAMA*\\nAulia Rizqiana Salim S.Sos\\n*Partai*\\nDemokrat No Urut 2\\n*Daerah Pilihan*\\nPandaan, Prigen, Sukorejo\\n\\n*PROGRAM SAYA*\\n◇ ‣ Pengembangan ekonomi kreatif pada masyarakat dengan berbasis Teknologi\\n◇ ‣ Mendukung Pemasaran hasil UMKM dengan sistem basis Teknologi masa kini\\n◇ ‣ Memperluas anggaran bantuan pendidikan\\n◇ ‣ Mempercepat pembangunan di desa-desa pada DAPIL 6 di Pasuruan\",\n  \"image\": \"https://kpu.bayarsekolah.my.id/aulia.jpeg\"\n}\n",
    CURLOPT_HTTPHEADER => [
        "Accept: */*",
        "Content-Type: application/json",
        "User-Agent: Thunder Client (https://www.thunderclient.com)"
    ],
]);

$response = curl_exec($curl);
$err = curl_error($curl);

curl_close($curl);

if ($err) {
    echo "cURL Error #:" . $err;
} else {
    echo $response;
}
