# 🌕 HƯỚNG DẪN DEPLOY TRANG WEB TRUNG THU LÊN INFINITYFREE (CHI TIẾT TỪ A - Z)

Trang chính hiện là **`index.php`**, chạy trên hosting có PHP 7.4+ và MySQLi như **InfinityFree**. Khi bấm **Thả đèn**, điều ước được lưu vào MySQL trước khi đèn bay lên. Thông tin kết nối đã được điền trong file PHP riêng phía máy chủ.

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
   anniversaryDate: "2026-08-22", // Định dạng: Năm-Tháng-Ngày (YYYY-MM-DD)
   anniversaryTime: "18:45",
   anniversaryUtcOffset: "+07:00", // Giờ Việt Nam
   ```

3. **Bức thư tình dưới ánh trăng (`letterContent`)**:
   - Bạn có thể viết những tâm sự ngọt ngào, những kỷ niệm riêng của hai bạn vào mảng các câu trong `letterContent`.

4. **Hình ảnh kỷ niệm của hai bạn**:
   - Bạn có thể copy ảnh thật của hai bạn đặt vào thư mục `images/` và đổi tên (ví dụ: `images/couple.jpg`), hoặc dán link ảnh online vào `config.js`.

5. **Nhạc nền**:
   - Bạn có thể đặt bài hát bạn gái thích (định dạng file `.mp3`) vào thư mục `audio/` và đặt tên là `bgm.mp3`.
   - *Lưu ý: Nếu chưa có file mp3, trang web sẽ tự động tấu giai điệu Music Box piano "Ánh Trăng Nói Hộ Lòng Tôi" du dương cực kỳ lãng mạn.*
   - Không có nút bật/tắt nhạc. Trang thử phát ngay khi mở; nếu trình duyệt chặn tự phát có tiếng, lần chạm đầu tiên vào bất kỳ chỗ nào trên trang sẽ khởi động nhạc. Nhạc tiếp tục khi ngắm không gian và đọc thư. Đây là giới hạn của [chính sách tự phát Chrome](https://developer.chrome.com/blog/autoplay/).

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
   - File `index.php` và `.htaccess` ở thư mục gốc. `index.html` hiện chỉ chuyển người mở đường dẫn cũ sang `index.php`; hãy thay cả file cũ này trên hosting.
   - Toàn bộ thư mục `css/`, gồm cả các file hiệu ứng `cinema.css`, `galaxy.css`, `enchantment.css`, `journey3d.css`, `moonlit-details.css`.
   - Toàn bộ thư mục `js/`, **bao gồm `js/vendor/three/`**. Hành trình 3D dùng thư viện đã lưu sẵn trong dự án; không cần npm hay bước build trên hosting.
   - Thư mục `images/` (các hình ảnh)
   - Thư mục `audio/` (file nhạc nếu có)
   - Toàn bộ thư mục `api/`, gồm `wish.php`, `bootstrap.php`, `db_config.php`, **`db_credentials.php`** và `.htaccess`. File `db_credentials.php` chứa cấu hình thật, đã được loại khỏi Git; nếu lấy mã bằng Git, phải tải riêng file này lên hosting. Không đăng nội dung file hoặc file ZIP chứa mật khẩu lên nơi công khai.

*(Mẹo: Bạn có thể nén toàn bộ các file thành 1 file `.zip`, upload lên rồi bấm chuột phải chọn **Extract** vào `htdocs`)*.

Để xem tại máy tính đã cài PHP và bật MySQLi, chạy `php -S 127.0.0.1:8765` trong thư mục dự án rồi mở `http://127.0.0.1:8765/index.php`. Không dùng Live Server, `python -m http.server` hoặc mở bằng `file://`: các cách này không xử lý PHP. [InfinityFree không cho kết nối MySQL từ ngoài hosting](https://forum.infinityfree.com/t/connecting-to-mysql-from-an-external-application/49339), nên việc lưu vào database của bạn phải kiểm tra trên website đã upload. Trang tại máy vẫn xem được hiệu ứng; nếu lưu thất bại, nội dung điều ước được giữ lại và không báo thành công.

