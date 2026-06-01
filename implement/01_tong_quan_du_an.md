# Tổng Quan Dự Án: Hệ Thống Quản Lý Mượn Trả Thiết Bị

## Ý Tưởng Chính
Xây dựng một hệ thống nền tảng web cho phép sinh viên hoặc các câu lạc bộ có thể đăng ký mượn thiết bị từ kho của nhà trường. Đồng thời, hệ thống cung cấp công cụ cho quản trị viên (Admin) để ghi nhận việc mượn – trả, theo dõi số lượng tồn kho, quản lý lịch sử mượn và cung cấp các báo cáo thống kê.

## Phân Hệ Người Dùng

### 1. Sinh Viên (Người mượn)
- **Đăng nhập**: Xác thực người dùng truy cập vào hệ thống.
- **Xem danh sách thiết bị**: Xem các thiết bị hiện có sẵn trong kho, bao gồm thông tin chi tiết: tên, tình trạng, và số lượng có thể mượn.
- **Gửi yêu cầu mượn**: Lên đơn yêu cầu mượn thiết bị bằng cách chọn thiết bị và chỉ định ngày mượn - ngày trả.
- **Lịch sử mượn**: Theo dõi các lượt mượn của bản thân (đang chờ duyệt, đã duyệt, đã trả, quá hạn...).
- **Nhận thông báo (Email)**: Nhận email thông báo tự động khi yêu cầu được quản trị viên duyệt hoặc khi sắp đến hạn phải trả thiết bị.

### 2. Quản Trị Viên (Admin)
- **Đăng nhập**: Xác thực quyền quản trị.
- **Quản lý Yêu Cầu**: 
  - Xem danh sách toàn bộ các yêu cầu mượn thiết bị.
  - Xem thông tin chi tiết của một yêu cầu cụ thể.
  - Phê duyệt hoặc từ chối các yêu cầu từ sinh viên.
- **Quản lý Kho Thiết Bị**: 
  - Xem danh sách thiết bị.
  - Thực hiện các thao tác thêm, sửa, xóa thông tin thiết bị.
  - Cập nhật số lượng thiết bị, xem chi tiết và kiểm soát số lượng tồn kho thực tế.
- **Ghi nhận Mượn - Trả**: Xác nhận khi người dùng đến nhận thiết bị và khi trả lại, từ đó tự động cập nhật lại số lượng tồn kho.
- **Thống Kê**: Thống kê và báo cáo các thiết bị được mượn nhiều nhất trong tháng.
- **Cảnh Báo & Email**: Hệ thống cảnh báo trực tiếp trên giao diện và tự động gửi email nhắc nhở/cảnh báo đối với những thiết bị đã quá hạn trả.

## Cấu Trúc Kỹ Thuật (Tech Stack)
- **Frontend (`TH` folder)**: Xây dựng bằng framework UmiJS (React).
- **Backend (`Be--web` folder)**: Xây dựng bằng Node.js.
- **Database (`Database` folder)**: Chạy trên hệ quản trị cơ sở dữ liệu MS SQL Server.
