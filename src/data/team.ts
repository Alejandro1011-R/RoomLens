/* ============================================================
   RoomLens — team roster.

   Single source of truth for the Team section. Team.astro
   imports TEAM and renders one static card per entry at build
   time: no canvas, no client-side JS.

   ── How to add or edit a member ─────────────────────────────
   1. Add an object to TEAM. Order in the array is the order
      the cards appear in the grid.
   2. `photo` is the file name only, relative to `public/team/`
      (e.g. 'ken.png'). The component prefixes it with the
      site's base path, so never write '/RoomLens/...' here.
      Put the file in `public/team/` first; keep the name
      lowercase and hyphenated, and match the real extension
      (.jpg / .jpeg / .png).
   3. If `photo` is absent (or undefined), the card renders the
      pending placeholder instead: the member's `initials` on
      the inset ground, plus a "photo pending" tag. Nothing
      else changes — same square box, same name and role.
      Add the photo later and the placeholder disappears.
   4. `initials` is only shown by that placeholder, but it is
      required so a member never renders an empty box if their
      photo is removed.
   ============================================================ */

export interface TeamMember {
  /** Full name, as the person writes it. Shown as the card heading. */
  name: string;
  /** Job title. Rendered in the mono accent label above the name. */
  role: string;
  /** File name inside `public/team/`. Omit while the photo is pending. */
  photo?: string;
  /** Fallback shown in the portrait box when `photo` is omitted. */
  initials: string;
}

export const TEAM: TeamMember[] = [
  {
    name: 'Aye Nyein Thaw (Alexander)',
    role: 'CEO & Co-Founder',
    photo: 'aye-nyein-thaw.jpg',
    initials: 'AN',
  },
  {
    name: 'Alejandro Ramirez Trueba',
    role: 'CTO & Co-Founder',
    photo: 'alejandro-ramirez-trueba.jpeg',
    initials: 'AR',
  },
  {
    name: 'Alizhan Nurakhmetov',
    role: 'CIO & Co-Founder',
    photo: 'alizhan-nurakhmetov.jpeg',
    initials: 'AN',
  },
  {
    name: 'Mayda Morales Viera',
    role: 'CXO · CMO & Co-Founder',
    photo: 'mayda-morales-viera.jpeg',
    initials: 'MM',
  },
  {
    name: 'Ken Thaw Zin',
    role: 'Business Development Adviser & Co-Founder',
    photo: 'ken.png',
    initials: 'KT',
  },
  {
    name: 'Daniel Cardenas',
    role: 'Lead Full Stack Developer & Co-Founder',
    photo: 'daniel.jpg',
    initials: 'DC',
  },
];
