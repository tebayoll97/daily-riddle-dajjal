# DAJJAL FAMILY
# MASTER WEBSITE FOUNDATION

**Document ID:** DF-MF-001  
**Version:** 1.0  
**Status:** Approved  
**Project:** Dajjal Family  
**Primary Domain:** https://dajjalfamily.com  
**Tagline:** One Family. Many Possibilities.

---

# 1. PURPOSE AND VISION

Dajjal Family adalah ekosistem digital terpadu yang menaungi berbagai produk, layanan, konten, dan komunitas dalam satu identitas.

Website dibangun sebagai platform jangka panjang yang dapat berkembang tanpa harus membangun ulang keseluruhan sistem setiap kali kategori atau produk baru ditambahkan.

### Main ecosystem

1. Gaming
2. Knowledge
3. Blog
4. Digital Products
5. Business
6. Community

### Core principles

- One ecosystem, many possibilities.
- Modular architecture.
- Consistent user experience.
- Security by design.
- Performance by design.
- SEO by design.
- Mobile-first development.
- Maintainability and scalability.

# 2. BRAND AND DESIGN SYSTEM

## 2.1 Brand identity

Seluruh halaman harus mempertahankan identitas Dajjal Family.

Brand identity meliputi:
- Logo and brand assets.
- Primary and secondary colors.
- Typography.
- Iconography.
- Visual language.
- Layout conventions.
- Component styling.

Setiap kategori dapat memiliki karakter visual tersendiri selama tetap menjadi bagian dari identitas utama.

## 2.2 Theme system

Website wajib mendukung:
- Dark Mode.
- Light Mode.

Rules:
- Kunjungan pertama mengikuti preferensi sistem perangkat.
- Pengguna dapat mengganti tema secara manual.
- Pilihan manual disimpan dan diprioritaskan.
- Seluruh halaman standar wajib mendukung kedua tema.
- Komponen baru wajib kompatibel dengan kedua tema.
- Kontras teks dan elemen harus tetap layak.
- Halaman imersif seperti gameplay dapat memiliki tampilan khusus sesuai kebutuhan produknya.

## 2.3 Design tokens

Gunakan sistem token terpusat untuk:
- Colors.
- Typography.
- Font weights and sizes.
- Spacing.
- Border radius.
- Shadows.
- Borders.
- Container widths.
- Breakpoints.
- Motion and transitions.
- Z-index layers.

Hindari nilai visual acak dan duplikasi aturan styling.

## 2.4 Responsive design

Dukungan wajib:
- Mobile.
- Tablet.
- Desktop.

Standar:
- Mobile-first.
- Tidak ada horizontal overflow yang tidak disengaja.
- Navigasi menyesuaikan perangkat.
- Konten mudah dibaca.
- Touch targets nyaman digunakan.
- Layout mobile dirancang secara khusus.

## 2.5 Shared components

Komponen dengan fungsi sama harus menggunakan standar visual dan perilaku yang konsisten.

Komponen utama:
- Buttons.
- Cards.
- Forms.
- Inputs.
- Dialogs and modals.
- Navigation.
- Dropdowns.
- Tables.
- Alerts.
- Loading states.
- Empty states.
- Error states.

Prioritaskan penggunaan shared components sebelum membuat komponen duplikat.

# 3. GLOBAL LANGUAGE AND URL ARCHITECTURE

## 3.1 Supported languages

- English (EN).
- Bahasa Indonesia (ID).

## 3.2 URL structure

Gunakan URL prefix sebagai standar resmi:

**English**
- /en/
- /en/gaming/
- /en/knowledge/
- /en/blog/

**Bahasa Indonesia**
- /id/
- /id/gaming/
- /id/knowledge/
- /id/blog/

Setiap halaman yang memiliki versi terjemahan harus memiliki hubungan bahasa yang jelas.

## 3.3 Language detection

Prioritas:
1. Preferensi bahasa yang disimpan pengguna.
2. Bahasa browser/perangkat.
3. Negara sebagai fallback.
4. English sebagai fallback terakhir.

Pilihan manual pengguna harus diprioritaskan daripada hasil deteksi otomatis.

## 3.4 Language switching

- Pengguna dapat berpindah bahasa kapan saja.
- Pilihan manual disimpan.
- Pergantian bahasa mempertahankan halaman yang sedang dibuka jika terjemahannya tersedia.
- Jika pasangan halaman tidak tersedia, arahkan ke halaman yang relevan.
- Seluruh komponen global wajib mendukung EN dan ID.
- Hindari teks antarmuka yang tercampur tanpa alasan.

