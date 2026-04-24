# YT Batch Downloader

Một công cụ giao diện Web (Frontend-only) nhẹ nhàng, trực quan dùng để tạo kịch bản tải hàng loạt Video, Kênh, và Playlist từ YouTube bằng cách sử dụng công cụ lõi `yt-dlp` và `ffmpeg`.

## ✨ Tính năng nổi bật

- **Chạy trực tiếp trên trình duyệt:** Không cần cài đặt phần mềm phức tạp, không cần server. Chỉ việc click đúp mở file `index.html` bằng bất kỳ trình duyệt nào (Chrome, Edge, Brave...) là dùng được ngay.
- **Tải hàng loạt dễ dàng:** Hỗ trợ nhập và xử lý hàng chục link Kênh, Playlist, hoặc Video lẻ cùng lúc.
- **Chất lượng đa dạng:** Tùy chọn độ phân giải Cao nhất (thường là 4K), 1080p, 720p hoặc chỉ trích xuất Âm thanh (MP3).
- **Tự động hóa toàn diện:** File `.bat` được sinh ra có khả năng tự động kiểm tra và tải các công cụ lõi như `yt-dlp.exe`, `ffmpeg.exe` (để ghép âm thanh/hình ảnh) và `node.exe` (dùng giải mã thuật toán EJS chống bot của YouTube) nếu máy chưa có.
- **Tích hợp Cookies (Vượt mã Bot):** Cung cấp sẵn cơ chế đọc file `cookies.txt` giúp tải video mượt mà, không gặp lỗi "Sign in to confirm you're not a bot", vượt qua giới hạn độ tuổi hay yêu cầu đăng nhập.
- **Tùy chọn tải nâng cao:**
  - Nhúng Subtitle (phụ đề tất cả ngôn ngữ).
  - Gắn Thumbnail (ảnh bìa) và Metadata thẳng vào file video.
  - Chế độ Archive (Bỏ qua video đã tải): Rất hữu ích khi mạng rớt, công cụ sẽ ghi nhớ các video đã tải và chỉ tải tiếp những video còn thiếu.
  - Khống chế tải (Số video tối đa, Ngày phát hành sau khoảng thời gian nào đó).
- **Giao diện Dark/Light Theme:** Hiện đại, chuyên nghiệp, với bảng Hướng dẫn sử dụng (Guide) được thiết kế tỉ mỉ. Toàn bộ thiết lập của bạn sẽ được lưu tự động cho lần dùng sau.

## 🚀 Hướng dẫn sử dụng

1. **Mở công cụ:** Mở file `index.html`.
2. **Nhập URL:** Copy và Paste (Dán) các link YouTube cần tải vào khung nhập liệu bên trái (mỗi link nằm trên 1 dòng riêng biệt).
3. **Cấu hình đường dẫn:**
   - Cung cấp đường dẫn tuyệt đối đến thư mục chứa công cụ và thư mục lưu video (VD: `D:\YT-Downloader`).
   - 💡 *Mẹo:* Bạn nên dùng duy nhất một thư mục gốc cho cả công cụ lẫn video để dễ quản lý.
4. **Cấu hình Cookies (Quan trọng):** Nếu tải nhiều, tải playlist hoặc tải video bị giới hạn, hãy dùng tiện ích *Get cookies.txt LOCALLY* trên trình duyệt để xuất file `cookies.txt`. Dán đường dẫn file đó vào tool để quá trình tải không bị gián đoạn.
5. **Chạy lệnh:**
   - Nhấn **Tạo & Chạy ngay** (Trình duyệt sẽ tải về một file `.bat`).
   - Click đúp mở file `.bat` đó trên máy tính Windows, cửa sổ đen (CMD) sẽ hiện lên và tự động tải toàn bộ video về máy.

## 🛠️ Công nghệ sử dụng
- **Giao diện (UI/UX):** HTML5, Vanilla JavaScript, CSS3.
- **Xử lý Download:** `yt-dlp` (được tool tự động kéo bản mới nhất từ Github).
- **Xử lý Đa phương tiện:** `FFmpeg` (gộp Video hình và Audio nhạc lại với nhau).
- **Giải mã JS Challenge:** Sử dụng `Node.js` Runtime (để đối phó với thuật toán n-challenge của YouTube).

## 👨‍💻 Tác giả
- Bản quyền thuộc về: **Văn Hòa**
- Hỗ trợ & Liên hệ: [Facebook](https://www.facebook.com/vanhoa2622)
