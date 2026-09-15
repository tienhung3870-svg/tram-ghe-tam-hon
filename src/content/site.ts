export interface Pillar {
  id: string
  icon: string
  title: string
  description: string
}

export interface Book {
  id: string
  title: string
  author: string
  cover: string // URL or path
  quote: string
  why: string
}

export interface AboutValue {
  id: string
  label: string
}

export const siteContent = {
  hero: {
    title: ["Trạm", "Ghé", "Tâm Hồn"],
    slogan: "Không ôm sách, chỉ lấy ý sách mà dùng.",
    cta: "Khám phá →"
  },
  pillars: {
    title: "Trụ cột",
    items: [
      {
        id: "money",
        icon: "💰",
        title: "Tiền",
        description: "Hiểu và làm chủ tiền khi mới kiếm ra — không để cuối tháng hết sạch."
      },
      {
        id: "mind",
        icon: "🧠",
        title: "Hiểu con người",
        description: "Vì sao mình hành xử vậy? Thế giới vận hành thế nào? Sapiens giải mã."
      },
      {
        id: "freedom",
        icon: "🔓",
        title: "Phá giới hạn",
        description: "Tự do khỏi cái khuôn người khác đặt cho mình — đó là North Star."
      }
    ] as Pillar[]
  },
  books: {
    title: "Cuốn đang giải mã",
    items: [
      {
        id: "sapiens",
        title: "Sapiens — Lược sử loài người",
        author: "Yuval Noah Harari",
        cover: "", // TODO-HUNG: Thêm link ảnh bìa
        quote: "70.000 năm lịch sử gói trong 1 cuốn. Mình không kể lại sách — mình lấy ý, ghép với đời thật của các bạn, để các bạn thấy: mọi thứ đang tin đều có thể đặt câu hỏi lại.", // TODO-HUNG: Sửa lại quote cho chuẩn
        why: "// TODO-HUNG: Viết 1 câu vì sao nên đọc cuốn này"
      },
      {
        id: "money-psychology",
        title: "Tâm Lý Học Về Tiền",
        author: "Morgan Housel",
        cover: "", // TODO-HUNG: Thêm link ảnh bìa
        quote: "// TODO-HUNG: Thêm quote",
        why: "// TODO-HUNG: Viết 1 câu vì sao nên đọc cuốn này"
      }
    ] as Book[],
    pairText: "📚 Ghép với:"
  },
  about: {
    title: "Mình là ai?",
    paragraphs: [
      "18 tuổi. Đọc sách không phải vì thích — mà vì cần. Cần hiểu tiền chạy đi đâu, cần hiểu sao mình cứ lặp sai, cần phá cái khuôn người khác đặt cho mình.",
      "Kênh này là la bàn — không bán sách, chỉ chỉ đường: với tình huống của bạn, nên đọc cuốn nào, nghĩ hướng nào, làm cách nào."
    ],
    values: [
      { id: "v1", label: "Chân thật" },
      { id: "v2", label: "Chạm cảm xúc" },
      { id: "v3", label: "Thực chiến" }
    ] as AboutValue[]
  },
  contact: {
    title: "Kết nối", // TODO-HUNG
    callToAction: "Để lại email để nhận thông báo bài viết mới nhất.", // TODO-HUNG
    formEndpoint: import.meta.env.VITE_FORM_ENDPOINT || "",
    socialLinks: {
      tiktok: "https://www.tiktok.com/@tramghetamhon",
      youtube: "", // TODO-HUNG: Thêm link youtube
      facebook: "" // TODO-HUNG: Thêm link facebook
    }
  },
  footer: {
    brand: "Trạm Ghé Tâm Hồn",
    slogan: "Không ôm sách, chỉ lấy ý sách mà dùng.",
    year: new Date().getFullYear()
  }
}
