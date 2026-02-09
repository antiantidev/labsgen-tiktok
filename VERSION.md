# Quy tắc Update & Versioning cho Ứng Dụng

Tài liệu này quy định **cách đặt version**, **khi nào tăng version**, và **quy trình update/release** cho ứng dụng (đặc biệt phù hợp với Electron / Desktop App / SaaS).

---

## 1. Chuẩn Version sử dụng

Ứng dụng **BẮT BUỘC** sử dụng chuẩn **Semantic Versioning (SemVer)**:

```
MAJOR.MINOR.PATCH
```

Ví dụ:

```
1.4.2
```

---

## 2. Ý nghĩa từng cấp Version

### 2.1 MAJOR (X.0.0)

Tăng **MAJOR** khi:

* Có thay đổi lớn về kiến trúc
* Thay đổi logic cốt lõi
* Gây **breaking change** (không tương thích version cũ)

Ví dụ:

```
1.5.0 → 2.0.0
```

---

### 2.2 MINOR (0.X.0)

Tăng **MINOR** khi:

* Thêm tính năng mới
* Cải tiến UI/UX đáng kể
* Không phá vỡ logic cũ

Ví dụ:

```
1.2.0 → 1.3.0
```

---

### 2.3 PATCH (0.0.X)

Tăng **PATCH** khi:

* Fix bug
* Tối ưu hiệu năng
* Sửa lỗi nhỏ, không thay đổi behavior chính

Ví dụ:

```
1.2.3 → 1.2.4
```

---

## 3. Quy ước Version theo giai đoạn phát triển

| Giai đoạn         | Version mẫu   |
| ----------------- | ------------- |
| Development       | 0.1.0 – 0.9.x |
| Alpha             | 1.0.0-alpha   |
| Beta              | 1.0.0-beta.1  |
| Release Candidate | 1.0.0-rc.1    |
| Production        | 1.0.0         |

---

## 4. Pre-release Version (khuyến nghị)

Sử dụng khi phát hành thử nghiệm:

```
1.2.0-alpha
1.2.0-beta.1
1.2.0-beta.2
1.2.0-rc.1
```

Thứ tự ưu tiên:

```
alpha → beta → rc → release
```

---

## 5. Quy tắc Update ứng dụng

### 5.1 Điều kiện có update

Ứng dụng được coi là có bản update khi:

```
remoteVersion > localVersion
```

So sánh theo chuẩn **SemVer**.

---

### 5.2 Hành vi theo loại update

| Loại  | Hành vi                |
| ----- | ---------------------- |
| PATCH | Auto-update im lặng    |
| MINOR | Thông báo + update     |
| MAJOR | Bắt buộc xác nhận user |

---

## 6. Quy tắc thay đổi Version

* ❌ Không thay đổi version khi chưa merge code
* ❌ Không release 2 version khác nhau cùng số
* ✅ Mỗi version = 1 release duy nhất
* ✅ Version phải được update **trước khi build production**

---

## 7. Quy trình Release chuẩn

1. Hoàn thành feature / fix bug
2. Quyết định loại version cần tăng (MAJOR / MINOR / PATCH)
3. Update `version` trong `package.json`
4. Build ứng dụng
5. Tag version trên Git
6. Publish release

---

## 8. Tool khuyến nghị

Sử dụng npm để quản lý version:

```bash
npm version patch   # Fix bug
npm version minor   # Thêm feature
npm version major   # Breaking change
```

Tool sẽ tự động:

* Update `package.json`
* Tạo git commit
* Tạo git tag

---

## 9. Quy tắc bắt buộc

* Version **BẮT BUỘC** tuân theo SemVer
* Không được bỏ qua version
* Không chỉnh sửa version thủ công trên production
* Version là căn cứ cho auto-update & support

---

## 10. Ghi chú

Tài liệu này là **rule chính thức** cho toàn bộ dự án.
Mọi hệ thống build, update, auto-update đều phải tuân theo quy tắc này.
