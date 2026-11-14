# Aturan Kerja

Dokumen ini menjadi acuan operasional untuk aturan kerja dan perubahan proses. Sebelum memulai pekerjaan yang berkaitan dengan proyek, periksa dokumen ini dan terapkan aturan terbaru yang tercatat di dalamnya.

## Vercel: jeda selama limit belum pulih

1. Tidak membuat preview selama limit Vercel belum terbebas.
2. Tidak mengecek status deployment, build, atau kuota Vercel secara berulang.
3. Tidak menunggu Vercel untuk melakukan analisis, perbaikan kode, dokumentasi, dan pekerjaan non-deployment lainnya.
4. Setelah limit diperkirakan sudah pulih, barulah lakukan build dan QA.
5. Tidak melakukan rilis production atau perubahan database live tanpa persetujuan khusus dari pengguna.

## Penerapan

- Aturan ini berlaku untuk seluruh pekerjaan proyek sampai pengguna mengubah atau mencabutnya.
- Jika ada aturan kerja atau perubahan proses baru, perbarui dokumen ini dan periksa isinya sebelum menjalankan pekerjaan berikutnya.
- Pekerjaan non-deployment tetap dapat dilanjutkan selama tidak melanggar persetujuan, keamanan, atau batasan operasional lain yang berlaku.
- Jangan menyatakan build, preview, deployment, atau QA berhasil apabila langkah tersebut belum benar-benar dijalankan dan diverifikasi.
