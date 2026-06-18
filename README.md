# Neko's Workshop (nekovibecoder.site)

Chào mừng bạn đến với **Neko's Workshop** - Trang web "nhân bản số" (living profile) của lập trình viên, mô phỏng phòng thí nghiệm tương tác cá nhân thay vì portfolio truyền thống.

## 🚀 Tính Năng Nổi Bật

- **Màn hình khởi động (Boot Sequence)**: Giả lập quá trình boot hệ điều hành terminal cổ điển sử dụng hiệu ứng chuyển động của GSAP.
- **Terminal Tương Tác (`/terminal`)**: Người dùng có thể gõ các lệnh như `whoami`, `timeline`, `workshop-board`, `experiment-log`, `graveyard`, `skill-tree`, `galaxy`, `achievements`, `changelog` để xem dữ liệu.
- **Bảng Công Việc (`/workshop-board`)**: Bảng Kanban phân loại dự án (Research, Building, Archived) dựa trên trạng thái repository trên GitHub.
- **Nhật Ký Thí Nghiệm (`/experiment-log`)**: Mô tả chi tiết từng dự án dưới dạng báo cáo thí nghiệm khoa học máy tính.
- **Chòm Sao Dự Án (`/galaxy`)**: Bản đồ liên kết trực quan các repository bằng công nghệ GSAP + SVG.
- **Pipeline Dữ Liệu Tự Động**: Tự động đồng bộ commits, repositories, stars từ GitHub qua GitHub Actions hàng ngày.

## 🛠️ Công Nghệ Sử Dụng

- **Frontend**: Next.js 15 (App Router), Tailwind CSS 4, TypeScript
- **Hiệu Ứng Hoạt Ảnh**: GSAP (GreenSock Animation Platform) & `@gsap/react`
- **Biểu Tượng**: Lucide React
- **Pipeline & Phân Tích**: Node.js & GitHub Actions (cron-job)

## 📖 Hướng Dẫn Cấu Hình & Chạy Cục Bộ

Để bảo mật tuyệt đối cho kho chứa công khai (Public Repo), các tài liệu hướng dẫn kỹ thuật chi tiết, cấu hình biến môi trường `.env`, setup GitHub Actions workflow đã được tách ra thư mục riêng:

👉 **Xem hướng dẫn chi tiết tại đây: [.plan/guide.md](.plan/guide.md)**

---

&copy; {2026} Nguyễn Văn Hiếu. Phát triển bởi Antigravity AI Assistant.
