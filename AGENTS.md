# AGENTS.md — Panduan Pengembangan Platform Asesmen Digital SMKN 31 Jakarta

> Dokumen ini adalah panduan kerja lengkap untuk membangun platform ujian digital berbasis web (mirip Google Form) menggunakan **Next.js 14+**, **MongoDB**, dan **TailwindCSS**. Ikuti urutan task secara berurutan. Setiap agent/developer yang mengerjakan bagian tertentu wajib membaca keseluruhan dokumen ini terlebih dahulu.

---

## 📐 Arsitektur Sistem

```
smkn31-asesmen/
├── app/                          # Next.js App Router
│   ├── (auth)/
│   │   └── login/page.tsx        # Halaman login (siswa & admin)
│   ├── (student)/
│   │   ├── layout.tsx            # Layout ujian (anti-cheat wrapper)
│   │   ├── exam/
│   │   │   ├── page.tsx          # Halaman informasi sebelum ujian
│   │   │   └── [sessionId]/
│   │   │       └── page.tsx      # Halaman soal ujian aktif
│   │   └── result/
│   │       └── page.tsx          # Halaman hasil ujian siswa
│   ├── (admin)/
│   │   ├── layout.tsx            # Layout dashboard admin
│   │   ├── dashboard/page.tsx    # Ringkasan & statistik
│   │   ├── questions/
│   │   │   ├── page.tsx          # Daftar semua soal
│   │   │   └── [id]/page.tsx     # Edit soal
│   │   ├── sessions/
│   │   │   ├── page.tsx          # Manajemen sesi ujian
│   │   │   └── [id]/page.tsx     # Detail sesi & peserta
│   │   └── results/
│   │       ├── page.tsx          # Semua hasil ujian
│   │       └── [studentId]/page.tsx
│   └── api/
│       ├── auth/
│       │   ├── login/route.ts
│       │   └── logout/route.ts
│       ├── exam/
│       │   ├── start/route.ts
│       │   ├── submit/route.ts
│       │   ├── answer/route.ts   # Auto-save jawaban
│       │   └── violation/route.ts # Log pelanggaran tab
│       ├── questions/
│       │   ├── route.ts          # GET (admin) / POST
│       │   └── [id]/route.ts     # PUT / DELETE
│       ├── sessions/
│       │   ├── route.ts
│       │   └── [id]/route.ts
│       └── results/
│           └── route.ts
├── components/
│   ├── exam/
│   │   ├── QuestionCard.tsx      # Komponen render soal berdasarkan tipe
│   │   ├── MatchingQuestion.tsx  # Soal pasangkan (no. 1-8)
│   │   ├── MultipleChoice.tsx    # Soal pilihan ganda (no. 9-18)
│   │   ├── MultipleResponse.tsx  # Soal multiple response (no. 19-20)
│   │   ├── EssayQuestion.tsx     # Soal essay (no. 21-25)
│   │   ├── QuestionNavigator.tsx # Panel navigasi nomor soal
│   │   ├── TimerBar.tsx          # Countdown timer
│   │   ├── ViolationWarning.tsx  # Modal peringatan keluar tab
│   │   └── ProgressBar.tsx       # Progress pengerjaan soal
│   ├── admin/
│   │   ├── StatCard.tsx
│   │   ├── ResultsTable.tsx
│   │   ├── QuestionEditor.tsx
│   │   └── ScoreChart.tsx
│   └── ui/
│       ├── Button.tsx
│       ├── Modal.tsx
│       ├── Badge.tsx
│       └── Toast.tsx
├── lib/
│   ├── mongodb.ts               # Koneksi MongoDB
│   ├── auth.ts                  # JWT helper
│   ├── grader.ts                # Logic penilaian otomatis
│   └── antiCheat.ts             # Utilitas anti-cheat
├── models/
│   ├── User.ts                  # Schema siswa & admin
│   ├── Question.ts              # Schema soal
│   ├── ExamSession.ts           # Schema sesi ujian
│   ├── Answer.ts                # Schema jawaban siswa
│   └── Violation.ts             # Schema log pelanggaran
├── hooks/
│   ├── useAntiCheat.ts          # Hook deteksi keluar tab/window
│   ├── useExamTimer.ts          # Hook timer ujian
│   └── useAutoSave.ts           # Hook auto-save jawaban
├── types/
│   └── index.ts                 # TypeScript interfaces
├── middleware.ts                # Auth guard & route protection
├── .env.local                   # Environment variables
└── seed/
    └── questions.ts             # Seed data soal dari PDF
```

---

## 🗂️ Fase Pengembangan

### FASE 1 — Setup & Fondasi

#### Task 1.1 — Inisialisasi Project

```bash
npx create-next-app@latest smkn31-asesmen \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir=false \
  --import-alias="@/*"

cd smkn31-asesmen

npm install \
  mongoose \
  bcryptjs \
  jsonwebtoken \
  jose \
  zod \
  @radix-ui/react-dialog \
  @radix-ui/react-dropdown-menu \
  @radix-ui/react-progress \
  @radix-ui/react-toast \
  recharts \
  date-fns \
  clsx \
  tailwind-merge \
  lucide-react \
  framer-motion

npm install -D @types/bcryptjs @types/jsonwebtoken
```

