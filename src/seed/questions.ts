import mongoose from 'mongoose';
import { loadEnvConfig } from '@next/env';
loadEnvConfig(process.cwd());

// We define minimal schema here just for seeding if we run this independently
const QuestionSchema = new mongoose.Schema({
  number: Number,
  type: String,
  subject: String,
  gradeLevel: String,
  questionText: String,
  imageUrl: String,
  options: [{ key: String, text: String }],
  matchingPairs: [{ statement: String, answer: String }],
  matchingOptions: [String],
  correctAnswer: mongoose.Schema.Types.Mixed,
  points: Number,
  explanation: String,
  isActive: Boolean,
});

const Question = mongoose.models.Question || mongoose.model('Question', QuestionSchema);

const questionsData = [
  // === MATCHING (1–8) ===
  {
    number: 1, type: 'matching',
    questionText: 'Pasangkan pernyataan berikut dengan istilah yang tepat pada unsur-unsur lingkaran!',
    matchingPairs: [
      { statement: 'Garis yang menghubungkan titik pusat dengan titik pada lingkaran.', answer: 'E' },
      { statement: 'Panjang garis lurus yang melalui titik pusat dan menghubungkan dua titik pada lingkaran.', answer: 'A' },
      { statement: 'Daerah yang dibatasi oleh dua jari-jari dan sebuah busur.', answer: 'J' },
      { statement: 'Bagian lingkaran yang berupa garis lengkung.', answer: 'B' },
      { statement: 'Garis yang memotong lingkaran di dua titik.', answer: 'F' }, // Using key 'F' (Tali Busur) to match kj.md key '5. F. Tali Busur'
      { statement: 'Garis yang hanya menyinggung lingkaran di satu titik.', answer: 'G' },
      { statement: 'Sudut yang titik sudutnya berada di pusat lingkaran.', answer: 'H' },
      { statement: 'Jarak pusat ke tali busur atau garis singgung tertentu.', answer: 'C' },
    ],
    matchingOptions: [
      'A. Diameter', 'B. Busur', 'C. Apotema', 'D. Tembereng', 'E. Jari-jari',
      'F. Tali busur', 'G. Garis singgung', 'H. Sudut pusat', 'I. Sudut keliling',
      'J. Juring', 'K. Sekan', 'L. Titik singgung', 'M. Keliling lingkaran', 'N. Luas lingkaran',
    ],
    correctAnswer: { '0': 'E', '1': 'A', '2': 'J', '3': 'B', '4': 'F', '5': 'G', '6': 'H', '7': 'C' },
    points: 16, // 8 pairs × 2 points each
    subject: 'Matematika',
    gradeLevel: 'XI',
    isActive: true
  },
  // === MULTIPLE CHOICE (9–18) ===
  {
    number: 9, type: 'multiple_choice',
    questionText: 'Rina dan adiknya sedang menaiki bianglala di sebuah taman hiburan. Bianglala memiliki pusat O dan diameter 20 meter. saat berada di titik A, Rina melihat adiknya yang berada di titik B. Posisi A dan B membentuk sudut pusat 120o seperti pada gambar!\n\nPanjang busur AB yang dilalui Rina untuk berpindah dari titik A ke titik B melalui lintasan paling pendek adalah ….',
    imageUrl: '/image/pg/9.png',
    options: [
      { key: 'A', text: '10π/3 meter' },
      { key: 'B', text: '20π/3 meter' },
      { key: 'C', text: '30π/3 meter' },
      { key: 'D', text: '40π/3 meter' },
      { key: 'E', text: '20π/9 meter' },
    ],
    correctAnswer: 'B', points: 5,
    subject: 'Matematika',
    gradeLevel: 'XI',
    isActive: true
  },
  {
    number: 10, type: 'multiple_choice',
    questionText: 'Sebuah lampu sorot dipasang di tepi lapangan berbentuk lingkaran seperti pada gambar. Lampu dipasang di titik A pada keliling lapangan dan diarahkan ke dua tiang bendera di titik B and C yang berada di sisi berlawanan. Sudut keliling ∠BAC yang terbentuk adalah 40o.\n\nBesar sudut pusat ∠BOC yang menghadap busur BC adalah ….',
    imageUrl: '/image/pg/10.png',
    options: [
      { key: 'A', text: '40°' },
      { key: 'B', text: '60°' },
      { key: 'C', text: '80°' },
      { key: 'D', text: '120°' },
      { key: 'E', text: '160°' },
    ],
    correctAnswer: 'C', points: 5,
    subject: 'Matematika',
    gradeLevel: 'XI',
    isActive: true
  },
  {
    number: 11, type: 'multiple_choice',
    questionText: 'Sebuah toko elektronik mencatat penjualan televisi dan kipas angin selama dua hari. Pencatatan penjualan dibuat dalam bentuk matriks sebagai berikut. Baris pertama menunjukkan jumlah barang yang terjual di Cabang Utama, sedangkan baris kedua menunjukkan Cabang Timur. Kolom pertama menyatakan televisi dan kolom kedua menyatakan kipas angin. Total penjualan selama dua hari adalah ....',
    imageUrl: '/image/pg/11.png',
    options: [
      { key: 'A', text: '/image/pg/jawaban11/a.png' },
      { key: 'B', text: '/image/pg/jawaban11/b.png' },
      { key: 'C', text: '/image/pg/jawaban11/c.png' },
      { key: 'D', text: '/image/pg/jawaban11/d.png' },
      { key: 'E', text: '/image/pg/jawaban11/e.png' },
    ],
    correctAnswer: 'C', points: 5,
    subject: 'Matematika',
    gradeLevel: 'XI',
    isActive: true
  },
  {
    number: 12, type: 'multiple_choice',
    questionText: 'Sebuah gudang mencatat stok awal dan stok akhir bahan makanan. Kolom pertama menunjukkan beras dan kolom kedua menunjukkan gula. Jumlah barang yang terjual adalah ....',
    imageUrl: '/image/pg/12.png',
    options: [
      { key: 'A', text: '/image/pg/jawaban12/a.png' },
      { key: 'B', text: '/image/pg/jawaban12/b.png' },
      { key: 'C', text: '/image/pg/jawaban12/c.png' },
      { key: 'D', text: '/image/pg/jawaban12/d.png' },
      { key: 'E', text: '/image/pg/jawaban12/e.png' },
    ],
    correctAnswer: 'A', points: 5,
    subject: 'Matematika',
    gradeLevel: 'XI',
    isActive: true
  },
  {
    number: 13, type: 'multiple_choice',
    questionText: 'Sebuah sekolah akan menggandakan jumlah kursi dan meja untuk ruang praktik komputer. Kolom pertama menunjukkan kursi dan kolom kedua menunjukkan meja. Karena jumlah siswa meningkat dua kali lipat, seluruh perlengkapan juga akan diperbanyak 2 kali. Matriks jumlah perlengkapan baru adalah ....',
    imageUrl: '/image/pg/13.png',
    options: [
      { key: 'A', text: '/image/pg/jawaban13/a.png' },
      { key: 'B', text: '/image/pg/jawaban13/b.png' },
      { key: 'C', text: '/image/pg/jawaban13/c.png' },
      { key: 'D', text: '/image/pg/jawaban13/d.png' },
      { key: 'E', text: '/image/pg/jawaban13/e.png' },
    ],
    correctAnswer: 'B', points: 5,
    subject: 'Matematika',
    gradeLevel: 'XI',
    isActive: true
  },
  {
    number: 14, type: 'multiple_choice',
    questionText: 'Sebuah perusahaan mencatat jumlah pegawai laki-laki dan perempuan pada dua divisi. Untuk membuat laporan baru, data harus ditukar antara baris dan kolom. Bentuk transpos matriks data di atas adalah ….',
    imageUrl: '/image/pg/14.png',
    options: [
      { key: 'A', text: '/image/pg/jawaban14/a.png' },
      { key: 'B', text: '/image/pg/jawaban14/b.png' },
      { key: 'C', text: '/image/pg/jawaban14/c.png' },
      { key: 'D', text: '/image/pg/jawaban14/d.png' },
      { key: 'E', text: '/image/pg/jawaban14/e.png' },
    ],
    correctAnswer: 'D', points: 5,
    subject: 'Matematika',
    gradeLevel: 'XI',
    isActive: true
  },
  {
    number: 15, type: 'multiple_choice',
    questionText: 'Sebuah bengkel otomotif menggunakan mesin digital untuk menghitung biaya servis dan penggantian oli kendaraan. Dalam satu hari, data transaksi dua jenis layanan dicatat dalam bentuk matriks berikut. Baris pertama menunjukkan servis motor, baris kedua menunjukkan servis mobil, kolom pertama menunjukkan biaya jasa, kolom kedua menunjukkan biaya suku cadang. Teknisi ingin menggunakan invers matriks untuk menganalisis kembali data biaya agar sistem komputer dapat menentukan estimasi pengeluaran pelanggan secara otomatis, maka matriks di atas menjadi ….',
    imageUrl: '/image/pg/15.png',
    options: [
      { key: 'A', text: '/image/pg/jawaban15/a.png' },
      { key: 'B', text: '/image/pg/jawaban15/b.png' },
      { key: 'C', text: '/image/pg/jawaban15/c.png' },
      { key: 'D', text: '/image/pg/jawaban15/d.png' },
      { key: 'E', text: '/image/pg/jawaban15/e.png' },
    ],
    correctAnswer: 'B', points: 5,
    subject: 'Matematika',
    gradeLevel: 'XI',
    isActive: true
  },
  {
    number: 16, type: 'multiple_choice',
    questionText: 'Sebuah perusahaan percetakan memiliki tiga mesin produksi yang digunakan untuk mencetak buku, poster, dan brosur. Dalam satu hari, kapasitas produksi masing-masing mesin dicatat sebagai berikut. Kolom pertama = jumlah buku yang dicetak, kolom kedua = jumlah poster, kolom ketiga = jumlah brosur. Manajer perusahaan menggunakan nilai determinan matriks untuk mengetahui apakah sistem produksi antar mesin berjalan seimbang atau tidak. Manakah kategori produksi yang sesuai dengan nilai determinan matriks P?',
    imageUrl: '/image/pg/16.png',
    options: [
      { key: 'A', text: '/image/pg/jawaban16/a.png' },
      { key: 'B', text: '/image/pg/jawaban16/b.png' },
      { key: 'C', text: '/image/pg/jawaban16/c.png' },
      { key: 'D', text: '/image/pg/jawaban16/d.png' },
      { key: 'E', text: '/image/pg/jawaban16/e.png' },
    ],
    correctAnswer: 'E', points: 5,
    subject: 'Matematika',
    gradeLevel: 'XI',
    isActive: true
  },
  {
    number: 17, type: 'multiple_choice',
    questionText: 'Diketahui matriks berikut. Nilai kofaktor K12 dari matriks P adalah ....',
    imageUrl: '/image/pg/17.png',
    options: [
      { key: 'A', text: '-5' },
      { key: 'B', text: '5' },
      { key: 'C', text: '-14' },
      { key: 'D', text: '14' },
      { key: 'E', text: '0' },
    ],
    correctAnswer: 'A', points: 5,
    subject: 'Matematika',
    gradeLevel: 'XI',
    isActive: true
  },
  {
    number: 18, type: 'multiple_choice',
    questionText: 'Segitiga berikut jika ditranslasikan sejauh (3,1) maka menjadi ....',
    imageUrl: '/image/pg/18.png',
    options: [
      { key: 'A', text: '/image/pg/jawaban18/a.png' },
      { key: 'B', text: '/image/pg/jawaban18/b.png' },
      { key: 'C', text: '/image/pg/jawaban18/c.png' },
      { key: 'D', text: '/image/pg/jawaban18/d.png' },
      { key: 'E', text: '/image/pg/jawaban18/e.png' },
    ],
    correctAnswer: 'B', points: 5,
    subject: 'Matematika',
    gradeLevel: 'XI',
    isActive: true
  },
  // === MULTIPLE RESPONSE (19–20) ===
  {
    number: 19, type: 'multiple_response',
    questionText: 'Diketahui persamaan linear 2x - y + 4 = 0. Manakah pernyataan yang benar mengenai hasil translasi berikut?\n\n(i)   Apabila ditranslasikan T = (2, 3) menghasilkan bayangan 2x - y + 3 = 0\n(ii)  Apabila ditranslasikan T = (-2, 3) menghasilkan bayangan 2x - y + 11 = 0\n(iii) Apabila ditranslasikan T = (2, -3) menghasilkan bayangan 2x - y - 3 = 0\n(iv)  Apabila ditranslasikan T = (-2, -3) menghasilkan bayangan 2x - y + 3 = 0',
    options: [
      { key: 'A', text: 'Jika hanya (i), (ii), dan (iii) yang benar' },
      { key: 'B', text: 'Jika hanya (i) dan (iii) yang benar' },
      { key: 'C', text: 'Jika hanya (ii) dan (iv) yang benar' },
      { key: 'D', text: 'Jika hanya (iv) yang benar' },
      { key: 'E', text: 'Jika semuanya benar' },
    ],
    correctAnswer: 'A', points: 5, // Calculated as A (statements i, ii, iii are correct)
    subject: 'Matematika',
    gradeLevel: 'XI',
    isActive: true
  },
  {
    number: 20, type: 'multiple_response',
    questionText: '/image/pg/p20.png Perhatikan pernyataan matriks minor dari matriks di atas.\n/image/pg/20.png Pernyataan yang benar adalah ....',
    imageUrl: '',
    options: [
      { key: 'A', text: 'Jika hanya (i), (ii), dan (iii) yang benar' },
      { key: 'B', text: 'Jika hanya (i) dan (iii) yang benar' },
      { key: 'C', text: 'Jika hanya (ii) dan (iv) yang benar' },
      { key: 'D', text: 'Jika hanya (iv) yang benar' },
      { key: 'E', text: 'Jika semuanya benar' },
    ],
    correctAnswer: 'A', points: 5,
    subject: 'Matematika',
    gradeLevel: 'XI',
    isActive: true
  },
  // === ESSAY (21–25) ===
  {
    number: 21, type: 'essay',
    questionText: 'Sebuah sepeda memiliki dua gear yang dihubungkan oleh sebuah rantai seperti pada gambar!\n\nHitunglah panjang rantai keseluruhan yang menghubungkan kedua gear tersebut!',
    imageUrl: '/image/essai/21.png',
    correctAnswer: null, points: 0, // Essay graded manually on paper
    subject: 'Matematika',
    gradeLevel: 'XI',
    isActive: true
  },
  {
    number: 22, type: 'essay',
    questionText: 'Selama pandemi Covid-19 melanda Indonesia pembelajaran matematika tidak dapat dilakukan secara tatap muka penuh beberapa alternatif pembelajaran dilakukan oleh guru matematika agar kalian tetap dapat belajar, diantaranya menggunakan aplikasi WhatsApp Group, Google meet, Moodle dan kunjungan guru ke rumah. Hasil survei yang dilakukan kepada 200 siswa menyatakan bahwa 30% siswa menyukai pembelajaran menggunakan WhatsApp Group, 25% siswa menyukai kunjungan guru ke rumah, 18% siswa menyukai pembelajaran menggunakan Zoom, 15% siswa menyukai pembelajaran menggunakan Google Meet, 12% siswa menyukai pembelajaran menggunakan model, dan sisanya siswa menyukai pembelajaran matematika menggunakan media lainnya.\n\nGambarlah sketsa diagram lingkaran dari data tersebut dan tentukan ukuran sudut pusat masing-masing kategori!',
    correctAnswer: null, points: 0, // Essay graded manually on paper
    subject: 'Matematika',
    gradeLevel: 'XI',
    isActive: true
  },
  {
    number: 23, type: 'essay',
    questionText: 'Viral pesanan nasi goreng di media sosial. Mengutip dari laman suara.com “Pesanan Nasi Goreng Terlalu Ribet, Warganet Ini Bantu Buatkan Tabel Excel\n\nSebuah tangkapan layar orang yang memesan nasi goreng jadi viral di jejaring sosial Twitter. Hal tersebut lantaran pesanannya yang bisa dibilang cukup ribet. Pesanan nasi goreng tersebut jumlahnya cukup banyak, mencapai 25 porsi. Namun catatan di tiap bungkusnya amat banyak sampai bisa membuat sakit kepala. Melihat pesanan yang super ribet ini, penjual pun hendak menolak pesanan tersebut. Si pedagang nasi goreng mungkin terlalu bingung membaca setiap detail yang diminta. Bantulah pedagang agar dapat memenuhi pesanan tersebut sesuai permintaan dengan menggunakan konsep matriks!',
    imageUrl: '/image/essai/23.png',
    correctAnswer: null, points: 0, // Essay graded manually on paper
    subject: 'Matematika',
    gradeLevel: 'XI',
    isActive: true
  },
  {
    number: 24, type: 'essay',
    questionText: 'Di sebuah kawasan wisata pegunungan, pemerintah desa membuat jalur khusus sepeda agar wisatawan lebih aman dan nyaman. Jalur sepeda lama berada di tepi jalan utama dan digambarkan pada peta koordinat sebagai garis sebagai berikut!\n\nKarena pelebaran jalan, seluruh jalur sepeda dipindahkan sejauh 3 satuan ke kanan dan 4 satuan ke atas tanpa mengubah bentuk maupun kemiringannya. Petugas pemetaan harus menentukan persamaan garis jalur sepeda yang baru agar dapat diperbarui pada aplikasi navigasi wisata.',
    imageUrl: '/image/essai/24.png',
    correctAnswer: null, points: 0, // Essay graded manually on paper
    subject: 'Matematika',
    gradeLevel: 'XI',
    isActive: true
  },
  {
    number: 25, type: 'essay',
    questionText: '',
    imageUrl: '/image/essai/25.png?v=2',
    correctAnswer: null, points: 0, // Essay graded manually on paper
    subject: 'Matematika',
    gradeLevel: 'XI',
    isActive: true
  },
];

