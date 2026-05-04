# Các Chức Năng Cần Hoàn Thiện Và Trọng Tâm Phát Triển

Dựa trên yêu cầu cốt lõi của dự án và hiện trạng mã nguồn, dưới đây là các tính năng hiện đang chưa hoạt động hoàn chỉnh, còn thiếu, hoặc cần được tập trung phát triển trong giai đoạn tiếp theo.

## Trọng Tâm Ưu Tiên Cao

### 1. Giới Hạn Số Lượng Mượn (Borrow Limit)
- **Tình trạng**: Chưa được triển khai chặt chẽ.
- **Yêu cầu**: 
  - Hệ thống cần kiểm tra chặt chẽ số lượng thiết bị tồn kho thực tế trước khi cho phép sinh viên tạo yêu cầu mượn.
  - Cần thiết lập giới hạn số lượng thiết bị mà một sinh viên (hoặc tài khoản) có thể mượn tối đa trong một lần mượn hoặc trong một khoảng thời gian cụ thể (ví dụ: tối đa 3 thiết bị cùng lúc).
  - Ngăn chặn triệt để tình trạng mượn vượt quá số lượng `stock` trong kho.

### 2. Hệ Thống Email Thông Báo Tự Động
- **Tình trạng**: Chưa hoạt động hoặc chưa được tích hợp hoàn chỉnh.
- **Đối với Sinh Viên**:
  - Gửi email thông báo ngay khi yêu cầu mượn của họ được quản trị viên duyệt hoặc bị từ chối (kèm lý do).
  - Tự động gửi email nhắc nhở khi thời hạn trả thiết bị sắp đến (ví dụ: trước 1-2 ngày).
- **Đối với Quản Trị Viên (Admin)**:
  - Gửi email cảnh báo định kỳ cho Admin (hoặc sinh viên) về danh sách các thiết bị đã quá hạn mà chưa được trả.

### 3. Cảnh Báo Trực Tiếp Trên Hệ Thống (System Alerts)
- **Tình trạng**: Còn thiếu các cảnh báo trực quan cho quản trị viên.
- **Yêu cầu**: 
  - Hiển thị thông báo/cảnh báo (notification/badge) nổi bật ngay trên giao diện Dashboard của Admin khi có thiết bị quá hạn trả.
  - Cảnh báo khi có yêu cầu mượn mới chưa được xử lý.
  - Cảnh báo thiết bị trong kho sắp hết (số lượng tồn kho thấp).

## Các Tính Năng Khác Cần Kiểm Tra & Bổ Sung

### 1. Phân Hệ Sinh Viên
- Cần rà soát lại luồng thao tác của sinh viên trên Frontend để đảm bảo quá trình: **Xem danh sách thiết bị -> Đặt ngày mượn/trả -> Nhấn yêu cầu** hoạt động mượt mà, lưu chính xác vào Database và hiển thị đúng trên phía Admin.
- Đảm bảo chức năng "Xem lịch sử lượt mượn của bản thân" trả về đúng dữ liệu theo tài khoản đã đăng nhập.

### 2. Phân Hệ Admin
- **Hoàn thiện UI/UX**: Một số chức năng trên màn hình Admin trước đây được đánh giá là "chưa hoàn thiện trong source code gốc", do vậy cần kiểm tra lại các form nhập liệu, thêm sửa xóa (CRUD) thiết bị để tránh các lỗi ẩn.
- **Ghi nhận Mượn - Trả thực tế**: Chức năng cập nhật tồn kho khi xác nhận "Đã lấy thiết bị" và "Đã trả thiết bị" cần hoạt động theo nguyên tắc atomic transaction trong SQL (đảm bảo không bị sai lệch số lượng do thao tác đồng thời).
- **Thống kê (Statistics)**: Cần xây dựng và hoàn thiện biểu đồ/báo cáo "Thống kê thiết bị mượn nhiều trong tháng", truy vấn dữ liệu từ DB để hiển thị trên Dashboard.