## 3.5 Translation architecture

- Gunakan translation dictionary terpusat.
- Gunakan key yang konsisten.
- Pisahkan teks UI dari konten.
- Hindari terjemahan tersebar di banyak komponen.
- Sediakan fallback untuk terjemahan yang belum tersedia.

## 3.6 Multilingual SEO

- Setiap versi bahasa memiliki URL canonical sendiri.
- Gunakan hreflang untuk pasangan halaman yang benar-benar tersedia.
- Sitemap harus memuat URL bahasa yang benar.
- Hindari duplicate content.
- Jangan menggunakan redirect otomatis yang menghalangi crawler atau pengguna mengakses versi bahasa lain.
- Pertahankan route lama melalui strategi redirect yang terencana.

Migrasi URL bahasa dilakukan bertahap setelah audit route dan dependensi website.

# 4. APPLICATION ARCHITECTURE

## 4.1 Architecture decision

Gunakan **Modular Monolith dengan Next.js** sebagai arsitektur utama.

Satu aplikasi utama menaungi seluruh modul, tetapi struktur internal harus dipisahkan secara jelas.

Jangan memecah aplikasi menjadi banyak proyek sebelum terdapat kebutuhan nyata.

## 4.2 Architecture layers

**Global Foundation**
- Root layout.
- Theme provider.
- Language provider.
- Navigation.
- Footer.
- Design system.
- Global styles.
- SEO configuration.
- Error handling.

**Shared Components**
- Reusable UI.
- Forms.
- Cards.
- Dialogs.
- Navigation elements.
- Shared utilities.

**Feature Modules**
- Gaming.
- Knowledge.
- Blog.
- Digital Products.
- Business.
- Community.

**Backend Services**
- Authentication.
- Database.
- API.
- Storage.
- Authorization.
- Logging.

## 4.3 Separation of concerns

- UI dan business logic dipisahkan.
- Data access dipisahkan dari presentasi.
- Shared components tidak bergantung pada halaman tertentu.
- Modul fitur tidak boleh mengubah global state secara sembarangan.
- Hindari circular dependencies.
- Hindari duplikasi kode.

## 4.4 CSS architecture

- globals.css menjadi entry point utama.
- CSS dipisahkan berdasarkan tanggung jawab.
- Design tokens menjadi sumber nilai visual.
- Styling komponen dikontrol secara modular.
- Styling halaman tidak boleh tanpa sengaja memengaruhi halaman lain.
- Hindari selector global terlalu luas.
- Hindari penggunaan !important berlebihan.
- Migrasi legacy CSS dilakukan bertahap dengan regression testing.

# 5. UNIFIED ACCOUNT SYSTEM

## 5.1 Identity architecture

Gunakan Supabase Auth sebagai fondasi identitas pengguna.

Keputusan resmi: **One User Identity Across the Ecosystem.**

Satu pengguna dapat menggunakan identitas yang sama pada berbagai produk Dajjal Family.

## 5.2 User authorization

Bedakan:
- Authentication: identitas pengguna.
- Authorization: hak akses pengguna.

Hak akses dapat berbeda berdasarkan:
- User role.
- Product access.
- Subscription or entitlement.
- Administrative permission.

Role dan permission harus divalidasi di sisi server.

## 5.3 Account security

- Profil utama dikelola secara terpusat.
- Data tambahan produk dipisahkan sesuai kebutuhan.
- Admin permissions dibatasi.
- Data antarproduk hanya dibagikan sesuai izin.
- Jangan mempercayai role dari browser.
- Implementasikan SSO secara bertahap tanpa merusak sistem akun yang sudah ada.

# 6. DATABASE AND DATA MANAGEMENT

Gunakan Supabase sebagai fondasi backend dan database.

Standar:
- Penamaan tabel dan kolom konsisten.
- Relasi dan foreign keys dirancang dengan benar.
- Constraints menjaga integritas data.
- Indexes mengikuti pola query.
- Migrations digunakan untuk perubahan schema.
- Backup and recovery diperhatikan.
- Data pribadi dibatasi sesuai kebutuhan.
- Data retention dan deletion policy dipertimbangkan.

## 6.1 Database security

- Row Level Security diterapkan sesuai kebutuhan.
- Policy diuji sebelum rilis.
- Service role key tidak boleh masuk frontend.
- Validasi data penting dilakukan di server.
- Operasi admin harus dibatasi.
- Menyembunyikan tombol bukan pengganti authorization.