async function seed() {
  if (!process.env.MONGODB_URI) {
    console.error('MONGODB_URI is not defined');
    return;
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // 1. Clear questions
    await Question.deleteMany({});
    console.log('Cleared existing questions');

    // 2. Insert questions
    const insertedQuestions = await Question.insertMany(questionsData);
    console.log('Successfully seeded questions!');

    const questionIds = insertedQuestions.map(q => q._id);

    // 3. Setup ExamSession model schema
    const ExamSession = mongoose.models.ExamSession || mongoose.model('ExamSession', new mongoose.Schema({
      name: String,
      subject: String,
      duration: Number,
      questionIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }],
      isActive: Boolean,
      allowedClasses: [String],
      createdAt: Date
    }));

    // 4. Reset exam sessions
    await ExamSession.deleteMany({});
    console.log('Cleared existing exam sessions');

    // 5. Create default active session containing the seeded questions
    const defaultSession = await ExamSession.create({
      name: 'AAS Genap Matematika XI - SMKN 31 Jakarta',
      subject: 'Matematika',
      duration: 90,
      questionIds: questionIds,
      isActive: true,
      allowedClasses: [
        'XI Akuntansi', 'XI Animasi', 'XI Bisnis Ritel', 'XI DKV',
        'XI Layanan Perbankan', 'XI Manajemen Perkantoran',
      ],
      createdAt: new Date()
    });
    console.log('Created active Exam Session:', defaultSession.name, `(ID: ${defaultSession._id})`);

    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
}

seed();
