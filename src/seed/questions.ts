import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

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
    correctAnswer: { '0': 'E', '1': 'A', '2': 'J', '3': 'B', '4': 'K', '5': 'G', '6': 'H', '7': 'C' },
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

async function seed() {
  if (!process.env.MONGODB_URI) {
    console.error('MONGODB_URI is not defined');
    return;
  }
  
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    await Question.deleteMany({});
    console.log('Cleared existing questions');
    
    await Question.insertMany(questionsData);
    console.log('Successfully seeded questions!');
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
}

seed();