## 6.2 Data integrity

Setiap operasi perubahan data mempertimbangkan:
- Validation.
- Authorization.
- Duplicate prevention.
- Error handling.
- Transaction safety.
- Audit trail untuk operasi penting.

# 7. API AND THIRD-PARTY INTEGRATION

Setiap API harus memiliki kontrak yang jelas.

Standar:
- Request validation.
- Authentication and authorization.
- Consistent response format.
- Informative error responses.
- Rate limiting sesuai risiko.
- Pagination untuk data besar.
- Caching jika sesuai.
- Secret management.
- Dokumentasi endpoint penting.

Integrasi pihak ketiga harus memiliki fallback dan penanganan kegagalan.

# 8. SEO FOUNDATION

SEO menjadi bagian dari fondasi setiap halaman publik.

## 8.1 Technical SEO

- Metadata title and description.
- Canonical URL.
- XML sitemap.
- Robots.txt.
- Open Graph.
- Social sharing metadata.
- Structured data.
- Clean URL and slug.
- Internal linking.
- Image alt text.
- Search Console.
- Analytics.

## 8.2 Content SEO

Setiap halaman publik harus mempertimbangkan:
- Search intent.
- Relevant target keywords.
- Descriptive title.
- Accurate meta description.
- Logical heading hierarchy.
- Original and useful content.
- Relevant internal links.
- Supporting media.

## 8.3 Indexing policy

- Halaman siap publikasi dapat diindeks.
- Placeholder dan halaman belum siap menggunakan noindex.
- Hindari duplicate content.
- Canonical harus benar.
- Hreflang harus sesuai dengan versi bahasa yang tersedia.
- Jangan membuat konten hanya untuk memanipulasi mesin pencari.

Tidak ada jaminan peringkat tertentu.

# 9. PERFORMANCE FOUNDATION

Website harus ringan, cepat, dan efisien.

Standar:
- Image and media optimization.
- Lazy loading sesuai kebutuhan.
- Font optimization.
- Minimalkan JavaScript yang tidak diperlukan.
- Hindari request berulang.
- Caching yang tepat.
- Hindari layout shift.
- Gunakan rendering strategy sesuai kebutuhan.
- Pantau performa perangkat mobile.

Target Core Web Vitals:
- LCP: ≤ 2.5 seconds.
- INP: ≤ 200 milliseconds.
- CLS: ≤ 0.1.

Target dievaluasi berdasarkan pengalaman pengguna nyata.

# 10. SECURITY FOUNDATION

Security by design wajib diterapkan.

Standar:
- HTTPS.
- Secrets hanya di environment variables.
- Tidak ada secret key di frontend.
- Server-side validation.
- Authentication and authorization.
- Row Level Security.
- Rate limiting.
- Endpoint protection.
- Upload validation.
- Secure session management.
- Safe error handling.
- Dependency updates.
- Audit logging untuk operasi penting.

Setiap fitur baru harus dinilai berdasarkan risiko keamanan sebelum dirilis.

# 11. ACCESSIBILITY AND USABILITY

Target: WCAG 2.2 Level AA.

Standar:
- Adequate color contrast.
- Keyboard navigation.
- Visible focus indicators.
- Semantic HTML.
- Accessible form labels.
- Accessible error messages.
- Appropriate alt text.
- Adequate touch targets.
- Reduced motion support.
- Do not rely on color alone.

Accessibility diperhatikan sejak desain komponen.

# 12. CONTENT MANAGEMENT

Konten harus mempunyai struktur dan tanggung jawab yang jelas.

Standar:
- Pisahkan konten dari UI.
- Gunakan format konten konsisten.
- Artikel memiliki metadata yang sesuai.
- Media memiliki alt text.
- Status draft, review, dan published jika diperlukan.
- Konten harus bermanfaat dan relevan.
- Placeholder tidak boleh dipublikasikan sebagai konten final.

Setiap kategori dapat memiliki aturan editorial tersendiri.

# 13. TESTING AND QUALITY ASSURANCE

Build berhasil bukan berarti website bebas masalah.

Testing layers:
1. Build and static checks.
2. Unit tests.
3. Integration tests.
4. Functional tests.
5. Responsive tests.
6. Theme tests.
7. Language tests.
8. Accessibility checks.
9. Security checks.
10. Regression tests.

Shared components harus diuji dengan mempertimbangkan seluruh halaman yang menggunakannya.

# 14. DEVELOPMENT WORKFLOW