#### Task 1.2 — Environment Variables

Buat file `.env.local`:

```env
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/smkn31_asesmen
JWT_SECRET=ganti_dengan_string_random_64_karakter
NEXT_PUBLIC_APP_NAME=Asesmen SMKN 31 Jakarta
NEXT_PUBLIC_APP_URL=http://localhost:3000
ADMIN_DEFAULT_EMAIL=admin@smkn31.sch.id
ADMIN_DEFAULT_PASSWORD=Admin@123
EXAM_DURATION_MINUTES=90
MAX_VIOLATIONS=3
```

#### Task 1.3 — Koneksi MongoDB (`lib/mongodb.ts`)

```typescript
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) throw new Error('MONGODB_URI tidak ditemukan di .env.local');

let cached = global.mongoose as { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null };

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export async function connectDB() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
    });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}
```

---

### FASE 2 — Models Database

#### Task 2.1 — User Model (`models/User.ts`)

```typescript
const UserSchema = new Schema({
  name: { type: String, required: true },
  nisn: { type: String, unique: true, sparse: true },  // untuk siswa
  email: { type: String, unique: true, sparse: true }, // untuk admin
  password: { type: String, required: true },
  role: { type: String, enum: ['student', 'admin'], default: 'student' },
  class: String,        // e.g. "XI TKJ 1"
  createdAt: { type: Date, default: Date.now },
});
```

**Catatan:** Siswa login menggunakan **NISN**, admin menggunakan **email**.

#### Task 2.2 — Question Model (`models/Question.ts`)

```typescript
const QuestionSchema = new Schema({
  number: { type: Number, required: true },
  type: {
    type: String,
    enum: ['matching', 'multiple_choice', 'multiple_response', 'essay'],
    required: true,
  },
  subject: { type: String, default: 'Matematika' },
  gradeLevel: { type: String, default: 'XI' },
  questionText: { type: String, required: true },
  imageUrl: String,                    // opsional, untuk soal bergambar
  options: [{                          // untuk multiple choice & response
    key: String,                       // 'A', 'B', 'C', dst
    text: String,
  }],
  matchingPairs: [{                    // untuk soal pasangkan
    statement: String,                 // Kolom A
    answer: String,                    // Kunci jawaban
  }],
  matchingOptions: [String],           // Kolom B (semua opsi)
  correctAnswer: Schema.Types.Mixed,   // String/Array tergantung tipe
  points: { type: Number, default: 5 },
  explanation: String,                 // Pembahasan jawaban (opsional)
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});
```

#### Task 2.3 — ExamSession Model (`models/ExamSession.ts`)

```typescript
const ExamSessionSchema = new Schema({
  name: { type: String, required: true },           // e.g. "UKK Matematika XI 2026"
  subject: String,
  startTime: Date,
  endTime: Date,
  duration: { type: Number, default: 90 },          // dalam menit
  questionIds: [{ type: Schema.Types.ObjectId, ref: 'Question' }],
  allowedClasses: [String],                          // kelas yang boleh ikut
  isActive: { type: Boolean, default: false },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
});
```

#### Task 2.4 — Answer Model (`models/Answer.ts`)

```typescript
const AnswerSchema = new Schema({
  studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  sessionId: { type: Schema.Types.ObjectId, ref: 'ExamSession', required: true },
  answers: [{
    questionId: { type: Schema.Types.ObjectId, ref: 'Question' },
    questionNumber: Number,
    questionType: String,
    studentAnswer: Schema.Types.Mixed,  // bisa string, array, atau object
    isCorrect: Boolean,
    pointsEarned: Number,
    answeredAt: Date,
  }],
  totalScore: { type: Number, default: 0 },
  maxScore: Number,
  percentageScore: Number,
  grade: String,                         // 'A', 'B', 'C', 'D', 'E'
  startedAt: { type: Date, default: Date.now },
  submittedAt: Date,
  isSubmitted: { type: Boolean, default: false },
  isTerminated: { type: Boolean, default: false }, // true jika paksa selesai karena pelanggaran
  timeSpent: Number,                               // dalam detik
  violationCount: { type: Number, default: 0 },
});
```

#### Task 2.5 — Violation Model (`models/Violation.ts`)

```typescript
const ViolationSchema = new Schema({
  studentId: { type: Schema.Types.ObjectId, ref: 'User' },
  sessionId: { type: Schema.Types.ObjectId, ref: 'ExamSession' },
  answerId: { type: Schema.Types.ObjectId, ref: 'Answer' },
  type: {
    type: String,
    enum: ['tab_switch', 'window_blur', 'fullscreen_exit', 'copy_paste', 'right_click'],
  },
  count: { type: Number, default: 1 },
  timestamp: { type: Date, default: Date.now },
  userAgent: String,
});
```

---

### FASE 3 — Autentikasi

#### Task 3.1 — Auth API Routes

**`app/api/auth/login/route.ts`**

