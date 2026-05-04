# Các Chức Năng Cần Hoàn Thiện Và Trọng Tâm Phát Triển

Dựa trên yêu cầu cốt lõi của dự án và hiện trạng mã nguồn, dưới đây là các tính năng hiện đang chưa hoạt động hoàn chỉnh, còn thiếu, hoặc cần được tập trung phát triển trong giai đoạn tiếp theo.

## Trọng Tâm Ưu Tiên Cao

### 1. Giới Hạn Số Lượng Mượn (Borrow Limit)
- **Tình trạng**: Đã được triển khai trong Stored Procedures (sp_TaoYeuCauMuon)
- **Yêu cầu**: 
  - Kiểm tra số lượng thiết bị tồn kho
  - Giới hạn tối đa 3 thiết bị cùng lúc
  - Kiểm tra ngày mượn hợp lệ

### 2. Hệ Thống Email Thông Báo Tự Động
- **Tình trạng**: Đã có email templates và task email-notifications
- **Chức năng**:
  - Gửi email khi duyệt/từ chối
  - Nhắc nhở khi sắp đến hạn
  - Cảnh báo khi quá hạn

### 3. Cảnh Báo Trực Tiếp Trên Hệ Thống (System Alerts)
- **Tình trạng**: Đã có bảng OverdueAlerts và triggers
- **Chức năng**: 
  - Dashboard Admin hiển thị cảnh báo
  - Badge số yêu cầu chờ duyệt
  - Cảnh báo thiết bị quá hạn

## FE Mới - Neo-Brutalism Design

Đã tạo folder FE hoàn toàn mới với:
- Thiết kế Neo-Brutalism (đen/trắng, viền dày, bóng cứng)
- Cấu trúc React + Vite đơn giản
- Routing rõ ràng theo role (user/admin)
- Các pages:
  - Login/Register (auth)
  - Student: Dashboard, Devices, Borrow, MyRequests, History
  - Admin: Dashboard, BorrowRequests, Devices, Statistics

## Database Scripts Bổ Sung

1. **10_Indexes_Performance.sql** - Tạo indexes cho performance
2. **11_AuditTrail.sql** - Bảng AuditLogs và triggers ghi nhận thay đổi
3. **12_Security_Roles.sql** - Phân quyền, LoginLogs, đổi mật khẩu
