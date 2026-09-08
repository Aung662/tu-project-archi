/**
 * The people behind the archive. Rendered on the /about page. Editing a value
 * here updates the About page — keep photos in /public/founders/.
 *
 * `phone` is optional; leave '' to hide the phone row. `email`/`facebook` are
 * optional too. Photos are 640x800 (4:5) portraits.
 */
export interface Founder {
  name: string;
  role: { my: string; en: string };
  studentId: string; // e.g. "5EC-8"
  department: { my: string; en: string };
  phone?: string;
  email?: string;
  facebook?: string;
  photo: string; // path under /public
}

export const FOUNDERS: Founder[] = [
  {
    name: 'Kyal Sin Thant',
    role: { my: 'တွဲဖက်တည်ထောင်သူ • ဒီဇိုင်း', en: 'Co-founder • Design' },
    studentId: '5EC-3',
    department: { my: 'အီလက်ထရွန်းနစ် ဌာန', en: 'Electronic Department' },
    phone: '098484884',
    photo: '/founders/kyal-sin-thant.png',
  },
  {
    name: 'Aung Kham Oo',
    role: { my: 'တည်ထောင်သူ • Developer', en: 'Founder • Developer' },
    studentId: '5EC-8',
    department: { my: 'အီလက်ထရွန်းနစ် ဌာန', en: 'Electronic Department' },
    phone: '098484884',
    email: 'aungkhamoo60@gmail.com',
    photo: '/founders/aung-kham-oo.png',
  },
];
