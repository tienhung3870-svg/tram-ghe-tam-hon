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
        cover: "/covers/sapiens.jpg",
        quote: "Tờ giấy trong ví bạn không tự nhiên lại có giá trị. Nó có giá vì tất cả cùng tin nó có giá.",
        why: "Nhìn thấu những trật tự tưởng tượng đang vận hành thế giới để các bạn tự do đặt câu hỏi lại mọi niềm tin cũ."
      },
      {
        id: "money-psychology",
        title: "Tâm Lý Học Về Tiền",
        author: "Morgan Housel",
        cover: "/covers/money-psychology.jpg",
        quote: "Vấn đề không nằm ở chỗ bạn kiếm bao nhiêu, mà ở chỗ bạn không thấy được tiền nó chảy đi đâu. Mấy khoản nhỏ nhỏ cộng lại nó ăn sạch mà bạn không hề hay.",
        why: "Hiểu và làm chủ hành vi với tiền, để những đồng tiền vất vả kiếm ra thực sự ở lại với các bạn."
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
    title: "Kết nối với Trạm",
    callToAction: "Để lại email để nhận phân tích ý sách và góc nhìn mới nhất từ mình.",
    formEndpoint: import.meta.env.VITE_FORM_ENDPOINT || "",
    socialLinks: {
      tiktok: "https://www.tiktok.com/@tramghetamhon",
      youtube: "",
      facebook: ""
    }
  },
  footer: {
    brand: "Trạm Ghé Tâm Hồn",
    slogan: "Không ôm sách, chỉ lấy ý sách mà dùng.",
    year: new Date().getFullYear()
  }
}