Bản giao diện ưu tiên Android Chrome, điện thoại cầm dọc. Ảnh, chữ, cổng sáng và bệ 3D cùng nằm trong một không gian, nối nhau bằng đường ánh sao khép kín. Camera tự đi vòng khoảng 45 giây mỗi vòng; vuốt ngang hoặc dọc để xoay 360° liên tục theo cả hai chiều, thả tay để trôi tiếp. Bấm **Dừng ngắm** để giữ nguyên góc nhìn; sao, tinh vân và đèn vẫn chuyển động. **Lời gửi em** mở bộ đếm ngày–giờ–phút–giây, lá thư và nút **Thả đèn**; **Trở về ngân hà** quay lại không gian. **Thêm một lần nữa** đưa góc nhìn về tư thế thẳng. Không cần chuột hay cảm biến để sử dụng. Chế độ giảm chuyển động của điện thoại tắt các hiệu ứng tự chạy nhưng vẫn cho phép vuốt xoay thủ công.

Để xem giao diện trên điện thoại trước khi upload, nối điện thoại và máy tính cùng Wi-Fi, chạy `php -S 0.0.0.0:8765`, rồi mở `http://<IPv4-của-máy-tính>:8765/index.php` trên điện thoại (xem IPv4 bằng `ipconfig`). Sau khi upload, mở đường dẫn HTTPS của website để kiểm tra thả đèn.

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

## BƯỚC 4: KIỂM TRA DATABASE VÀ XEM ĐIỀU ƯỚC

Cấu hình đã được điền trong `api/db_credentials.php`, sử dụng database **`if0_40553548_tananh`**. Không cần điền mật khẩu vào JavaScript hoặc HTML. File `api/db_credentials.example.php` chỉ là mẫu cho một bản cài đặt mới.

1. Upload các file ở bước 3 vào `htdocs`, rồi mở website qua HTTPS.
2. Mở **Lời gửi em**, nhập một điều ước và bấm **Thả đèn**. Nút hiện **Đang thả…** trong lúc lưu và tạm khóa để tránh bấm liên tục.
3. API tự tạo bảng **`wishes`** nếu chưa có; các cột gồm `id`, `author`, `wish`, `created_at`. Thời gian lưu theo Việt Nam, nội dung hỗ trợ tiếng Việt và emoji (`utf8mb4`). Bảng cũ không bị xóa.
4. Chỉ khi MySQL xác nhận lưu thành công, đèn mới bay lên và ô nhập mới được xóa. Nếu lưu thất bại, thông báo lỗi xuất hiện, nội dung vẫn giữ nguyên. Không còn cơ chế âm thầm lưu JSON rồi báo thành công.
5. Trong InfinityFree, mở **MySQL Databases → phpMyAdmin**, chọn database **`if0_40553548_tananh`**, bảng **`wishes`**, rồi **Browse** để đọc điều ước. Có thể sắp xếp `id` giảm dần để xem điều ước mới nhất.

`api/wish.php` chỉ nhận POST từ phiên trang; truy cập trực tiếp bằng GET sẽ trả 405 và không công khai danh sách điều ước. Nếu có báo phiên hết hạn, tải lại trang. Nếu không lưu được, kiểm tra đã upload `db_credentials.php`, thông tin MySQL còn đúng và MySQLi đã bật. API không trả mật khẩu hoặc lỗi SQL chi tiết ra trình duyệt.

---

## BƯỚC 5: TẬN HƯỞNG & GỬI TẶNG BẠN GÁI ❤️

Bây giờ bạn chỉ cần truy cập vào đường link domain đã tạo ở Bước 2. Hãy gửi đường link này cho bạn gái qua Messenger/Zalo kèm theo một tin nhắn bất ngờ nhé!
Chúc hai bạn có một mùa Tết Trung Thu thật lãng mạn, ấm áp và ngập tràn hạnh phúc! 🌕🏮✨
