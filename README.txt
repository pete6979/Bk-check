BK SureCheck PWA v1.2.0
======================

ไฟล์ในชุดนี้
- index.html: โค้ดแอป Version 1.1 เดิม พร้อมเพิ่ม PWA registration และการเรียก html5-qrcode แบบระบุเวอร์ชัน
- manifest.json: ชื่อ ไอคอน และโหมด Standalone
- service-worker.js: Cache shell, offline navigation และ cache ไลบรารีสแกนแบบ best-effort
- icons/: ไอคอน 192x192 และ 512x512

ติดตั้งบน GitHub Pages (ทำผ่านมือถือได้)
1. แตกไฟล์ ZIP ในเครื่อง หรืออัปโหลดไฟล์ภายในโฟลเดอร์ BK-SureCheck-PWA ไปยัง Repository
2. ให้วาง index.html, manifest.json และ service-worker.js ไว้ในตำแหน่งเดียวกันที่เป็นรากของเว็บไซต์ (root ของ repository สำหรับ project site)
3. อัปโหลดไฟล์ icon-192.png และ icon-512.png ที่ root เดียวกับ index.html
4. Commit changes และรอ GitHub Pages เผยแพร่
5. เปิด URL เว็บไซต์ด้วย Chrome Android ผ่าน HTTPS
6. เปิดเมนู Chrome (⋮) แล้วเลือก Install app / Add to Home screen ตามตัวเลือกที่แสดง
7. เปิด BK SureCheck จากไอคอนบนหน้าจอ

GitHub Pages root และ subfolder
- ไฟล์ทั้งหมดใช้ relative paths (./...) และ Service Worker scope คำนวณจากตำแหน่งไฟล์ จึงรองรับทั้ง user/organization site และ project repository site
- สำหรับ Project Pages ให้เก็บไฟล์ทั้งหมดที่ root ของ repository ที่เปิดใช้ Pages; ถ้าใช้โฟลเดอร์ /docs ให้เก็บไฟล์ทั้งหมดไว้ใน /docs

ข้อมูลเดิม
- ชื่อ Local Storage keys dc_products, dc_history และ bksc_active_v1 ไม่ถูกเปลี่ยน
- ห้ามล้าง Site data / Clear storage / Clear browsing data ก่อนสำรองข้อมูล
- Local Storage แยกตาม Origin และอุปกรณ์; การย้ายจาก file:// หรือ URL เดิมไป GitHub Pages ไม่ได้ย้ายข้อมูลอัตโนมัติ ให้ใช้ Backup JSON จากอุปกรณ์เดิม แล้ว Restore บน URL ใหม่

Barcode และการใช้งานออฟไลน์
- BarcodeDetector: เป็น API ของเบราว์เซอร์ ไม่ใช่ไลบรารีที่ PWA ดาวน์โหลดมาให้; ต้องตรวจว่ารองรับรูปแบบบาร์โค้ดและกล้องบนอุปกรณ์จริงหรือไม่
- html5-qrcode: ปักหมุดเวอร์ชัน 2.3.8 และ Service Worker พยายาม cache ไฟล์จาก unpkg แบบ opaque ระหว่างติดตั้งหรือเมื่อเรียกใช้งานครั้งแรก หาก cache สำเร็จจึงมีโอกาสใช้ fallback กล้องออฟไลน์ได้
- หาก CDN ไม่ตอบสนองในช่วงติดตั้ง/ออนไลน์ครั้งแรก หรือเบราว์เซอร์ไม่ยอมให้ cache opaque response กล้อง fallback จะยังใช้ไม่ได้ออฟไลน์; เครื่องสแกน USB/Bluetooth แบบ keyboard wedge ยังทำงานได้โดยไม่ต้องใช้ไลบรารีกล้อง
- กล้องต้องเปิดผ่าน HTTPS และอนุญาตสิทธิ์กล้อง

การจัดการ Cache Version
- เมื่อออกเวอร์ชันใหม่ ให้เปลี่ยน CACHE_VERSION และ RUNTIME_CACHE ใน service-worker.js ทุกครั้ง
- เปลี่ยนไฟล์ใน GitHub แล้วรอ deploy จากนั้นปิด/เปิดแอปหรือ reload เพื่อให้ Service Worker ใหม่ติดตั้ง
- Service Worker ลบเฉพาะ cache ที่ขึ้นต้นด้วย bksc- และไม่แตะ Local Storage
- หลังอัปเดตให้ตรวจสถานะและทำรายการทดสอบก่อนใช้งานจริง

รายการทดสอบก่อนใช้งานจริง
[ ] Chrome Android เปิดหน้าเว็บ HTTPS ได้
[ ] ติดตั้งจาก Chrome และเปิดแบบ Standalone ได้
[ ] หน้าตรวจสินค้า/สินค้า/ประวัติ/รายงานแสดงผลครบ
[ ] เพิ่มสินค้าและนำเข้า CSV ได้
[ ] Picking สแกนถูก/ผิดรุ่นและจำนวนเกินได้ถูกต้อง
[ ] เปลี่ยนไป Verification ได้เมื่อหยิบครบ
[ ] Verification ตรวจจำนวนและป้องกันปิดบิลก่อนครบได้
[ ] ปิดบิลแล้วประวัติและรายงานอัปเดต
[ ] Backup และ Restore JSON ได้
[ ] รีเฟรชหน้าและกลับเข้าบิลค้างได้
[ ] เปิดแอปแบบ Offline หลังเปิดออนไลน์อย่างน้อยหนึ่งครั้งได้
[ ] เครื่องสแกน USB/Bluetooth ทำงานได้
[ ] BarcodeDetector ทดสอบกับบาร์โค้ดสินค้าจริงบนอุปกรณ์เป้าหมาย
[ ] html5-qrcode ทดสอบออนไลน์และตรวจว่าถูก cache แล้วจึงทดสอบออฟไลน์
[ ] อัปเดต CACHE_VERSION แล้วหน้าใหม่โหลดได้และข้อมูล Local Storage ยังอยู่
[ ] ทดสอบ Chrome Desktop และ Android แยกกัน

ข้อจำกัดและสถานะ
- ชุดนี้ยังไม่ได้ทดสอบบนมือถือ Android หรือคอมพิวเตอร์จริงในสภาพแวดล้อมของบริษัท
- การ cache ไลบรารี CDN เป็น best-effort; ต้องตรวจผ่าน DevTools/การทดสอบจริงก่อนอ้างว่าสแกนกล้องออฟไลน์ได้
- ข้อมูลยังเก็บใน Local Storage เฉพาะเบราว์เซอร์/อุปกรณ์ ไม่มี cloud sync หรือ multi-device sync
- ควรสำรองข้อมูลก่อนทดลองกับข้อมูลจริง และไม่ใช้ข้อมูลลูกค้าส่วนบุคคลในบิลทดลอง