- Terima `{ identity, password, role }` — identity bisa NISN (siswa) atau email (admin)
- Cari user berdasarkan NISN atau email sesuai role
- Bandingkan password dengan bcrypt
- Generate JWT dengan payload `{ userId, role, name }`
- Set cookie `auth_token` HttpOnly, Secure, SameSite=Strict
- Return `{ success: true, user: { name, role } }`

**`app/api/auth/logout/route.ts`**

- Hapus cookie `auth_token`
- Return `{ success: true }`

#### Task 3.2 — Middleware Auth Guard (`middleware.ts`)

```typescript
// Route yang dilindungi:
// /exam/* dan /result → hanya role 'student'
// /dashboard/* dan /admin/* → hanya role 'admin'
// /login → redirect jika sudah login
```

Gunakan `jose` untuk verifikasi JWT di Edge Runtime:

```typescript
import { jwtVerify } from 'jose';
const secret = new TextEncoder().encode(process.env.JWT_SECRET);
const { payload } = await jwtVerify(token, secret);
```

---

### FASE 4 — Fitur Anti-Cheat

> **Ini adalah fitur kritis.** Implementasikan dengan sangat teliti.

#### Task 4.1 — Hook `useAntiCheat` (`hooks/useAntiCheat.ts`)

```typescript
interface AntiCheatConfig {
  maxViolations: number;         // default: 3
  onWarning: (count: number, remaining: number) => void;
  onTerminate: () => void;
  sessionId: string;
}

// Event yang dipantau:
// 1. document.addEventListener('visibilitychange') → tab switch
// 2. window.addEventListener('blur') → window blur / alt+tab
// 3. document.addEventListener('fullscreenchange') → keluar fullscreen
// 4. document.addEventListener('contextmenu') → right-click prevention
// 5. document.addEventListener('copy') → paste prevention (opsional)
// 6. beforeunload → peringatan sebelum menutup halaman

// Logic:
// - Setiap pelanggaran → increment counter
// - Counter <= maxViolations → tampilkan ViolationWarning modal
// - Counter > maxViolations → panggil onTerminate() → POST /api/exam/violation dengan force_submit: true

// Catat ke server:
// POST /api/exam/violation
// Body: { sessionId, type, count }
```

**Aturan pelanggaran:**
| Jumlah | Aksi |
|--------|------|
| 1 | ⚠️ Peringatan 1: "Kamu terdeteksi keluar dari halaman ujian. Peringatan ke-1 dari 3." |
| 2 | ⚠️ Peringatan 2: "Ini peringatan terakhirmu! Sekali lagi keluar, ujian dinyatakan selesai." |
| 3 | ⚠️ Peringatan 3 (final): "Ini peringatan ke-3. 1 kali lagi akan dinyatakan selesai." |
| >3 | 🛑 Paksa submit: "Ujianmu dinyatakan selesai karena terlalu sering meninggalkan halaman." |

#### Task 4.2 — Violation Warning Component (`components/exam/ViolationWarning.tsx`)

Modal full-overlay yang:
- Tidak bisa ditutup dengan klik di luar atau tombol X
- Hanya bisa ditutup dengan klik tombol "Saya Mengerti"
- Menampilkan jumlah pelanggaran saat ini dan sisa peringatan
- Animasi shake/pulse yang mencolok agar efek deterren terasa
- Pada pelanggaran ke-4+: modal berbeda dengan pesan "Ujian Selesai" yang tidak bisa ditutup, lalu auto-redirect ke halaman hasil

#### Task 4.3 — API Route Violation (`app/api/exam/violation/route.ts`)

```typescript
// POST /api/exam/violation
// 1. Autentikasi JWT
// 2. Increment violationCount di Answer document
// 3. Simpan record ke Violation collection
// 4. Jika violationCount > MAX_VIOLATIONS:
//    a. Set Answer.isTerminated = true
//    b. Set Answer.submittedAt = now
//    c. Set Answer.isSubmitted = true
//    d. Hitung skor dari jawaban yang sudah ada
//    e. Return { terminated: true, finalScore: ... }
// 5. Else: Return { terminated: false, violationCount, remaining }
```

---

### FASE 5 — Fitur Ujian (Siswa)

#### Task 5.1 — Halaman Informasi Ujian (`app/(student)/exam/page.tsx`)

Tampilkan:
- Nama ujian, mata pelajaran, kelas
- Durasi waktu
- Jumlah soal per tipe
- Aturan ujian (termasuk aturan anti-cheat yang jelas dan tegas)
- Tombol "Mulai Ujian" → POST `/api/exam/start` → redirect ke `/exam/[sessionId]`

**`POST /api/exam/start`:**
- Cek apakah siswa sudah pernah mengerjakan sesi ini (cek di Answer)
- Jika sudah submit → redirect ke `/result`
- Jika belum → buat Answer baru, return sessionId + soal-soal (tanpa kunci jawaban!)
- Acak urutan soal (opsional, bisa dikonfigurasi admin)

#### Task 5.2 — Halaman Soal Ujian (`app/(student)/exam/[sessionId]/page.tsx`)