Urutan pengembangan:
1. Pahami kebutuhan.
2. Periksa implementasi dan dependensi.
3. Rancang solusi.
4. Identifikasi dampak perubahan.
5. Implementasikan secara modular.
6. Jalankan pemeriksaan kode dan build.
7. Uji fungsi.
8. Uji tema dan bahasa.
9. Uji mobile dan desktop.
10. Periksa SEO dan keamanan.
11. Review preview deployment.
12. Dokumentasikan hasil.

Development rules:
- Jangan menghapus fitur yang masih digunakan tanpa persetujuan.
- Jangan mengubah route tanpa memeriksa dampaknya.
- Jangan membuat duplikasi komponen.
- Jangan mengganti teknologi inti tanpa alasan jelas.
- Gunakan Git untuk version control.
- Perubahan besar harus dapat di-review dan di-rollback.

# 15. DEPLOYMENT GOVERNANCE

Platform:
- GitHub — source control and documentation.
- Vercel — hosting and deployment.
- Supabase — backend and database.

Environments:
- Development.
- Preview.
- Production.

Rules:
- Pengembangan melalui branch yang sesuai.
- Preview digunakan untuk pengujian.
- Production hanya diperbarui setelah persetujuan eksplisit.
- Periksa build dan deployment.
- Periksa environment variables.
- Perhatikan database migrations.
- Siapkan rollback strategy.
- Jangan menganggap preview sama dengan production.

**Preview first. Production only with approval.**

# 16. DOCUMENTATION AND CHANGE MANAGEMENT

Dokumentasi merupakan bagian dari produk.

Dokumen utama:
- Master Foundation.
- Architecture documentation.
- Design System documentation.
- Database schema documentation.
- API documentation.
- Feature documentation.
- Deployment documentation.
- Changelog.

Setiap keputusan arsitektur penting harus dicatat.

Perubahan Master Foundation harus:
1. Memiliki alasan.
2. Menjelaskan dampak.
3. Memiliki versi.
4. Mendapat persetujuan pemilik proyek.
5. Diperbarui pada dokumentasi resmi.

Master Foundation tidak boleh berubah diam-diam.

# 17. SCALABILITY AND MAINTAINABILITY

Arsitektur harus mendukung:
- Penambahan kategori.
- Penambahan halaman.
- Penambahan produk.
- Pertumbuhan pengguna.
- Pertumbuhan data.
- Integrasi eksternal.
- Pengembangan tim.
- Perubahan teknologi di masa depan.

Prioritaskan solusi sederhana yang dapat berkembang.

Hindari overengineering.

# 18. DEFINITION OF DONE

Pekerjaan dinyatakan selesai apabila pemeriksaan yang relevan terpenuhi:

- Build berhasil.
- Tidak ada error kritis.
- Fungsi utama berjalan.
- Tidak merusak fitur terkait.
- Mobile dan desktop layak.
- Dark Mode dan Light Mode berfungsi.
- EN dan ID berfungsi.
- Accessibility diperhatikan.
- SEO sesuai jenis halaman.
- Security diperhatikan jika relevan.
- Preview telah diperiksa.
- Dokumentasi diperbarui jika diperlukan.
- Status deployment dijelaskan dengan jujur.

# 19. DECISION PRIORITY

Prioritas keputusan teknis:

1. Security.
2. Data integrity.
3. Stability.
4. User experience.
5. Maintainability.
6. Accessibility.
7. Performance.
8. Scalability.
9. Cost efficiency.

Popularitas teknologi bukan alasan utama untuk memilih solusi.

# 20. PROJECT GOVERNANCE

Master Foundation merupakan standar induk seluruh pengembangan Dajjal Family.

Aturan:
- Setiap modul wajib mengikuti standar global.
- Pengecualian harus memiliki alasan teknis atau produk.
- Perubahan arsitektur harus didokumentasikan.
- Production deployment memerlukan persetujuan eksplisit.
- Fitur lama harus dilindungi selama proses migrasi.
- Perubahan dilakukan secara bertahap dan dapat diuji.

Dokumen ini menjadi acuan utama ketika terjadi perbedaan interpretasi dalam pengembangan.

# MASTER PRINCIPLE

**BUILD A CONSISTENT ECOSYSTEM, NOT A COLLECTION OF DISCONNECTED PAGES.**

Dajjal Family harus berkembang sebagai satu ekosistem digital dengan identitas, standar, dan arsitektur yang konsisten.

Setiap keputusan desain, teknis, konten, dan operasional harus mendukung tujuan jangka panjang tersebut.

**One Family. Many Possibilities.**
