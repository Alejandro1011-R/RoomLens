/* ============================================================
   RoomLens — team roster.

   Single source of truth for the Team section. Team.astro
   imports TEAM and renders one static card per entry at build
   time: no canvas, no client-side JS.

   ── How to add or edit a member ─────────────────────────────
   1. Add an object to TEAM. Order in the array is the order
      the cards appear in the grid.
   2. `bio` is one line about what the role covers — same
      register as the others. Keep it to the role; do not add
      biography, employment history or personal detail.
   3. `photo` is the file name only, relative to `public/team/`
      (e.g. 'ken.png'). The component prefixes it with the
      site's base path, so never write '/RoomLens/...' here.
      Put the file in `public/team/` first; keep the name
      lowercase and hyphenated, and match the real extension
      (.jpg / .jpeg / .png).
   4. If `photo` is absent (or undefined), the card renders the
      pending placeholder instead: the member's `initials` on
      the inset ground, plus a "photo pending" tag. Nothing
      else changes — same 4:3 box, same name, role and bio.
      Add the photo later and the placeholder disappears.
   5. `initials` is only shown by that placeholder, but it is
      required so a member never renders an empty box if their
      photo is removed.
   ============================================================ */

export interface TeamMember {
  /** Full name, as the person writes it. Shown as the card heading. */
  name: string;
  /** Job title. Rendered in the mono accent label above the name. */
  role: string;
  /** One line on what the role covers. */
  bio: string;
  /** File name inside `public/team/`. Omit while the photo is pending. */
  photo?: string;
  /** Fallback shown in the portrait box when `photo` is omitted. */
  initials: string;
}

export const TEAM: TeamMember[] = [
  {
    name: 'Aye Nyein Thaw (Alexander)',
    role: 'CEO',
    bio: 'Company direction: what RoomLens builds, who it is for, and what comes first.',
    photo: 'aye-nyein-thaw.jpg',
    initials: 'AN',
  },
  {
    name: 'Alejandro Ramirez Trueba',
    role: 'CTO',
    bio: 'Technical direction: the reconstruction pipeline and the platform it runs on.',
    photo: 'alejandro-ramirez-trueba.jpeg',
    initials: 'AR',
  },
  {
    name: 'Alizhan Nurakhmetov',
    role: 'CIO',
    bio: 'Information systems and data: how what we capture is stored, governed and served.',
    photo: 'alizhan-nurakhmetov.jpeg',
    initials: 'AN',
  },
  {
    name: 'Mayda Morales Viera',
    role: 'CXO · CMO',
    bio: 'Product experience and growth: how it looks, how it is told, and who adopts it.',
    photo: 'mayda-morales-viera.jpeg',
    initials: 'MM',
  },
  {
    name: 'Ken',
    role: 'Business Development Adviser',
    bio: 'Partnerships and market entry: which doors to open, and in what order.',
    photo: 'ken.png',
    initials: 'K',
  },
  {
    name: 'Daniel',
    role: 'Lead Full Stack Developer',
    bio: 'End-to-end delivery: the capture app, the web viewer and the services behind them.',
    photo: 'daniel.jpg',
    initials: 'D',
  },
];