**Layout halaman:**
```
┌─────────────────────────────────────────────────────┐
│  [LOGO] SMKN 31 Jakarta — Matematika XI    [Timer]  │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Soal 1 dari 25          [Progress Bar: 4%]         │
│                                                     │
│  ┌─────────────────────────────────────────────┐   │
│  │           [QuestionCard sesuai tipe]        │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│         [← Sebelumnya]  [Selanjutnya →]             │
│                                                     │
├─────────────────────────────────────────────────────┤
│  Navigator: [1][2][3]...[25]    [Selesai & Kirim]   │
└─────────────────────────────────────────────────────┘
```

**Fitur:**
- Navigasi soal: tombol prev/next & klik nomor langsung
- Auto-save setiap kali jawaban berubah → `PATCH /api/exam/answer`
- Auto-save berkala setiap 30 detik
- Timer countdown dengan peringatan visual saat < 10 menit (kuning) dan < 5 menit (merah, berkedip)
- Saat timer habis → auto-submit otomatis
- Indikator status soal di navigator: abu-abu (belum), biru (sudah dijawab)
- Konfirmasi sebelum submit: modal "Kamu baru menjawab X dari 25 soal. Yakin ingin mengirim?"
- Setelah submit → redirect ke `/result`

#### Task 5.3 — Render Soal Berdasarkan Tipe

**Matching (no. 1–8) — `components/exam/MatchingQuestion.tsx`**
- Kolom A: 8 pernyataan
- Kolom B: dropdown select untuk setiap pernyataan dengan 14 opsi (A–N)
- Atau implementasikan drag-and-drop (lebih interaktif dan menarik)

**Multiple Choice (no. 9–18) — `components/exam/MultipleChoice.tsx`**
- Radio button dengan animasi ripple saat dipilih
- Tampilan opsi berbentuk kartu (seperti Google Form)
- Highlight opsi yang dipilih dengan warna brand

**Multiple Response (no. 19–20) — `components/exam/MultipleResponse.tsx`**
- Checkbox untuk memilih (i), (ii), (iii), (iv)
- Lalu pilih jawaban akhir: A, B, C, D, atau E dari 5 opsi kombinasi yang tersedia

**Essay (no. 21–25) — `components/exam/EssayQuestion.tsx`**
- Textarea yang bisa diperbesar
- Counter karakter
- Toolbar format sederhana (bold, italic, list) — opsional
- Catatan: essay tidak dinilai otomatis, admin harus nilai manual

#### Task 5.4 — Auto-Save (`hooks/useAutoSave.ts`)

```typescript
// Debounce 1.5 detik setelah user berhenti mengubah jawaban
// Lalu PATCH /api/exam/answer
// Body: { sessionId, questionId, answer }
// Tampilkan toast kecil "Tersimpan ✓" di pojok layar
// Jika error → tampilkan "Gagal menyimpan, mencoba ulang..."
```

#### Task 5.5 — Halaman Hasil (`app/(student)/result/page.tsx`)

Tampilkan:
- Nama siswa, kelas, tanggal ujian
- Total skor (dari soal objektif yang sudah dihitung otomatis)
- Nilai per kategori soal (matching, pilihan ganda, multiple response)
- Catatan: "Essay sedang dalam proses penilaian oleh guru"
- Jika ujian diterminasi: banner merah "Ujian dinyatakan selesai karena pelanggaran"
- Tombol "Kembali ke Beranda"
- **TIDAK menampilkan kunci jawaban** kepada siswa

---

### FASE 6 — Dashboard Admin

#### Task 6.1 — Halaman Login Admin

- Form email + password
- Field password wajib ada toggle show/hide
- Setelah login sebagai admin → redirect ke `/dashboard`

#### Task 6.2 — Dashboard Utama (`app/(admin)/dashboard/page.tsx`)

**Widget statistik (StatCard):**
- Total peserta terdaftar
- Sudah mengerjakan / belum mengerjakan
- Rata-rata nilai keseluruhan
- Jumlah pelanggaran hari ini

**Grafik (Recharts):**
- Distribusi nilai (histogram)
- Pie chart: lulus vs tidak lulus
- Line chart: waktu submission

**Tabel terbaru:**
- 10 submission terbaru dengan nama, kelas, skor, waktu

#### Task 6.3 — Manajemen Soal (`app/(admin)/questions/page.tsx`)

- Tampil semua soal dalam tabel
- Filter berdasarkan tipe soal
- Tombol tambah, edit, hapus soal
- Import soal via JSON (opsional)
- Editor soal support tipe matching, pilihan ganda, multiple response, essay

**`app/(admin)/questions/[id]/page.tsx`** — Form edit soal dengan:
- Pilih tipe soal
- Input pernyataan/pertanyaan
- Upload gambar (opsional)
- Input opsi jawaban dinamis (tambah/hapus opsi)
- Input kunci jawaban
- Preview soal secara real-time

#### Task 6.4 — Manajemen Sesi (`app/(admin)/sessions/page.tsx`)

- Buat sesi ujian baru: nama, mata pelajaran, tanggal, durasi, kelas yang diizinkan
- Pilih soal-soal yang dimasukkan ke sesi
- Aktifkan/nonaktifkan sesi
- Tombol "Salin Link" untuk dibagikan ke siswa

#### Task 6.5 — Hasil Ujian (`app/(admin)/results/page.tsx`)

