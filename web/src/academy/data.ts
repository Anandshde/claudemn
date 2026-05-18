/** Curriculum content — mirrors the hardcoded course catalog from the source design. */

export type AcademyCategory = "personal" | "developer" | "work";

export type AcademyLesson = {
  id: string;
  title: string;
  minutes: number;
  summary: string;
};

export type AcademyTask = {
  id: string;
  title: string;
  xp: number;
  description: string;
};

export type AcademyCourse = {
  id: string;
  title: string;
  subtitle: string;
  category: AcademyCategory;
  difficulty: string;
  duration: string;
  color: string;
  lessons: AcademyLesson[];
  tasks: AcademyTask[];
};

export const COURSES: AcademyCourse[] = [
  {
    id: "claude-101",
    title: "Claude 101: Анхан шатны хэрэглээ",
    subtitle: "Claude-тэй танилцаж, эхний харилцан яриагаа эхлүүлэе",
    category: "personal",
    difficulty: "Анхан шат",
    duration: "45 мин",
    color: "#C8553D",
    lessons: [
      {
        id: "l1",
        title: "Claude гэж юу вэ?",
        minutes: 8,
        summary:
          "Claude нь хүний хэлийг ойлгож, бичиж, бодож чаддаг хиймэл оюун ухаан. Энэ хичээлээр Claude-ын суурь чадварууд болон бусад AI-аас юугаараа ялгардгийг үзнэ.",
      },
      {
        id: "l2",
        title: "Анхны харилцан яриа",
        minutes: 10,
        summary:
          "Үр дүнтэй яриа эхлэхийн тулд юу хэлэх вэ? Тодорхой контекст, зорилгоо тавьж сурах.",
      },
      {
        id: "l3",
        title: "Үр дүнтэй асуулт асуух арга",
        minutes: 12,
        summary:
          "Сайн асуулт нь сайн хариултын үндэс. Тодорхой, контексттэй, зорилготой асуулт зохиох арга.",
      },
      {
        id: "l4",
        title: "Контекст ба санах ой",
        minutes: 8,
        summary:
          "Claude нэг яриан дотор юу санадаг, юу мартдагийг ойлгож, дагуулдаг файл, projects-ыг ашиглах.",
      },
    ],
    tasks: [
      {
        id: "t1",
        title: "Өөрийн ажилд туслах prompt бичих",
        xp: 50,
        description: "Өөрийн өдөр тутмын ажилд хэрэг болох 3 prompt бичиж туршаарай.",
      },
      {
        id: "t2",
        title: "3 өөр сэдвээр Claude-тэй ярилц",
        xp: 50,
        description: "Бичиг, код, асуудал шийдвэрлэх — 3 өөр төрлийн ажилд Claude-ыг туршаарай.",
      },
    ],
  },
  {
    id: "ai-fluency",
    title: "AI Fluency: Хариуцлагатай хэрэглээ",
    subtitle: "AI-тай ухаалаг, ёс зүйтэй хамтран ажиллах суурь",
    category: "personal",
    difficulty: "Анхан шат",
    duration: "50 мин",
    color: "#7C9885",
    lessons: [
      {
        id: "l1",
        title: "AI-н чадварлаг хэрэглэгч болох",
        minutes: 10,
        summary:
          "AI-г зүгээр л хэрэглэгч биш, харин хамтрагч болгож харах сэтгэлгээ.",
      },
      {
        id: "l2",
        title: "Хязгаарлалт, эрсдлийг ойлгох",
        minutes: 12,
        summary:
          "Hallucination, bias, цаг хугацааны хязгаарлалт — AI юунд эргэлзэхийг мэдэх.",
      },
      {
        id: "l3",
        title: "Үнэнийг шалгах арга",
        minutes: 10,
        summary:
          "AI-н хариултыг хэзээ, яаж шалгах вэ? Эх сурвалж, нотолгоо хайх дадал.",
      },
      {
        id: "l4",
        title: "Ёс зүй ба хариуцлага",
        minutes: 8,
        summary:
          "Хэн юунд хариуцлага хүлээх вэ? AI-н үр дүнг өөрийн нэрээр гаргахын өмнө бодох.",
      },
    ],
    tasks: [
      {
        id: "t1",
        title: "AI хэрэглээний тэмдэглэл хөтлөх",
        xp: 50,
        description:
          "1 долоо хоног AI ашигласан тохиолдол бүрийг тэмдэглээрэй: ямар ажил, үр дүн ямар байсан, юу шалгасан.",
      },
    ],
  },
  {
    id: "prompt-engineering",
    title: "Prompt Engineering эзэмших",
    subtitle: "Үр дүнтэй prompt бичих урлаг ба шинжлэх ухаан",
    category: "developer",
    difficulty: "Дунд шат",
    duration: "60 мин",
    color: "#3D5A80",
    lessons: [
      {
        id: "l1",
        title: "Сайн prompt-ын зарчмууд",
        minutes: 12,
        summary:
          "Тодорхой байх, контекст өгөх, формат заах, жишээ үзүүлэх — 4 алтан зарчим.",
      },
      {
        id: "l2",
        title: "Few-shot жишээгээр заах",
        minutes: 12,
        summary:
          "Хэдхэн жишээ үзүүлэх замаар Claude-д шинэ загвар хэрхэн зааж сурах.",
      },
      {
        id: "l3",
        title: "Chain-of-thought: Алхам алхамаар бодох",
        minutes: 15,
        summary:
          "Нарийн асуудлыг хэсэг хэсгээр бутлан бодуулж, нарийвчлалыг нэмэгдүүлэх арга.",
      },
      {
        id: "l4",
        title: "System prompt ашиглах",
        minutes: 10,
        summary: "Claude-ын зан төлөвийг тогтооно. Үүрэг, дүр, дүрэм журам зааж өгөх.",
      },
    ],
    tasks: [
      {
        id: "t1",
        title: "5 өөр prompt-ыг харьцуулах",
        xp: 50,
        description: "Нэг л асуудлыг 5 өөр аргаар үг зохион асууж, хариултыг харьцуул.",
      },
      {
        id: "t2",
        title: "Few-shot prompt зохион бичих",
        xp: 50,
        description: "3 жишээтэй few-shot prompt үүсгэж, шинэ оролтод хэрхэн ажиллахыг тест.",
      },
    ],
  },
  {
    id: "api-basics",
    title: "Claude API үндэс",
    subtitle: "Анхны API дуудлагаас production хүртэл",
    category: "developer",
    difficulty: "Дунд шат",
    duration: "70 мин",
    color: "#BC6C25",
    lessons: [
      {
        id: "l1",
        title: "API танилцуулга",
        minutes: 10,
        summary:
          "API гэж юу вэ, яагаад chat биш API-аар ажилладаг вэ. Console, API key, billing-н үндэс.",
      },
      {
        id: "l2",
        title: "Анхны API дуудлага",
        minutes: 15,
        summary:
          "Python эсвэл JavaScript-ээр /messages endpoint руу хүсэлт явуулж, хариулт авах.",
      },
      {
        id: "l3",
        title: "Хариултыг боловсруулах",
        minutes: 15,
        summary: "JSON хариултыг задлах, streaming, token-ы тоог тооцох.",
      },
      {
        id: "l4",
        title: "Алдааг шийдвэрлэх",
        minutes: 12,
        summary:
          "Rate limit, timeout, content filter — байнга тулгардаг алдаанууд ба шийдэл.",
      },
    ],
    tasks: [
      {
        id: "t1",
        title: "Анхны API app үүсгэх",
        xp: 50,
        description:
          "Сэдвээ сонгож, API-аар Claude-той ярилцдаг жижигхэн CLI эсвэл вэб апп бичээрэй.",
      },
    ],
  },
  {
    id: "claude-code",
    title: "Claude Code эзэмших",
    subtitle: "Terminal дотроо ажилладаг хүчирхэг код хамтрагч",
    category: "developer",
    difficulty: "Дээд шат",
    duration: "80 мин",
    color: "#2F4858",
    lessons: [
      {
        id: "l1",
        title: "Claude Code суулгах",
        minutes: 10,
        summary: "npm install, нэвтрэх, эхний үе шат. Системийн шаардлага.",
      },
      {
        id: "l2",
        title: "Анхны командууд",
        minutes: 15,
        summary: "Файл унших, бичих, өөрчлөх, terminal командууд гүйцэтгүүлэх.",
      },
      {
        id: "l3",
        title: "Project дотор ажиллах",
        minutes: 20,
        summary: "CLAUDE.md, контекст менежмент, том code base-тай ажиллах арга.",
      },
      {
        id: "l4",
        title: "MCP server холбох",
        minutes: 15,
        summary:
          "GitHub, database, бусад tool-уудтай Claude Code-ыг холбож, ажлын урсгалаа автоматжуулах.",
      },
    ],
    tasks: [
      {
        id: "t1",
        title: "Жижиг project Claude Code-оор бичих",
        xp: 50,
        description:
          "TODO list эсвэл өөрийн санасан жижиг апп-ыг Claude Code-той хамтран бичээрэй.",
      },
    ],
  },
  {
    id: "claude-for-work",
    title: "Claude ажил дээр",
    subtitle: "Багийн бүтээмжийг нэмэгдүүлэх практик аргууд",
    category: "work",
    difficulty: "Анхан шат",
    duration: "55 мин",
    color: "#8E5572",
    lessons: [
      {
        id: "l1",
        title: "Багийн бүтээмжийг нэмэгдүүлэх",
        minutes: 12,
        summary:
          "Аль ажилд AI зориулах, аль ажил хүний л ажил вэ — ялгахаас эхэлдэг.",
      },
      {
        id: "l2",
        title: "Хурлын тэмдэглэл",
        minutes: 10,
        summary: "Аудио, бичлэгээс хурлын дүгнэлт, action item авах.",
      },
      {
        id: "l3",
        title: "И-мэйл, бичиг баримт боловсруулах",
        minutes: 15,
        summary:
          "Урт текст хураангуйлах, и-мэйл бичих, баримт боловсруулах загварчилсан аргууд.",
      },
      {
        id: "l4",
        title: "Хамгаалалт ба нууцлал",
        minutes: 10,
        summary: "Аль өгөгдлийг AI-д өгч болох, алийг үгүй. Enterprise plan-ы давуу тал.",
      },
    ],
    tasks: [
      {
        id: "t1",
        title: "Багийн workflow-г оновчтой болгох",
        xp: 50,
        description:
          "Багийнхаа давтагдсан 3 ажлыг сонгож, Claude-аар хэрхэн хөнгөвчлөхийг туршаарай.",
      },
    ],
  },
];

