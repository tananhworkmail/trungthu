# 🌕 HƯỚNG DẪN DEPLOY TRANG WEB TRUNG THU LÊN INFINITYFREE (CHI TIẾT TỪ A - Z)

Trang web này được tối ưu 100% để chạy mượt mà ngay lập tức trên nền tảng hosting miễn phí **InfinityFree** (hoặc bất kỳ hosting PHP/HTML nào).

---

## BƯỚC 1: TÙY CHỈNH THÔNG TIN DÀNH RIÊNG CHO BẠN GÁI (RẤT QUAN TRỌNG)

Trước khi upload lên hosting, bạn hãy mở file **`js/config.js`** để thay đổi các thông tin sau:

1. **Tên bạn gái & bạn trai**:
   ```javascript
   recipientName: "Tên Bạn Gái", // Ví dụ: "Bảo Ngọc", "Công Chúa Nhỏ", "Em Yêu"
   senderName: "Tên Của Bạn",    // Ví dụ: "Anh Tuấn", "Chàng Ngốc Của Em"
   ```

2. **Ngày kỷ niệm bắt đầu yêu nhau**:
   ```javascript
   anniversaryDate: "2024-02-14", // Định dạng: Năm-Tháng-Ngày (YYYY-MM-DD)
   ```

3. **Bức thư tình dưới ánh trăng (`letterContent`)**:
   - Bạn có thể viết những tâm sự ngọt ngào, những kỷ niệm riêng của hai bạn vào mảng các câu trong `letterContent`.

4. **Hình ảnh kỷ niệm của hai bạn**:
   - Bạn có thể copy ảnh thật của hai bạn đặt vào thư mục `images/` và đổi tên (ví dụ: `images/couple.jpg`), hoặc dán link ảnh online vào `config.js`.

5. **Nhạc nền**:
   - Bạn có thể đặt bài hát bạn gái thích (định dạng file `.mp3`) vào thư mục `audio/` và đặt tên là `bgm.mp3`.
   - *Lưu ý: Nếu chưa có file mp3, trang web sẽ tự động tấu giai điệu Music Box piano "Ánh Trăng Nói Hộ Lòng Tôi" du dương cực kỳ lãng mạn.*

---

## BƯỚC 2: TẠO TÀI KHOẢN VÀ DOMAIN MIỄN PHÍ TRÊN INFINITYFREE

1. Truy cập trang chủ: [https://www.infinityfree.com](https://www.infinityfree.com) và bấm **Register** (hoặc đăng nhập nếu đã có).
2. Tại trang quản trị (Client Area), bấm **Create Account**.
3. **Chọn tên miền miễn phí**:
   - Chọn mục **Subdomain** (Miễn phí 100%).
   - Nhập tên miền đáng yêu bạn muốn tặng bạn gái, ví dụ: `dem-trang-tang-em` hoặc `yeu-em-nhieu`.
   - Chọn đuôi domain (ví dụ: `.infinityfreeapp.com` hoặc `.42web.io`).
   - Bấm **Check Availability** -> Bấm **Create Account**.

---

## BƯỚC 3: UPLOAD MÃ NGUỒN LÊN INFINITYFREE (CHỈ MẤT 1 PHÚT)

### Cách 1: Sử dụng File Manager trực tiếp trên web (Đơn giản nhất)
1. Trong trang quản lý tài khoản InfinityFree, bấm nút **File Manager**.
2. Tìm và bấm mở thư mục **`htdocs`** (đây là thư mục chứa web chính).
3. Nếu bên trong `htdocs` có sẵn file mặc định của hosting (như `index2.html` hay `DO NOT UPLOAD FILES HERE`), bạn hãy xóa chúng đi.
4. Tải toàn bộ các file và thư mục của dự án lên:
   - File `index.html`
   - Thư mục `css/` (gồm `style.css`, `animations.css`)
   - Thư mục `js/` (gồm `config.js`, `sky-lanterns.js`, `fireworks.js`, `main.js`)
   - Thư mục `images/` (các hình ảnh)
   - Thư mục `audio/` (file nhạc nếu có)
   - Thư mục `api/` (xử lý điều ước)

*(Mẹo: Bạn có thể nén toàn bộ các file thành 1 file `.zip`, upload lên rồi bấm chuột phải chọn **Extract** vào `htdocs`)*.

---

### Cách 2: Sử dụng phần mềm FTP (FileZilla)
1. Trong dashboard InfinityFree, xem mục **FTP Details**:
   - **FTP Hostname**: (ví dụ: `ftpupload.net`)
   - **FTP Username**: (ví dụ: `epiz_12345678`)
   - **FTP Password**: (mật khẩu vPanel của bạn)
   - **Port**: `21`
2. Mở FileZilla -> Điền thông tin trên -> Bấm **Quickconnect**.
3. Kéo toàn bộ thư mục web thả vào thư mục `htdocs` bên phải.

---

## BƯỚC 4: (TÙY CHỌN) KẾT NỐI DATABASE MYSQL TRÊN INFINITYFREE

> **Ghi chú**: Tính năng Thả Thiên Đăng Ước Nguyện mặc định **đã tự động lưu** vào file `api/wishes.json` hoặc lưu trên trình duyệt của bạn gái mà không bắt buộc phải tạo database.  
> Tuy nhiên, nếu bạn muốn dùng cơ sở dữ liệu MySQL chuyên nghiệp trên InfinityFree:

1. Vào **Control Panel (cPanel)** của InfinityFree -> Chọn **MySQL Databases**.
2. Nhập tên database mới (ví dụ: `trungthu`) và bấm **Create Database**.
3. Xem các thông số MySQL được cấp:
   - **MySQL Hostname**: (ví dụ: `sql123.infinityfree.com`)
   - **MySQL Username**: (ví dụ: `epiz_12345678`)
   - **MySQL Password**: Mật khẩu tài khoản của bạn
   - **MySQL Database Name**: (ví dụ: `epiz_12345678_trungthu`)
4. Mở file **`api/db_config.php`** trên File Manager và cập nhật:
   ```php
   define('USE_MYSQL', true);
   define('DB_HOST', 'sql123.infinityfree.com');
   define('DB_USER', 'epiz_12345678');
   define('DB_PASS', 'mat_khau_cua_ban');
   define('DB_NAME', 'epiz_12345678_trungthu');
   ```
5. Bấm Lưu lại. Hệ thống sẽ tự động tạo bảng `wishes` và lưu mọi điều ước của bạn gái vào MySQL!

---

## BƯỚC 5: TẬN HƯỞNG & GỬI TẶNG BẠN GÁI ❤️

Bây giờ bạn chỉ cần truy cập vào đường link domain đã tạo ở Bước 2. Hãy gửi đường link này cho bạn gái qua Messenger/Zalo kèm theo một tin nhắn bất ngờ nhé!
Chúc hai bạn có một mùa Tết Trung Thu thật lãng mạn, ấm áp và ngập tràn hạnh phúc! 🌕🏮✨