- Tabel semua hasil ujian dengan filter kelas, sesi, rentang tanggal
- Export ke CSV/Excel
- Klik baris untuk lihat detail per siswa: jawaban per soal, waktu per jawaban
- Form penilaian manual untuk soal essay
- Badge khusus untuk siswa yang dikenai terminate (pelanggaran)
- Kolom "Jumlah Pelanggaran" dengan tooltip detail tipe pelanggaran

---

### FASE 7 — Logic Penilaian (`lib/grader.ts`)

```typescript
// Fungsi gradeAnswer(question, studentAnswer): { isCorrect, pointsEarned }

// Matching: 
//   Setiap pasangan benar = 1 poin (total 8 poin untuk soal 1–8)
//   Toleransi: case-insensitive, trim whitespace

// Multiple Choice:
//   Jawaban tepat = poin penuh
//   Salah = 0 (tidak ada pengurangan poin)

// Multiple Response:
//   Jawaban tepat (huruf pilihan A/B/C/D/E) = poin penuh
//   Salah = 0

// Essay:
//   Score = null (menunggu penilaian manual oleh admin)
//   Admin isi via form di dashboard results

// Grade calculation:
//   A  = 90–100
//   B  = 75–89
//   C  = 60–74
//   D  = 45–59
//   E  = 0–44
```

---

### FASE 8 — Seed Data (`seed/questions.ts`)

Jalankan seed dengan `npx tsx seed/questions.ts` untuk mengisi soal dari PDF.

Data soal yang sudah siap (berdasarkan PDF):

