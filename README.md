  WABOT

WABOT
=====

Menjalankan Proyek
------------------

Untuk menjalankan bot, Anda dapat menggunakan perintah berikut:

npm run start

Pastikan Anda telah mengonfigurasi proyek dengan benar sebelum menjalankannya.

Fitur sing ono iki
-----

*   **Validasi Nomor melalui Permintaan GET:** Anda dapat melakukan validasi nomor telepon melalui permintaan GET.
*   **Kirim Gambar dengan Keterangan:** Mengirimkan gambar bersama dengan keterangan.
*   **Kirim Pesan Teks:** Mengirim pesan teks.

Fitur sing kurang iki
---------------------

Beberapa fitur yang akan ditambahkan ke proyek ini di masa depan meliputi:

- [x]   **Dukungan Multi Akun:** Menambahkan dukungan untuk mengelola beberapa akun WhatsApp.
- [x]   **Rotasi Akun:** Melakukan rotasi otomatis antara akun setiap tiga kali pengiriman pesan.
- [ ]   **Kirim Video:** Menambahkan kemampuan untuk mengirim video.
- [ ]   **Thumbnail Video YouTube:** Mengambil dan mengirim thumbnail video YouTube berdasarkan URL.

Kontribusi
----------

Kami sangat menyambut kontribusi dari komunitas. Jika Anda ingin berkontribusi pada proyek ini, ikuti langkah-langkah berikut:

1.  Fork repositori ini.
2.  Buat branch fitur atau perbaikan Anda.
3.  Lakukan perubahan yang diperlukan.
4.  Buat pull request ke repositori ini.


Akses API
-------

#### Add new session
```
  GET /start-session?session=NEW_SESSION_NAME&scan=true
```
url : http://localhost:3000/send-message

{
  "session": "test1",
  "to": "62812345678909",
  "text": "Hello, this is a test message!"
}
| Parameter | Type      | keterangan                             |
| :-------- | :-------- | :------------------------------------- |
| `session` | `string`  | **Required**. Create Your Session Name |
| `scan`    | `boolean` | Print QR at Browser                    |

#### Send Text Message

```
  POST /send-message
```

| Body      | Type     | Description                                                              |
| :-------- | :------- | :----------------------------------------------------------------------- |
| `session` | `string` | **Required**. Session Name You Have Created                              |
| `to`      | `string` | **Required**. Receiver Phone Number with Country Code (e.g: 62812345678) |
| `text`    | `string` | **Required**. Text Message                                               |

#### Send Bulk Message

```
  POST /send-bulk-message
```

| Body      | Type     | Description                                         |
| :-------- | :------- | :-------------------------------------------------- |
| `session` | `string` | **Required**. Session Name You Have Created         |
| `data`    | `array`  | **Required**. Array Of Object Message Data          |
| `delay`   | `number` | Delay Per-message in Miliseconds, Default to 5000ms |

#### Delete session

```
  GET /delete-session?session=SESSION_NAME
```

| Parameter | Type     | Description                            |
| :-------- | :------- | :------------------------------------- |
| `session` | `string` | **Required**. Create Your Session Name |

#### Get All Session ID

```
  GET /sessions?key=list
```

| Parameter | Type     | Description                      |
| :-------- | :------- | :------------------------------- |
| `key`     | `string` | **Required**. Key on ".env" file |


Lisensi
-------

GA ONO LISENSI PENTING LANCAR