export const CATEGORIES: Record<AcademyCategory, { label: string; color: string }> = {
  personal: { label: "Хувийн хэрэглээ", color: "#C8553D" },
  developer: { label: "Хөгжүүлэгчдэд", color: "#3D5A80" },
  work: { label: "Ажил дээр", color: "#8E5572" },
};

export type DerivedStats = {
  totalXP: number;
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string | null;
  lessonsCompleted: number;
  coursesCompleted: number;
};

export type Badge = {
  id: string;
  icon: string;
  name: string;
  desc: string;
  check: (s: DerivedStats) => boolean;
};

export const BADGES: Badge[] = [
  { id: "first-step", icon: "🌱", name: "Эхний алхам", desc: "Эхний хичээлээ дуусгасан", check: (s) => s.lessonsCompleted >= 1 },
  { id: "quick-learner", icon: "⚡", name: "Шуурхай суралцагч", desc: "5 хичээл дуусгасан", check: (s) => s.lessonsCompleted >= 5 },
  { id: "knowledge-seeker", icon: "🔍", name: "Мэдлэг хайгч", desc: "10 хичээл дуусгасан", check: (s) => s.lessonsCompleted >= 10 },
  { id: "course-master", icon: "🎓", name: "Хичээлийн эзэн", desc: "Бүтэн нэг хичээлийг дуусгасан", check: (s) => s.coursesCompleted >= 1 },
  { id: "polymath", icon: "📚", name: "Олон талт", desc: "3 хичээл бүрэн дуусгасан", check: (s) => s.coursesCompleted >= 3 },
  { id: "sage", icon: "🧙", name: "Мэргэн", desc: "Бүх хичээл дуусгасан", check: (s) => s.coursesCompleted >= COURSES.length },
  { id: "streak-7", icon: "🔥", name: "7 хоногийн дайчин", desc: "7 хоног дараалан суралцсан", check: (s) => s.currentStreak >= 7 },
  { id: "streak-30", icon: "🌟", name: "30 хоногийн домог", desc: "30 хоног дараалан", check: (s) => s.currentStreak >= 30 },
  { id: "xp-100", icon: "💎", name: "100 XP", desc: "100 XP цуглуулсан", check: (s) => s.totalXP >= 100 },
  { id: "xp-500", icon: "💰", name: "500 XP", desc: "500 XP цуглуулсан", check: (s) => s.totalXP >= 500 },
  { id: "xp-1000", icon: "👑", name: "1000 XP", desc: "1000 XP цуглуулсан", check: (s) => s.totalXP >= 1000 },
];

export const XP_LESSON = 20;
export const XP_TASK = 50;

/** Shown alongside real DB entries so the leaderboard is never empty. */
export const SEED_LEADERBOARD = [
  { id: "seed-1", name: "Болд", xp: 1240, streak: 18 },
  { id: "seed-2", name: "Сараа", xp: 980, streak: 12 },
  { id: "seed-3", name: "Энхбаяр", xp: 870, streak: 9 },
  { id: "seed-4", name: "Оюунаа", xp: 650, streak: 7 },
  { id: "seed-5", name: "Тэмүүлэн", xp: 540, streak: 5 },
  { id: "seed-6", name: "Номин", xp: 420, streak: 4 },
  { id: "seed-7", name: "Билгүүн", xp: 310, streak: 3 },
  { id: "seed-8", name: "Цэцэгмаа", xp: 220, streak: 2 },
];