```typescript
const questions = [
  // === MATCHING (1–8) ===
  {
    number: 1, type: 'matching',
    questionText: 'Pasangkan pernyataan berikut dengan istilah yang tepat pada unsur-unsur lingkaran!',
    matchingPairs: [
      { statement: 'Garis yang menghubungkan titik pusat dengan titik pada lingkaran.', answer: 'E' },
      { statement: 'Panjang garis lurus yang melalui titik pusat dan menghubungkan dua titik pada lingkaran.', answer: 'A' },
      { statement: 'Daerah yang dibatasi oleh dua jari-jari dan sebuah busur.', answer: 'J' },
      { statement: 'Bagian lingkaran yang berupa garis lengkung.', answer: 'B' },
      { statement: 'Garis yang memotong lingkaran di dua titik.', answer: 'K' },
      { statement: 'Garis yang hanya menyinggung lingkaran di satu titik.', answer: 'G' },
      { statement: 'Sudut yang titik sudutnya berada di pusat lingkaran.', answer: 'H' },
      { statement: 'Jarak pusat ke tali busur atau garis singgung tertentu.', answer: 'C' },
    ],
    matchingOptions: [
      'A. Diameter', 'B. Busur', 'C. Apotema', 'D. Tembereng', 'E. Jari-jari',
      'F. Tali busur', 'G. Garis singgung', 'H. Sudut pusat', 'I. Sudut keliling',
      'J. Juring', 'K. Sekan', 'L. Titik singgung', 'M. Keliling lingkaran', 'N. Luas lingkaran',
    ],
    correctAnswer: { '1': 'E', '2': 'A', '3': 'J', '4': 'B', '5': 'K', '6': 'G', '7': 'H', '8': 'C' },
    points: 8,
  },
  // === MULTIPLE CHOICE (9–18) ===
  {
    number: 9, type: 'multiple_choice',
    questionText: 'Bianglala memiliki pusat O dan diameter 20 meter. Posisi A dan B membentuk sudut pusat 120°. Panjang busur AB melalui lintasan paling pendek adalah ….',
    options: [
      { key: 'A', text: '10π/3 meter' },
      { key: 'B', text: '20π/3 meter' },
      { key: 'C', text: '30π/3 meter' },
      { key: 'D', text: '40π/3 meter' },
      { key: 'E', text: '20π/9 meter' },
    ],
    correctAnswer: 'B', points: 5,
  },
  {
    number: 10, type: 'multiple_choice',
    questionText: 'Lampu sorot dipasang di titik A pada keliling lapangan. Sudut keliling ∠BAC = 40°. Besar sudut pusat ∠BOC yang menghadap busur BC adalah ….',
    options: [
      { key: 'A', text: '40°' }, { key: 'B', text: '60°' }, { key: 'C', text: '80°' },
      { key: 'D', text: '120°' }, { key: 'E', text: '160°' },
    ],
    correctAnswer: 'C', points: 5,
  },
  {
    number: 11, type: 'multiple_choice',
    questionText: 'Matriks penjualan hari Senin A = [[12,8],[10,6]] dan hari Selasa B = [[9,7],[11,5]]. Total penjualan selama dua hari adalah ….',
    options: [
      { key: 'A', text: '[[3,1],[1,1]]' }, { key: 'B', text: '[[20,14],[20,10]]' },
      { key: 'C', text: '[[21,15],[21,11]]' }, { key: 'D', text: '[[21,14],[22,11]]' },
      { key: 'E', text: '[[19,15],[21,12]]' },
    ],
    correctAnswer: 'C', points: 5,
  },
  {
    number: 12, type: 'multiple_choice',
    questionText: 'Stok awal P = [[50,40],[35,25]], stok akhir Q = [[20,15],[10,5]]. Jumlah barang yang terjual adalah ….',
    options: [
      { key: 'A', text: '[[30,25],[25,20]]' }, { key: 'B', text: '[[70,55],[45,30]]' },
      { key: 'C', text: '[[20,25],[25,20]]' }, { key: 'D', text: '[[30,20],[20,20]]' },
      { key: 'E', text: '[[25,20],[15,10]]' },
    ],
    correctAnswer: 'A', points: 5,
  },
  {
    number: 13, type: 'multiple_choice',
    questionText: 'Data awal R = [[15,10],[12,8]]. Seluruh perlengkapan diperbanyak 2 kali. Matriks jumlah perlengkapan baru adalah ….',
    options: [
      { key: 'A', text: '[[17,12],[14,10]]' }, { key: 'B', text: '[[30,20],[24,16]]' },
      { key: 'C', text: '[[45,30],[36,24]]' }, { key: 'D', text: '[[20,15],[16,10]]' },
      { key: 'E', text: '[[25,18],[20,14]]' },
    ],
    correctAnswer: 'B', points: 5,
  },
  {
    number: 14, type: 'multiple_choice',
    questionText: 'Matriks data pegawai [[18,12],[20,15]]. Bentuk transpos matriks tersebut adalah ….',
    options: [
      { key: 'A', text: '[[18,12],[20,15]]' }, { key: 'B', text: '[[20,18],[15,12]]' },
      { key: 'C', text: '[[12,15],[18,20]]' }, { key: 'D', text: '[[18,20],[12,15]]' },
      { key: 'E', text: '[[18,15],[12,20]]' },
    ],
    correctAnswer: 'D', points: 5,
  },
  {
    number: 15, type: 'multiple_choice',
    questionText: 'Matriks A = [[3,2],[1,4]]. Invers matriks A adalah ….',
    options: [
      { key: 'A', text: '[[1/2,-1/4],[-1/8,3/8]]' },
      { key: 'B', text: '[[2/5,-1/5],[-1/10,3/10]]' },
      { key: 'C', text: '[[2/5,1/5],[1/10,3/10]]' },
      { key: 'D', text: '[[3/5,-3/5],[-1/5,4/5]]' },
      { key: 'E', text: '[[1/4,-1/2],[-1/2,3/4]]' },
    ],
    correctAnswer: 'B', points: 5,
  },
  {
    number: 16, type: 'multiple_choice',
    questionText: 'P = [[2,1,3],[4,2,1],[3,5,2]]. Berdasarkan nilai determinan matriks, kategori produksi yang sesuai adalah ….',
    options: [
      { key: 'A', text: 'Kerusakan parah dan tidak ada produksi (det < -15)' },
      { key: 'B', text: 'Kerusakan masih dapat diperbaiki (-14 s.d. -1)' },
      { key: 'C', text: 'Mesin sedang tidak bekerja (det = 0)' },
      { key: 'D', text: 'Mesin berjalan normal belum optimal (0 s.d. 10)' },
      { key: 'E', text: 'Mesin berjalan normal dan seimbang (det > 11)' },
    ],
    correctAnswer: 'E', points: 5,
  },
  {
    number: 17, type: 'multiple_choice',
    questionText: 'Diketahui P = [[2,1,3],[4,2,1],[3,5,2]]. Nilai kofaktor K₁₂ dari matriks P adalah ….',
    options: [
      { key: 'A', text: '-5' }, { key: 'B', text: '5' }, { key: 'C', text: '-14' },
      { key: 'D', text: '14' }, { key: 'E', text: '0' },
    ],
    correctAnswer: 'A', points: 5,
  },
  {
    number: 18, type: 'multiple_choice',
    questionText: 'Segitiga dengan A(0,1), B(1,4), C(3,2) ditranslasikan sejauh (3,1). Gambar hasil translasi yang benar adalah ….',
    options: [
      { key: 'A', text: "A'(3,1), B'(4,4), C'(6,2)" },
      { key: 'B', text: "A'(3,2), B'(4,5), C'(6,3)" },
      { key: 'C', text: "A'(-2,0), B'(-2,3), C'(0,1)" },
      { key: 'D', text: "A'(0,0), B'(1,3), C'(3,1)" },
      { key: 'E', text: "A'(2,-2), B'(3,1), C'(5,-1)" },
    ],
    correctAnswer: 'B', points: 5,
  },
  // === MULTIPLE RESPONSE (19–20) ===
  {
    number: 19, type: 'multiple_response',
    questionText: 'Diketahui persamaan linear 2x − y + 4 = 0. Manakah pernyataan yang benar mengenai hasil translasi berikut?\n(i) T=(2,3) → bayangan 2x − y + 3 = 0\n(ii) T=(-2,3) → bayangan 2x − y + 11 = 0\n(iii) T=(2,-3) → bayangan 2x − y − 3 = 0\n(iv) T=(-2,-3) → bayangan 2x − y + 3 = 0',
    options: [
      { key: 'A', text: 'Jika hanya (i), (ii), dan (iii) yang benar' },
      { key: 'B', text: 'Jika hanya (i) dan (iii) yang benar' },
      { key: 'C', text: 'Jika hanya (ii) dan (iv) yang benar' },
      { key: 'D', text: 'Jika hanya (iv) yang benar' },
      { key: 'E', text: 'Jika semuanya benar' },
    ],
    correctAnswer: 'C', points: 5,
    // Catatan: kunci di PDF tidak tertera untuk no.19, gunakan C berdasarkan analisis
  },
  {
    number: 20, type: 'multiple_response',
    questionText: 'Diketahui P = [[2,1,3],[4,2,1],[3,5,2]]. Pernyataan matriks minor yang benar adalah ….\n(i) M₁₁ = [[2,1],[5,2]]\n(ii) M₁₂ = [[4,1],[3,2]]\n(iii) M₂₃ = [[2,1],[3,5]]\n(iv) M₂₂ = [[2,1],[3,2]]',
    options: [
      { key: 'A', text: 'Jika hanya (i), (ii), dan (iii) yang benar' },
      { key: 'B', text: 'Jika hanya (i) dan (iii) yang benar' },
      { key: 'C', text: 'Jika hanya (ii) dan (iv) yang benar' },
      { key: 'D', text: 'Jika hanya (iv) yang benar' },
      { key: 'E', text: 'Jika semuanya benar' },
    ],
    correctAnswer: 'A', points: 5,
  },
  // === ESSAY (21–25) ===
  {
    number: 21, type: 'essay',
    questionText: 'Sebuah sepeda memiliki dua gear dengan r = 10 cm, R = 15 cm, dan jarak antar pusat gear d = 40 cm. Hitunglah panjang rantai keseluruhan yang menghubungkan kedua gear tersebut!',
    correctAnswer: null, points: 10,
  },
  {
    number: 22, type: 'essay',
    questionText: 'Dari 200 siswa: 30% WhatsApp, 25% kunjungan guru, 18% Zoom, 15% Google Meet, 12% Moodle, sisanya media lain. Gambarlah sketsa diagram lingkaran dan tentukan sudut pusat masing-masing kategori!',
    correctAnswer: null, points: 10,
  },
  {
    number: 23, type: 'essay',
    questionText: 'Pesanan nasi goreng 25 porsi dengan detail banyak. Bantulah pedagang agar dapat memenuhi pesanan tersebut menggunakan konsep matriks! (Uraikan cara membuat matriks dari data pesanan tersebut)',
    correctAnswer: null, points: 10,
  },
  {
    number: 24, type: 'essay',
    questionText: 'Jalur sepeda lama digambarkan pada peta koordinat. Karena pelebaran jalan, jalur dipindahkan 3 satuan ke kanan dan 4 satuan ke atas. Tentukan persamaan garis jalur sepeda yang baru!',
    correctAnswer: null, points: 10,
  },
  {
    number: 25, type: 'essay',
    questionText: 'Jessica berangkat dari Kota Tegal ke Desa Bojong. Sepanjang 2 km dari Tegal menanjak 12°, jalan Slawi ke Bojong menanjak 3 km dengan sudut 12°. (sin 12° = 0,20; cos 12° = 0,97; tan 12° = 0,21). Berapakah ketinggian rumah nenek Jessica dari Kota Tegal?',
    correctAnswer: null, points: 10,
  },
];
```

