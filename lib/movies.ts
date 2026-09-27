export type Movie = {
  id: string
  title: string
  year: number
  rating: number
  duration: string
  ageRating: string
  genres: string[]
  poster: string
  backdrop: string
  synopsis: string
  director: string
  cast: string[]
  quality: "4K" | "HD" | "FHD"
  featured?: boolean
}

export const movies: Movie[] = [
  {
    id: "nebula-protocol",
    title: "Nebula Protocol",
    year: 2025,
    rating: 8.7,
    duration: "2h 18m",
    ageRating: "16+",
    genres: ["Fantastika", "Sarguzasht"],
    poster: "/images/poster-1.png",
    backdrop: "/images/hero-1.png",
    synopsis:
      "Yer bilan aloqa uzilgach, yolg'iz astronavt noma'lum galaktikaga sayohat qiladi va insoniyat taqdirini hal qiluvchi sirni ochadi.",
    director: "Aziz Karimov",
    cast: ["Jasur Rahmonov", "Malika Tosheva", "Bobur Yusupov"],
    quality: "4K",
    featured: true,
  },
  {
    id: "city-of-fog",
    title: "Tuman Shahri",
    year: 2024,
    rating: 8.1,
    duration: "1h 54m",
    ageRating: "18+",
    genres: ["Triller", "Detektiv"],
    poster: "/images/poster-2.png",
    backdrop: "/images/hero-2.png",
    synopsis:
      "Tunggi shaharning qorong'u ko'chalarida bir detektiv o'z o'tmishi bilan yuzma-yuz keladigan jinoyatni tergov qiladi.",
    director: "Kamola Ergasheva",
    cast: ["Sardor Nazarov", "Feruza Aliyeva"],
    quality: "FHD",
    featured: true,
  },
  {
    id: "last-ember",
    title: "So'nggi Uchqun",
    year: 2025,
    rating: 7.9,
    duration: "2h 06m",
    ageRating: "16+",
    genres: ["Jangari", "Drama"],
    poster: "/images/poster-3.png",
    backdrop: "/images/hero-3.png",
    synopsis:
      "Portlashlar orasida qahramon o'z oilasini qutqarish uchun vaqtga qarshi kurashadi.",
    director: "Rustam Qodirov",
    cast: ["Alisher Fayzullayev", "Nigora Karimova"],
    quality: "4K",
    featured: true,
  },
  {
    id: "silent-tear",
    title: "Sokin Ko'zyosh",
    year: 2023,
    rating: 8.4,
    duration: "1h 48m",
    ageRating: "12+",
    genres: ["Drama", "Melodrama"],
    poster: "/images/poster-4.png",
    backdrop: "/images/hero-2.png",
    synopsis: "Bir ayolning yo'qotish va umid haqidagi ta'sirli hikoyasi.",
    director: "Dilnoza Umarova",
    cast: ["Sevara Nazarxon", "Otabek Mutalov"],
    quality: "HD",
  },
  {
    id: "neon-code",
    title: "Neon Kod",
    year: 2025,
    rating: 8.0,
    duration: "2h 01m",
    ageRating: "16+",
    genres: ["Fantastika", "Triller"],
    poster: "/images/poster-5.png",
    backdrop: "/images/hero-1.png",
    synopsis:
      "Kelajak megapolisida bir haker tizimni ag'darib tashlaydigan haqiqatni topadi.",
    director: "Timur Sodiqov",
    cast: ["Javohir Zokirov", "Kamila Yusupova"],
    quality: "4K",
  },
  {
    id: "desert-moon",
    title: "Sahro Oyi",
    year: 2024,
    rating: 7.6,
    duration: "1h 59m",
    ageRating: "12+",
    genres: ["Sarguzasht", "Drama"],
    poster: "/images/poster-6.png",
    backdrop: "/images/hero-3.png",
    synopsis: "Cheksiz sahroda yolg'iz sayohatchi o'zligini qayta kashf etadi.",
    director: "Shahzod Ismoilov",
    cast: ["Doniyor Rasulov", "Zilola Bahodirova"],
    quality: "FHD",
  },
  {
    id: "deep-ruins",
    title: "Chuqurlik Sirlari",
    year: 2025,
    rating: 7.8,
    duration: "2h 12m",
    ageRating: "12+",
    genres: ["Sarguzasht", "Sir"],
    poster: "/images/poster-7.png",
    backdrop: "/images/hero-1.png",
    synopsis: "Okean tubidagi qadimiy shahar insoniyat tarixini o'zgartiradi.",
    director: "Laziz Tursunov",
    cast: ["Bekzod Xolmatov", "Dilfuza Sattorova"],
    quality: "4K",
  },
  {
    id: "cold-front",
    title: "Sovuq Jabha",
    year: 2023,
    rating: 8.2,
    duration: "2h 24m",
    ageRating: "18+",
    genres: ["Harbiy", "Drama"],
    poster: "/images/poster-8.png",
    backdrop: "/images/hero-2.png",
    synopsis: "Urush maydonida do'stlik va sadoqat sinovdan o'tadi.",
    director: "Ulug'bek Nazarov",
    cast: ["Sanjar Komilov", "Aziza Rustamova"],
    quality: "FHD",
  },
  {
    id: "blue-rain",
    title: "Ko'k Yomg'ir",
    year: 2024,
    rating: 8.5,
    duration: "1h 52m",
    ageRating: "12+",
    genres: ["Melodrama", "Romantika"],
    poster: "/images/poster-9.png",
    backdrop: "/images/hero-3.png",
    synopsis: "Yomg'irli shaharda ikki qalbning kutilmagan uchrashuvi.",
    director: "Nilufar Hakimova",
    cast: ["Jahongir Poziljonov", "Madina Alimova"],
    quality: "HD",
  },
  {
    id: "storm-blade",
    title: "Bo'ron Qilichi",
    year: 2025,
    rating: 8.3,
    duration: "2h 29m",
    ageRating: "16+",
    genres: ["Fantastika", "Jangari"],
    poster: "/images/poster-10.png",
    backdrop: "/images/hero-1.png",
    synopsis: "Afsonaviy qilich egasi olamni zulmatdan qutqarishga otlanadi.",
    director: "Farrux Ibragimov",
    cast: ["Otabek Yodgorov", "Sevinch Muminova"],
    quality: "4K",
    featured: true,
  },
  {
    id: "star-bot",
    title: "Yulduzcha Robot",
    year: 2024,
    rating: 8.0,
    duration: "1h 36m",
    ageRating: "0+",
    genres: ["Multfilm", "Oila"],
    poster: "/images/poster-11.png",
    backdrop: "/images/hero-3.png",
    synopsis: "Kichkina jasur robot galaktika bo'ylab do'st izlab sayohat qiladi.",
    director: "Studio OneMedia",
    cast: ["Ovoz: Bahrom Nazarov"],
    quality: "FHD",
  },
  {
    id: "night-heroes",
    title: "Tungi Qahramonlar",
    year: 2025,
    rating: 7.7,
    duration: "1h 44m",
    ageRating: "6+",
    genres: ["Multfilm", "Sarguzasht"],
    poster: "/images/poster-12.png",
    backdrop: "/images/hero-2.png",
    synopsis: "Yosh qahramonlar yulduzli tun ostida katta sarguzashtga boshlanadi.",
    director: "Studio OneMedia",
    cast: ["Ovoz: Kamola Yusupova"],
    quality: "FHD",
  },
]

export const genres = [
  "Barchasi",
  "Fantastika",
  "Jangari",
  "Drama",
  "Triller",
  "Melodrama",
  "Sarguzasht",
  "Multfilm",
  "Detektiv",
]

export function getMovie(id: string) {
  return movies.find((m) => m.id === id)
}

export function getFeatured() {
  return movies.filter((m) => m.featured)
}

export function byGenre(genre: string) {
  if (genre === "Barchasi") return movies
  return movies.filter((m) => m.genres.includes(genre))
}

export const rows: { title: string; ids: string[] }[] = [
  {
    title: "Siz uchun tavsiya",
    ids: ["nebula-protocol", "blue-rain", "neon-code", "storm-blade", "silent-tear", "deep-ruins"],
  },
  {
    title: "Trend bo'lganlar",
    ids: ["city-of-fog", "last-ember", "cold-front", "desert-moon", "nebula-protocol", "storm-blade"],
  },
  {
    title: "Yangi kinolar",
    ids: ["nebula-protocol", "last-ember", "neon-code", "deep-ruins", "storm-blade", "blue-rain"],
  },
  {
    title: "Bolalar uchun",
    ids: ["star-bot", "night-heroes", "desert-moon", "blue-rain"],
  },
]
