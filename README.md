# 🎵 MediaConvert — 100% In-Browser MP4 to MP3 Converter

<p align="center">
  <img src="https://raw.githubusercontent.com/okido87/-media-convert/main/public/vite.svg" width="80" height="80" alt="MediaConvert Logo" />
</p>

<p align="center">
  <b>Công cụ trích xuất và chuyển đổi MP4 sang MP3 chất lượng cao chạy 100% trên trình duyệt.</b><br>
  <i>Bảo mật tuyệt đối • Không tải file lên server • Không giới hạn dung lượng • Hoàn toàn miễn phí.</i>
</p>

<p align="center">
  <a href="https://github.com/okido87/-media-convert/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-MIT-green.svg?style=flat-square" alt="License" /></a>
  <a href="https://react.dev/"><img src="https://img.shields.io/badge/React-18.3-61dafb.svg?style=flat-square&logo=react" alt="React" /></a>
  <a href="https://vitejs.dev/"><img src="https://img.shields.io/badge/Vite-6.x-646cff.svg?style=flat-square&logo=vite" alt="Vite" /></a>
  <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-5.7-blue.svg?style=flat-square&logo=typescript" alt="TypeScript" /></a>
  <a href="https://webassembly.org/"><img src="https://img.shields.io/badge/WebAssembly-FFmpeg_v0.12-654ff0.svg?style=flat-square&logo=webassembly" alt="WebAssembly" /></a>
  <a href="https://tailwindcss.com/"><img src="https://img.shields.io/badge/TailwindCSS-3.4-38bdf8.svg?style=flat-square&logo=tailwind-css" alt="TailwindCSS" /></a>
  <a href="https://github.com/okido87/-media-convert"><img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square" alt="PRs Welcome" /></a>
</p>

---

## 🌟 Vì Sao Chọn MediaConvert?

Hầu hết các website chuyển đổi video online hiện nay đều bắt người dùng **upload video lên máy chủ bên thứ ba**, tiềm ẩn nguy cơ lộ lọt dữ liệu riêng tư, giới hạn tốc độ và chèn quảng cáo khó chịu.

**MediaConvert** giải quyết triệt để vấn đề này bằng sức mạnh của **WebAssembly (WASM)**:
- 🔒 **100% Riêng Tư (Zero Server Upload)**: Video của bạn không bao giờ rời khỏi thiết bị. Mọi thao tác giải mã container MP4, trích xuất audio stream và nén MP3 qua thư viện LAME đều diễn ra trực tiếp trong RAM trình duyệt của bạn.
- ⚡ **Xử Lý Hàng Loạt (Sequential Batch Queue)**: Kéo thả cùng lúc hàng chục video. Công cụ tự động xếp hàng và xử lý tuần tự (bounded concurrency = 1) để tránh tràn bộ nhớ trình duyệt (Out Of Memory).
- ✂️ **Cắt Đoạn Âm Thanh (Audio Trimming)**: Tích hợp video player xem trước và thanh trượt kép trực quan, cho phép bạn chọn chính xác mốc Start Time / End Time cần cắt trước khi chuyển đổi.
- 🎚️ **Tùy Chỉnh Chất Lượng Âm Thanh Đa Dạng**:
  - **Bitrate**: `128 kbps` (Tiêu chuẩn), `192 kbps` (Chất lượng cao), `256 kbps` (Rất cao), `320 kbps` (Phòng thu), hoặc `VBR V2` (Tối ưu theo dải tần).
  - **Sample Rate**: `44,100 Hz` (Chuẩn Audio CD) hoặc `48,000 Hz` (Chuẩn Video/Studio).
- 📦 **Tải Từng Tệp Hoặc Gói ZIP**: Tải ngay từng tệp MP3 khi xong hoặc nhấn 1 nút để đóng gói toàn bộ danh sách thành tệp `.zip` duy nhất bằng JSZip.
- 🚀 **Cơ Chế Tự Động Fallback Thông Minh**: Tự động nhận diện môi trường hỗ trợ `SharedArrayBuffer` để kích hoạt đa luồng (`core-mt`), đồng thời sẵn sàng fallback về bản đơn luồng (`core`) giúp app chạy ổn định trên mọi nền tảng web tĩnh.

---

## 🏗️ Kiến Trúc Hệ Thống (System Architecture)

