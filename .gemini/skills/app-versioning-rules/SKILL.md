---
name: app-versioning-rules
description: Quản lý quy tắc đặt version (SemVer) và quy trình release cho ứng dụng. Sử dụng khi cần tăng version, chuẩn bị release hoặc kiểm tra tính tương thích của bản cập nhật.
---

# Application Update & Versioning Rules

Kỹ năng này đảm bảo ứng dụng tuân thủ nghiêm ngặt chuẩn Semantic Versioning (SemVer) và quy trình release đã đề ra trong dự án.

## 1. Quy tắc Semantic Versioning (MAJOR.MINOR.PATCH)

Khi thực hiện thay đổi mã nguồn, hãy xác định cấp độ version cần tăng:

- **MAJOR (X.0.0)**: Thay đổi lớn về kiến trúc, logic cốt lõi hoặc gây **breaking change**.
- **MINOR (0.X.0)**: Thêm tính năng mới, cải tiến UI/UX đáng kể nhưng giữ tính tương thích ngược.
- **PATCH (0.0.X)**: Sửa lỗi (bug fix), tối ưu hiệu năng hoặc các thay đổi nhỏ không ảnh hưởng logic chính.

### Thứ tự ưu tiên Pre-release:
`alpha` -> `beta` -> `rc` -> `release` (Ví dụ: `1.0.0-beta.1`)

## 2. Quy trình Release chuẩn

Khi chuẩn bị phát hành phiên bản mới, thực hiện theo các bước sau:

1. **Xác định loại version**: Dựa trên nội dung thay đổi.
2. **Cập nhật version**: Sử dụng lệnh npm để tự động hóa:
   - `npm version patch` (Sửa lỗi)
   - `npm version minor` (Tính năng mới)
   - `npm version major` (Thay đổi lớn)
3. **Kiểm tra**: Version phải được cập nhật TRƯỚC khi build production.
4. **Git**: Lệnh `npm version` sẽ tự động tạo commit và git tag.

## 3. Quy tắc bắt buộc

- **KHÔNG** thay đổi version thủ công trong `package.json` trừ khi có lý do đặc biệt.
- **KHÔNG** release hai phiên bản khác nhau nhưng trùng số version.
- **KHÔNG** bỏ qua các version trung gian (ví dụ: nhảy từ `1.0.0` lên `1.2.0` mà không qua `1.1.x`).
- So sánh phiên bản: Một bản cập nhật hợp lệ khi `remoteVersion > localVersion`.

## 4. Hành vi Auto-update (Tham khảo)

- **PATCH**: Tự động cập nhật im lặng.
- **MINOR**: Hiển thị thông báo và yêu cầu update.
- **MAJOR**: Bắt buộc người dùng xác nhận trước khi thực hiện.