---

### FASE 9 — Desain UI/UX

#### Task 9.1 — Design System (TailwindCSS)

Tambahkan di `tailwind.config.ts`:

```typescript
theme: {
  extend: {
    colors: {
      brand: {
        50: '#eff6ff',
        100: '#dbeafe',
        500: '#3b82f6',
        600: '#2563eb',
        700: '#1d4ed8',
        900: '#1e3a8a',
      },
      exam: {
        answered: '#22c55e',    // hijau untuk soal yang sudah dijawab
        current: '#3b82f6',     // biru untuk soal aktif
        unanswered: '#e5e7eb',  // abu-abu untuk belum dijawab
        warning: '#f59e0b',     // kuning untuk peringatan
        danger: '#ef4444',      // merah untuk terminasi
      },
    },
    fontFamily: {
      sans: ['Plus Jakarta Sans', 'sans-serif'],
      display: ['Sora', 'sans-serif'],
    },
    animation: {
      'shake': 'shake 0.5s cubic-bezier(.36,.07,.19,.97) both',
      'pulse-red': 'pulse-red 1s ease-in-out infinite',
    },
  },
}
```

Google Fonts di `app/layout.tsx`:
```typescript
import { Plus_Jakarta_Sans, Sora } from 'next/font/google';
```

#### Task 9.2 — Palet Warna & Tema