```
+-------------------------------------------------------------------------+
|                        Trình Duyệt Khách (Browser)                      |
|                                                                         |
|   +-------------------+   +--------------------+   +----------------+   |
|   |  Drag & Drop Zone |   | Video Trim Modal   |   | Settings Panel |   |
|   +-------------------+   +--------------------+   +----------------+   |
|             \                       |                      /            |
|              v                      v                     v             |
|   +-----------------------------------------------------------------+   |
|   |          Zustand Central Store (Queue & Transcode State)        |   |
|   +-----------------------------------------------------------------+   |
|                                     |                                   |
|                                     v (Message Stream)                  |
|   +-----------------------------------------------------------------+   |
|   |            FFmpeg WebAssembly Engine (Web Worker)               |   |
|   |                                                                 |   |
|   |  1. Ghi tệp vào bộ nhớ ảo MEMFS: input_[id].mp4                 |   |
|   |  2. Fast Seek & Demux: ffmpeg -ss .. -to .. -i .. -vn -c:a lame |   |
|   |  3. Bắn event tiến độ % thời gian thực (0 -> 100%)              |   |
|   |  4. Đọc nhị phân MP3 đầu ra và tạo Blob                         |   |
|   |  5. Tự động thu hồi bộ nhớ MEMFS (deleteFile) trong finally     |   |
|   +-----------------------------------------------------------------+   |
|                                     |                                   |
|                                     v                                   |
|   +-----------------------------------------------------------------+   |
|   |            Tải Về Trực Tiếp / Đóng Gói Toàn Bộ .ZIP             |   |
|   +-----------------------------------------------------------------+   |
+-------------------------------------------------------------------------+
```

---

## 🚀 Hướng Dẫn Cài Đặt & Chạy Cục Bộ (Quick Start)

### Yêu cầu tiên quyết
- [Node.js](https://nodejs.org/) (phiên bản >= 18.0.0)
- npm, pnpm hoặc yarn

### Các bước cài đặt

1. **Clone repository về máy**:
   ```bash
   git clone https://github.com/okido87/-media-convert.git
   cd -media-convert
   ```

2. **Cài đặt các dependencies**:
   ```bash
   npm install
   ```
   *(Lệnh `postinstall` sẽ tự động chuẩn bị các tệp lõi WebAssembly vào thư mục `public/ffmpeg/`)*

3. **Khởi chạy Development Server**:
   ```bash
   npm run dev
   ```
   Mở trình duyệt và truy cập: **`http://localhost:5173`**

4. **Đóng gói Production**:
   ```bash
   npm run build
   ```
   Bản build tối ưu sẽ nằm trong thư mục `dist/`.

5. **Xem trước bản Production build**:
   ```bash
   npm run preview
   ```

---

## 📤 Hướng Dẫn Đẩy Code Lên GitHub (Dành Cho Maintainer)

Nếu bạn vừa khởi tạo dự án và muốn đẩy code lên repository chính:

```bash
git init
git add .
git commit -m "feat: complete in-browser MP4 to MP3 converter with FFmpeg WASM"
git remote add origin https://github.com/okido87/-media-convert.git
git branch -M main
git push -u origin main
```

---

## ☁️ Triển Khai Lên Web (Deployment Guide)

Để tận dụng tối đa hiệu năng đa luồng của CPU thông qua `SharedArrayBuffer`, web server cần trả về 2 response headers:
```http
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Embedder-Policy: require-corp
```

Dự án đã cấu hình sẵn sàng:
- **Vercel**: Đã có file [`vercel.json`](./vercel.json). Chỉ cần import repo vào Vercel và nhấn Deploy!
- **Cloudflare Pages**: Đã có file [`public/_headers`](./public/_headers).
- **GitHub Pages / Host tĩnh khác**: Nếu hosting không cho phép thêm headers, MediaConvert sẽ tự động nhận diện và chuyển sang bản `core` đơn luồng để đảm bảo người dùng luôn sử dụng được mà không bị lỗi.

---

## 🛠️ Tech Stack Chi Tiết

| Thành phần | Công nghệ sử dụng |
|---|---|
| **Giao diện (UI)** | React 18, Tailwind CSS, Lucide Icons, Radix UI Primitives |
| **Công cụ đóng gói** | Vite 6, TypeScript 5.7 |
| **Transcoding Engine** | `@ffmpeg/ffmpeg` v0.12, `@ffmpeg/util`, `@ffmpeg/core`, `@ffmpeg/core-mt` |
| **Quản lý State** | Zustand (Store độc lập, không re-render dư thừa) |
| **Nén & Tải hàng loạt** | JSZip |

---

## 👨‍💻 Tác Giả & Nhà Phát Triển

Dự án được xây dựng và chia sẻ cho cộng đồng bởi:

**Hien Nguyen**  
*Founder, EMS Solution*  
- GitHub: [@okido87](https://github.com/okido87)
- Repository: [https://github.com/okido87/-media-convert](https://github.com/okido87/-media-convert)

---

## 🤝 Đóng Góp (Contributing)

Mọi đóng góp nhằm cải thiện hiệu năng, bổ sung tính năng (chuyển đổi sang AAC, WAV, trích xuất bìa album ID3...) đều được hoan nghênh:
1. Fork dự án
2. Tạo feature branch: `git checkout -b feature/tinh-nang-moi`
3. Commit thay đổi: `git commit -m 'feat: them tinh nang moi'`
4. Push lên branch: `git push origin feature/tinh-nang-moi`
5. Mở một Pull Request

---

## 📄 Giấy Phép (License)

Dự án được phát hành theo giấy phép mã nguồn mở [MIT License](./LICENSE). Bạn hoàn toàn tự do sử dụng, chỉnh sửa và tích hợp vào các dự án cá nhân hoặc thương mại.
