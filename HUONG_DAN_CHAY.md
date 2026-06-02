# Hướng Dẫn Cài Đặt và Chạy Dự Án LendHub

Dự án LendHub (Hệ thống quản lý mượn thiết bị) đã được thiết lập container hóa toàn bộ bằng Docker. Người dùng/người đánh giá **KHÔNG cần cài đặt SQL Server, Node.js, hay cấu hình môi trường thủ công** trên máy tính cá nhân.

---

## ❓ Câu Hỏi Thường Gặp

### 1. Máy của tôi/người nhận có cần cài đặt SQL Server không?
* **KHÔNG.** Cơ sở dữ liệu Microsoft SQL Server đã được đóng gói chạy hoàn toàn bên trong Docker container (`lendhub-db`). Docker sẽ tự động quản lý và kích hoạt máy chủ SQL Server này khi khởi chạy hệ thống.

### 2. Khi thao tác mượn/trả, dữ liệu sẽ được lưu ở đâu?
* Dữ liệu được lưu trữ trực tiếp trên máy tính của bạn thông qua cơ chế **Docker Volume** (ổ đĩa ảo cục bộ được quản lý bởi Docker, cụ thể là volume `mssql-data`).
* Dữ liệu này sẽ **được bảo toàn và ghi nhớ liên tục** trên đĩa cứng của bạn ngay cả khi bạn tắt máy tính, tắt Docker, hay chạy lệnh khởi động lại.

---

## 🚀 Các Bước Khởi Chạy Dự Án

### Bước 1: Chuẩn bị công cụ
Đảm bảo máy tính đã được cài đặt:
1. **Git** (để tải code từ GitHub).
2. **Docker Desktop** (để khởi chạy ứng dụng).

### Bước 2: Tải mã nguồn từ GitHub
Mở Terminal (Command Prompt hoặc PowerShell) trên máy tính và chạy lần lượt các lệnh sau:

```bash
# 1. Tải dự án từ GitHub về máy
git clone https://github.com/KazuTTL/Web_Quanlymuondo.git

# 2. Di chuyển vào thư mục dự án
cd Web_Quanlymuondo

# 3. Chuyển sang nhánh hoàn thiện mới nhất
git checkout update1
```

### Bước 3: Khởi chạy dự án bằng Docker
Bật Docker Desktop lên, sau đó tại thư mục dự án trên Terminal chạy lệnh duy nhất:

```bash
docker-compose up --build -d
```

*Hệ thống sẽ tự động tải các tài nguyên cần thiết, biên dịch mã nguồn, khởi tạo cơ sở dữ liệu và nạp dữ liệu mẫu thử nghiệm.*

---

## 🔑 Tài Khoản Thử Nghiệm Có Sẵn

Sau khi khởi chạy hoàn tất, bạn mở trình duyệt và truy cập vào trang web theo địa chỉ: **[http://localhost:5173](http://localhost:5173)**

Bạn có thể sử dụng các tài khoản mẫu sau để trải nghiệm ngay các tính năng:

### 1. Tài khoản Quản trị viên (Admin)
* **Tên đăng nhập (Email):** `admin`
* **Mật khẩu:** `123456`
* *Tính năng kiểm thử:* Duyệt/từ chối yêu cầu, xác nhận trả thiết bị, quản lý sinh viên (sửa Email), xem biểu đồ thống kê cơ cấu/top thiết bị/sinh viên mượn nhiều nhất trong 30 ngày, chạy xử lý phạt quá hạn tự động.

### 2. Tài khoản Sinh viên (Student)
* **Tên đăng nhập (Username):** `mai.tran`
* **Mật khẩu:** `123456`
* *Tính năng kiểm thử:* Xem danh sách thiết bị, gửi yêu cầu mượn thiết bị mới, xem lịch sử mượn trả, xem thông báo phạt quá hạn (nếu admin bấm tính phạt quá hạn), cập nhật mã sinh viên/email cá nhân.

---

## 🛑 Dừng Hệ Thống

Khi không còn nhu cầu sử dụng, bạn mở Terminal tại thư mục dự án và chạy lệnh sau để dừng tất cả các container một cách an toàn:

```bash
docker-compose down
```
