import type { Dictionary } from '@blocknote/core';
import { en } from '@blocknote/core/locales';

/** Thai UI strings for the product description BlockNote editor. */
export const productDescriptionDictionary: Dictionary = {
  ...en,
  slash_menu: {
    ...en.slash_menu,
    heading_2: {
      title: 'หัวข้อใหญ่',
      subtext: 'หัวข้อหลักของส่วน',
      aliases: ['h2', 'heading2', 'หัวข้อ', 'หัวข้อใหญ่'],
      group: 'หัวข้อ',
    },
    heading_3: {
      title: 'หัวข้อย่อย',
      subtext: 'หัวข้อย่อยภายในส่วน',
      aliases: ['h3', 'heading3', 'หัวข้อย่อย'],
      group: 'หัวข้อ',
    },
    quote: {
      title: 'คำพูดอ้างอิง',
      subtext: 'ข้อความอ้างอิงหรือเน้น',
      aliases: ['quote', 'blockquote', 'อ้างอิง'],
      group: 'บล็อกพื้นฐาน',
    },
    numbered_list: {
      title: 'รายการลำดับ',
      subtext: 'รายการที่มีลำดับตัวเลข',
      aliases: ['ol', 'numbered', 'ลำดับ', 'รายการลำดับ'],
      group: 'บล็อกพื้นฐาน',
    },
    bullet_list: {
      title: 'รายการหัวข้อ',
      subtext: 'รายการแบบไม่เรียงลำดับ',
      aliases: ['ul', 'bullet', 'รายการ', 'หัวข้อ'],
      group: 'บล็อกพื้นฐาน',
    },
    paragraph: {
      title: 'ย่อหน้า',
      subtext: 'ข้อความทั่วไป',
      aliases: ['p', 'paragraph', 'ย่อหน้า', 'ข้อความ'],
      group: 'บล็อกพื้นฐาน',
    },
    code_block: {
      title: 'โค้ด',
      subtext: 'บล็อกโค้ด',
      aliases: ['code', 'โค้ด'],
      group: 'บล็อกพื้นฐาน',
    },
    image: {
      title: 'รูปภาพ',
      subtext: 'อัปโหลดรูปในรายละเอียด',
      aliases: ['image', 'รูป', 'รูปภาพ', 'photo'],
      group: 'สื่อ',
    },
    divider: {
      title: 'เส้นคั่น',
      subtext: 'เส้นแบ่งส่วน',
      aliases: ['hr', 'divider', 'เส้นคั่น', 'เส้น'],
      group: 'บล็อกพื้นฐาน',
    },
  },
  placeholders: {
    ...en.placeholders,
    default: 'พิมพ์ / เพื่อเพิ่มบล็อก หรือเริ่มเขียน...',
    heading: 'หัวข้อ',
    bulletListItem: 'รายการ',
    numberedListItem: 'รายการ',
    emptyDocument: 'พิมพ์ / เพื่อเพิ่มบล็อก หรือเริ่มเขียน...',
  },
  file_blocks: {
    ...en.file_blocks,
    add_button_text: {
      ...en.file_blocks.add_button_text,
      image: 'เพิ่มรูปภาพ',
    },
  },
  side_menu: {
    add_block_label: 'เพิ่มบล็อก',
    drag_handle_label: 'ลากเพื่อจัดเรียง',
  },
  drag_handle: {
    ...en.drag_handle,
    delete_menuitem: 'ลบ',
    colors_menuitem: 'สี',
  },
  formatting_toolbar: {
    ...en.formatting_toolbar,
    bold: {
      tooltip: 'ตัวหนา',
      secondary_tooltip: 'Ctrl+B',
    },
    italic: {
      tooltip: 'ตัวเอียง',
      secondary_tooltip: 'Ctrl+I',
    },
    underline: {
      tooltip: 'ขีดเส้นใต้',
      secondary_tooltip: 'Ctrl+U',
    },
    strike: {
      tooltip: 'ขีดฆ่า',
      secondary_tooltip: 'Ctrl+Shift+S',
    },
    link: {
      tooltip: 'สร้างลิงก์',
      secondary_tooltip: 'Ctrl+K',
    },
  },
  file_panel: {
    upload: {
      title: 'อัปโหลด',
      file_placeholder: {
        ...en.file_panel.upload.file_placeholder,
        image: 'อัปโหลดรูปภาพ',
      },
      upload_error: 'อัปโหลดไม่สำเร็จ',
    },
    embed: {
      title: 'ฝังลิงก์',
      embed_button: {
        ...en.file_panel.embed.embed_button,
        image: 'ฝังรูปภาพ',
      },
      url_placeholder: 'วางลิงก์...',
    },
  },
  link_toolbar: {
    delete: {
      tooltip: 'ลบลิงก์',
    },
    edit: {
      text: 'แก้ไขลิงก์',
      tooltip: 'แก้ไข',
    },
    open: {
      tooltip: 'เปิดในแท็บใหม่',
    },
    form: {
      title_placeholder: 'ข้อความแสดงผล',
      url_placeholder: 'วางลิงก์...',
    },
  },
};