- **Primary:** Biru indigo (#3B4CC0) — warna institusional, profesional
- **Accent:** Kuning emas (#F5A623) — menonjol, highlight aksi penting
- **Background form:** Putih bersih dengan subtle paper texture
- **Header:** Gradient biru tua (#1a237e → #283593)
- **Card soal:** White dengan shadow ringan, border-radius 16px
- **Answered state:** Green checkmark badge di navigator

#### Task 9.3 — Komponen Visual Kunci

**Timer Bar:**
- Lingkaran progress (circular progress) di pojok kanan atas
- Berubah warna: hijau → kuning (< 10 menit) → merah berkedip (< 5 menit)
- Bunyi notifikasi (Web Audio API) saat 10 menit dan 5 menit tersisa (opsional)

**Question Navigator:**
- Grid tombol nomor soal di bagian bawah layar (sticky footer)
- Visual berbeda untuk: answered (biru solid), unanswered (outline abu), current (biru dengan ring)

**Progress Bar:**
- Thin bar di bawah header: "X dari 25 soal terjawab"
- Warna gradient biru ke hijau seiring progres

**Violation Warning Modal:**
- Overlay merah gelap semi-transparan
- Ikon ⚠️ besar beranimasi
- Teks peringatan tebal dan jelas
- Single button "Saya Mengerti" — full-width, warna merah

---

### FASE 10 — Keamanan & Performa

#### Task 10.1 — Keamanan

- [ ] Semua API route validasi JWT
- [ ] Input sanitization dengan Zod
- [ ] Rate limiting pada `/api/auth/login` (max 5x/menit per IP)
- [ ] Soal tidak dikirim ke client sebelum ujian dimulai
- [ ] Kunci jawaban tidak pernah ada di response API siswa
- [ ] HTTPS wajib di production (set cookie Secure: true)
- [ ] Headers: `X-Content-Type-Options`, `X-Frame-Options`, `Strict-Transport-Security`

#### Task 10.2 — Performa

- [ ] Lazy load gambar soal
- [ ] Debounce auto-save 1.5 detik
- [ ] Optimistic UI update saat memilih jawaban (tidak tunggu server)
- [ ] Pagination di tabel admin
- [ ] Index MongoDB: `{ studentId, sessionId }` pada Answer, `{ timestamp }` pada Violation

---

### FASE 11 — Testing & Deploy

#### Task 11.1 — Testing Checklist

**Fungsional:**
- [ ] Login siswa dengan NISN valid dan invalid
- [ ] Login admin dengan email valid dan invalid
- [ ] Soal tampil dengan benar per tipe
- [ ] Auto-save berjalan saat menjawab
- [ ] Timer countdown akurat dan auto-submit saat habis
- [ ] Anti-cheat: peringatan 1 muncul saat pertama keluar tab
- [ ] Anti-cheat: peringatan 2 muncul saat kedua keluar tab
- [ ] Anti-cheat: terminasi terjadi setelah >3 pelanggaran
- [ ] Score dihitung benar setelah submit
- [ ] Halaman hasil tampil dengan benar
- [ ] Admin bisa lihat semua hasil dan nilai essay

**Edge cases:**
- [ ] Siswa refresh halaman saat ujian → data tidak hilang (resume dari auto-save)
- [ ] Siswa mencoba akses `/exam` setelah submit → redirect ke `/result`
- [ ] Dua tab browser → keduanya terdeteksi sebagai pelanggaran
- [ ] Internet terputus → auto-save retry mechanism

#### Task 11.2 — Deployment

**Vercel (recommended):**
```bash
vercel --prod
# Set env vars via Vercel dashboard
```

**Environment production:**
- MongoDB Atlas (free tier cukup untuk testing)
- Vercel Edge Network untuk CDN
- Pastikan `NEXTAUTH_URL` atau `NEXT_PUBLIC_APP_URL` diset dengan benar

---

## 🗓️ Timeline Estimasi

| Fase | Deskripsi | Estimasi |
|------|-----------|----------|
| 1 | Setup & Fondasi | 2 jam |
| 2 | Models Database | 1.5 jam |
| 3 | Autentikasi | 2 jam |
| 4 | Anti-Cheat | 3 jam |
| 5 | Fitur Ujian Siswa | 5 jam |
| 6 | Dashboard Admin | 4 jam |
| 7 | Penilaian | 1 jam |
| 8 | Seed Data | 1 jam |
| 9 | Desain UI/UX | 3 jam |
| 10 | Keamanan & Performa | 2 jam |
| 11 | Testing & Deploy | 2 jam |
| **Total** | | **~27 jam** |

---

## 🔑 Catatan Penting untuk Developer

1. **Jangan pernah** kirim `correctAnswer` di response API ke siswa.
2. **Selalu** validasi session aktif sebelum memproses jawaban.
3. **Anti-cheat hook** harus di-mount di level `layout.tsx` ujian, bukan di komponen soal.
4. **Essay tidak dinilai otomatis** — admin harus input nilai manual via dashboard.
5. Kolom kunci jawaban no. 19 di PDF **kosong** — gunakan jawaban C sebagai default, bisa diubah admin.
6. Password admin default: `Admin@123` — **wajib diganti** setelah deployment pertama.
7. Untuk produksi: backup MongoDB setiap hari, terutama saat periode ujian aktif.
8. Pertimbangkan menambahkan fitur **rekap absensi** otomatis dari data submission.

---

*AGENTS.md ini dibuat untuk Platform Asesmen Digital SMKN 31 Jakarta — Tahun Ajaran 2025/2026*  
*Versi: 1.0.0 | Terakhir diperbarui: Mei 2026*