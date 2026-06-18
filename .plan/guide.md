# Neko's Workshop - Hướng Dẫn Kỹ Thuật & Bảo Mật

Tài liệu này hướng dẫn cách cấu hình, vận hành và duy trì hệ thống pipeline dữ liệu của website **Neko's Workshop** (nekovibecoder.site).

---

## 1. Kiến Trúc Dự Án (Architecture Overview)

Dự án áp dụng mô hình **Tĩnh & Bảo mật (SSG/ISR)** để tích hợp dữ liệu động từ GitHub mà không gây ảnh hưởng đến hiệu năng hoặc rủi ro bảo mật:

```mermaid
flowchart LR
  A[GitHub API (REST/GraphQL)] --> B[fetch-github-data.js]
  B --> C[raw-github-data.json]
  C --> D[analyze-data.js]
  D --> E[timeline.json, dna.json, galaxy.json, achievements.json, changelog.json]
  E --> F[Vercel / Frontend Next.js]
```

- **Bước 1 (Pipeline hàng đêm)**: Một GitHub Actions Workflow tự động chạy mỗi đêm, gọi API GitHub để lấy dữ liệu công khai.
- **Bước 2 (Phân tích dữ liệu)**: Dữ liệu thô được phân tích và chuyển đổi thành các file JSON tĩnh trong thư mục `src/data/`.
- **Bước 3 (Biên dịch tĩnh)**: Next.js đọc dữ liệu từ các file JSON này tại thời điểm biên dịch (build time).
- **Ưu điểm**:
  - Không bao giờ truyền `GITHUB_TOKEN` hoặc các API keys của OpenAI xuống trình duyệt của người dùng (bảo mật tuyệt đối).
  - Tải trang tức thì và không phụ thuộc vào trạng thái uptime của GitHub API.
  - Zero server cost (chạy tĩnh trên CDN của Vercel).

---

## 2. Thiết Lập Biến Môi Trường (.env)

Để chạy thử nghiệm cục bộ, bạn cần tạo file `.env` từ file `.env.example`:

```bash
cp .env.example .env
```

Cấu hình các biến trong `.env`:
- `GITHUB_TOKEN`: Token cá nhân của GitHub (Personal Access Token). Token này chỉ cần quyền đọc dữ liệu công khai (`read:user` hoặc `public_repo`).
- `OPENAI_API_KEY` (Tùy chọn): Khóa API OpenAI dùng để phân tích nâng cao. Nếu bỏ trống, script sẽ tự động chuyển sang phân tích tĩnh (heuristics) bằng TypeScript/JavaScript.

**LƯU Ý QUAN TRỌNG**: File `.env` đã được cấu hình trong `.gitignore` để không bao giờ bị đẩy lên kho chứa công khai (Public Repository). Tuyệt đối không xóa dòng `.env*` khỏi `.gitignore`.

---

## 3. Thiết Lập GitHub Actions Workflow

Khi đẩy dự án lên GitHub, bạn cần thiết lập biến môi trường để workflow tự động chạy thành công:

1. Truy cập vào kho chứa trên GitHub (GitHub Repo) -> **Settings** -> **Secrets and variables** -> **Actions**.
2. Thêm một Secret mới:
   - Tên: `GITHUB_TOKEN` (Thông thường GitHub tự động cấp token này với quyền đọc, nhưng nếu bạn cần phân tích các repo private hoặc nâng cao hơn, bạn có thể tạo một Personal Access Token riêng và lưu vào đây).
   - Quyền hạn: Đảm bảo thiết lập quyền Write cho GITHUB_TOKEN tại mục **Settings** -> **Actions** -> **General** -> **Workflow permissions** chọn **Read and write permissions** để workflow có thể tự động commit ngược các file JSON tĩnh về repo.

---

## 4. Quy Tắc Bảo Mật Dữ Liệu & Quyền Riêng Tư

Để tránh lộ thông tin nhạy cảm của cá nhân trên repo public:
1. **Số điện thoại**: Đã được loại bỏ hoàn toàn khỏi tất cả cấu trúc hiển thị và dữ liệu JSON tĩnh. Chỉ hiển thị Email liên hệ và Discord ID.
2. **Secrets**: Tuyệt đối không viết trực tiếp bất kỳ Token, API Key hay thông tin xác thực nào vào mã nguồn của Next.js (thư mục `src/`).
3. **Mã nguồn GitHub**: Chỉ fetch và phân tích các kho lưu trữ công khai (public).
