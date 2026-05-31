export default function HeroCapsulesBg() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 1440 600"
      preserveAspectRatio="xMidYMid slice"
      className="absolute inset-0 w-full h-full"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="hcs" x1="15%" y1="8%" x2="85%" y2="92%">
          <stop offset="0%" stopColor="white" stopOpacity="0.55" />
          <stop offset="65%" stopColor="white" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* ── ROW 1 ── */}
      {/* coral-red R=25 */}
      <g transform="translate(90,55) rotate(-22)" opacity="0.9">
        <ellipse cx="3" cy="28" rx="21" ry="6" fill="black" opacity=".2"/>
        <path d="M-25,0Q-25,25,0,25Q25,25,25,0Z" fill="#ffb3c6"/>
        <path d="M-25,0Q-25,-25,0,-25Q25,-25,25,0Z" fill="#ff3366"/>
        <path d="M-25,0Q-25,-25,0,-25Q25,-25,25,0Z" fill="url(#hcs)"/>
        <rect x="-25" y="-2.5" width="50" height="5" fill="white" opacity=".15" rx="1"/>
        <ellipse cx="-9" cy="-13" rx="8" ry="5" fill="white" opacity=".5" transform="rotate(-25,-9,-13)"/>
      </g>

      {/* blue R=35 */}
      <g transform="translate(232,72) rotate(12)" opacity="0.9">
        <ellipse cx="4" cy="39" rx="30" ry="9" fill="black" opacity=".18"/>
        <path d="M-35,0Q-35,35,0,35Q35,35,35,0Z" fill="#93c5fd"/>
        <path d="M-35,0Q-35,-35,0,-35Q35,-35,35,0Z" fill="#2563eb"/>
        <path d="M-35,0Q-35,-35,0,-35Q35,-35,35,0Z" fill="url(#hcs)"/>
        <rect x="-35" y="-3.5" width="70" height="7" fill="white" opacity=".15" rx="1"/>
        <ellipse cx="-12" cy="-18" rx="11" ry="7" fill="white" opacity=".5" transform="rotate(-25,-12,-18)"/>
      </g>

      {/* yellow R=16 */}
      <g transform="translate(385,50) rotate(-8)" opacity="0.85">
        <path d="M-16,0Q-16,16,0,16Q16,16,16,0Z" fill="#fde68a"/>
        <path d="M-16,0Q-16,-16,0,-16Q16,-16,16,0Z" fill="#f59e0b"/>
        <path d="M-16,0Q-16,-16,0,-16Q16,-16,16,0Z" fill="url(#hcs)"/>
        <rect x="-16" y="-1.5" width="32" height="3" fill="white" opacity=".13" rx="1"/>
        <ellipse cx="-6" cy="-8" rx="5" ry="3" fill="white" opacity=".45" transform="rotate(-25,-6,-8)"/>
      </g>

      {/* green R=25 */}
      <g transform="translate(510,68) rotate(25)" opacity="0.9">
        <ellipse cx="3" cy="28" rx="21" ry="6" fill="black" opacity=".2"/>
        <path d="M-25,0Q-25,25,0,25Q25,25,25,0Z" fill="#6ee7b7"/>
        <path d="M-25,0Q-25,-25,0,-25Q25,-25,25,0Z" fill="#10b981"/>
        <path d="M-25,0Q-25,-25,0,-25Q25,-25,25,0Z" fill="url(#hcs)"/>
        <rect x="-25" y="-2.5" width="50" height="5" fill="white" opacity=".15" rx="1"/>
        <ellipse cx="-9" cy="-13" rx="8" ry="5" fill="white" opacity=".5" transform="rotate(-25,-9,-13)"/>
      </g>

      {/* purple R=35 */}
      <g transform="translate(652,55) rotate(-15)" opacity="0.9">
        <ellipse cx="4" cy="39" rx="30" ry="9" fill="black" opacity=".18"/>
        <path d="M-35,0Q-35,35,0,35Q35,35,35,0Z" fill="#e9d5ff"/>
        <path d="M-35,0Q-35,-35,0,-35Q35,-35,35,0Z" fill="#9333ea"/>
        <path d="M-35,0Q-35,-35,0,-35Q35,-35,35,0Z" fill="url(#hcs)"/>
        <rect x="-35" y="-3.5" width="70" height="7" fill="white" opacity=".15" rx="1"/>
        <ellipse cx="-12" cy="-18" rx="11" ry="7" fill="white" opacity=".5" transform="rotate(-25,-12,-18)"/>
      </g>

      {/* orange R=16 */}
      <g transform="translate(798,70) rotate(10)" opacity="0.85">
        <path d="M-16,0Q-16,16,0,16Q16,16,16,0Z" fill="#fed7aa"/>
        <path d="M-16,0Q-16,-16,0,-16Q16,-16,16,0Z" fill="#ea580c"/>
        <path d="M-16,0Q-16,-16,0,-16Q16,-16,16,0Z" fill="url(#hcs)"/>
        <rect x="-16" y="-1.5" width="32" height="3" fill="white" opacity=".13" rx="1"/>
        <ellipse cx="-6" cy="-8" rx="5" ry="3" fill="white" opacity=".45" transform="rotate(-25,-6,-8)"/>
      </g>

      {/* cyan R=25 */}
      <g transform="translate(942,58) rotate(-28)" opacity="0.9">
        <ellipse cx="3" cy="28" rx="21" ry="6" fill="black" opacity=".2"/>
        <path d="M-25,0Q-25,25,0,25Q25,25,25,0Z" fill="#a5f3fc"/>
        <path d="M-25,0Q-25,-25,0,-25Q25,-25,25,0Z" fill="#0891b2"/>
        <path d="M-25,0Q-25,-25,0,-25Q25,-25,25,0Z" fill="url(#hcs)"/>
        <rect x="-25" y="-2.5" width="50" height="5" fill="white" opacity=".15" rx="1"/>
        <ellipse cx="-9" cy="-13" rx="8" ry="5" fill="white" opacity=".5" transform="rotate(-25,-9,-13)"/>
      </g>

      {/* hot-pink R=35 */}
      <g transform="translate(1085,72) rotate(20)" opacity="0.9">
        <ellipse cx="4" cy="39" rx="30" ry="9" fill="black" opacity=".18"/>
        <path d="M-35,0Q-35,35,0,35Q35,35,35,0Z" fill="#fbcfe8"/>
        <path d="M-35,0Q-35,-35,0,-35Q35,-35,35,0Z" fill="#db2777"/>
        <path d="M-35,0Q-35,-35,0,-35Q35,-35,35,0Z" fill="url(#hcs)"/>
        <rect x="-35" y="-3.5" width="70" height="7" fill="white" opacity=".15" rx="1"/>
        <ellipse cx="-12" cy="-18" rx="11" ry="7" fill="white" opacity=".5" transform="rotate(-25,-12,-18)"/>
      </g>

      {/* red R=25 */}
      <g transform="translate(1228,52) rotate(-10)" opacity="0.88">
        <ellipse cx="3" cy="28" rx="21" ry="6" fill="black" opacity=".2"/>
        <path d="M-25,0Q-25,25,0,25Q25,25,25,0Z" fill="#fca5a5"/>
        <path d="M-25,0Q-25,-25,0,-25Q25,-25,25,0Z" fill="#ef4444"/>
        <path d="M-25,0Q-25,-25,0,-25Q25,-25,25,0Z" fill="url(#hcs)"/>
        <rect x="-25" y="-2.5" width="50" height="5" fill="white" opacity=".15" rx="1"/>
        <ellipse cx="-9" cy="-13" rx="8" ry="5" fill="white" opacity=".5" transform="rotate(-25,-9,-13)"/>
      </g>

      {/* blue R=16 */}
      <g transform="translate(1382,66) rotate(18)" opacity="0.85">
        <path d="M-16,0Q-16,16,0,16Q16,16,16,0Z" fill="#bfdbfe"/>
        <path d="M-16,0Q-16,-16,0,-16Q16,-16,16,0Z" fill="#3b82f6"/>
        <path d="M-16,0Q-16,-16,0,-16Q16,-16,16,0Z" fill="url(#hcs)"/>
        <rect x="-16" y="-1.5" width="32" height="3" fill="white" opacity=".13" rx="1"/>
        <ellipse cx="-6" cy="-8" rx="5" ry="3" fill="white" opacity=".45" transform="rotate(-25,-6,-8)"/>
      </g>

      {/* ── ROW 2 ── */}
      {/* cyan R=16 */}
      <g transform="translate(62,192) rotate(24)" opacity="0.85">
        <path d="M-16,0Q-16,16,0,16Q16,16,16,0Z" fill="#cffafe"/>
        <path d="M-16,0Q-16,-16,0,-16Q16,-16,16,0Z" fill="#06b6d4"/>
        <path d="M-16,0Q-16,-16,0,-16Q16,-16,16,0Z" fill="url(#hcs)"/>
        <rect x="-16" y="-1.5" width="32" height="3" fill="white" opacity=".13" rx="1"/>
        <ellipse cx="-6" cy="-8" rx="5" ry="3" fill="white" opacity=".45" transform="rotate(-25,-6,-8)"/>
      </g>

      {/* yellow R=25 */}
      <g transform="translate(205,185) rotate(-14)" opacity="0.9">
        <ellipse cx="3" cy="28" rx="21" ry="6" fill="black" opacity=".2"/>
        <path d="M-25,0Q-25,25,0,25Q25,25,25,0Z" fill="#fef9c3"/>
        <path d="M-25,0Q-25,-25,0,-25Q25,-25,25,0Z" fill="#ca8a04"/>
        <path d="M-25,0Q-25,-25,0,-25Q25,-25,25,0Z" fill="url(#hcs)"/>
        <rect x="-25" y="-2.5" width="50" height="5" fill="white" opacity=".15" rx="1"/>
        <ellipse cx="-9" cy="-13" rx="8" ry="5" fill="white" opacity=".5" transform="rotate(-25,-9,-13)"/>
      </g>

      {/* orange R=35 */}
      <g transform="translate(350,198) rotate(20)" opacity="0.9">
        <ellipse cx="4" cy="39" rx="30" ry="9" fill="black" opacity=".18"/>
        <path d="M-35,0Q-35,35,0,35Q35,35,35,0Z" fill="#ffedd5"/>
        <path d="M-35,0Q-35,-35,0,-35Q35,-35,35,0Z" fill="#f97316"/>
        <path d="M-35,0Q-35,-35,0,-35Q35,-35,35,0Z" fill="url(#hcs)"/>
        <rect x="-35" y="-3.5" width="70" height="7" fill="white" opacity=".15" rx="1"/>
        <ellipse cx="-12" cy="-18" rx="11" ry="7" fill="white" opacity=".5" transform="rotate(-25,-12,-18)"/>
      </g>

      {/* hot-pink R=25 */}
      <g transform="translate(492,186) rotate(-22)" opacity="0.9">
        <ellipse cx="3" cy="28" rx="21" ry="6" fill="black" opacity=".2"/>
        <path d="M-25,0Q-25,25,0,25Q25,25,25,0Z" fill="#fce7f3"/>
        <path d="M-25,0Q-25,-25,0,-25Q25,-25,25,0Z" fill="#ec4899"/>
        <path d="M-25,0Q-25,-25,0,-25Q25,-25,25,0Z" fill="url(#hcs)"/>
        <rect x="-25" y="-2.5" width="50" height="5" fill="white" opacity=".15" rx="1"/>
        <ellipse cx="-9" cy="-13" rx="8" ry="5" fill="white" opacity=".5" transform="rotate(-25,-9,-13)"/>
      </g>

      {/* coral-red R=35 */}
      <g transform="translate(636,195) rotate(8)" opacity="0.92">
        <ellipse cx="4" cy="39" rx="30" ry="9" fill="black" opacity=".18"/>
        <path d="M-35,0Q-35,35,0,35Q35,35,35,0Z" fill="#fecdd3"/>
        <path d="M-35,0Q-35,-35,0,-35Q35,-35,35,0Z" fill="#f43f5e"/>
        <path d="M-35,0Q-35,-35,0,-35Q35,-35,35,0Z" fill="url(#hcs)"/>
        <rect x="-35" y="-3.5" width="70" height="7" fill="white" opacity=".15" rx="1"/>
        <ellipse cx="-12" cy="-18" rx="11" ry="7" fill="white" opacity=".5" transform="rotate(-25,-12,-18)"/>
      </g>

      {/* green R=16 */}
      <g transform="translate(788,184) rotate(-18)" opacity="0.85">
        <path d="M-16,0Q-16,16,0,16Q16,16,16,0Z" fill="#bbf7d0"/>
        <path d="M-16,0Q-16,-16,0,-16Q16,-16,16,0Z" fill="#16a34a"/>
        <path d="M-16,0Q-16,-16,0,-16Q16,-16,16,0Z" fill="url(#hcs)"/>
        <rect x="-16" y="-1.5" width="32" height="3" fill="white" opacity=".13" rx="1"/>
        <ellipse cx="-6" cy="-8" rx="5" ry="3" fill="white" opacity=".45" transform="rotate(-25,-6,-8)"/>
      </g>

      {/* purple R=25 */}
      <g transform="translate(932,198) rotate(30)" opacity="0.9">
        <ellipse cx="3" cy="28" rx="21" ry="6" fill="black" opacity=".2"/>
        <path d="M-25,0Q-25,25,0,25Q25,25,25,0Z" fill="#ede9fe"/>
        <path d="M-25,0Q-25,-25,0,-25Q25,-25,25,0Z" fill="#7c3aed"/>
        <path d="M-25,0Q-25,-25,0,-25Q25,-25,25,0Z" fill="url(#hcs)"/>
        <rect x="-25" y="-2.5" width="50" height="5" fill="white" opacity=".15" rx="1"/>
        <ellipse cx="-9" cy="-13" rx="8" ry="5" fill="white" opacity=".5" transform="rotate(-25,-9,-13)"/>
      </g>

      {/* blue R=35 */}
      <g transform="translate(1078,186) rotate(-6)" opacity="0.9">
        <ellipse cx="4" cy="39" rx="30" ry="9" fill="black" opacity=".18"/>
        <path d="M-35,0Q-35,35,0,35Q35,35,35,0Z" fill="#dbeafe"/>
        <path d="M-35,0Q-35,-35,0,-35Q35,-35,35,0Z" fill="#1d4ed8"/>
        <path d="M-35,0Q-35,-35,0,-35Q35,-35,35,0Z" fill="url(#hcs)"/>
        <rect x="-35" y="-3.5" width="70" height="7" fill="white" opacity=".15" rx="1"/>
        <ellipse cx="-12" cy="-18" rx="11" ry="7" fill="white" opacity=".5" transform="rotate(-25,-12,-18)"/>
      </g>

      {/* cyan R=25 */}
      <g transform="translate(1222,195) rotate(16)" opacity="0.88">
        <ellipse cx="3" cy="28" rx="21" ry="6" fill="black" opacity=".2"/>
        <path d="M-25,0Q-25,25,0,25Q25,25,25,0Z" fill="#cffafe"/>
        <path d="M-25,0Q-25,-25,0,-25Q25,-25,25,0Z" fill="#0e7490"/>
        <path d="M-25,0Q-25,-25,0,-25Q25,-25,25,0Z" fill="url(#hcs)"/>
        <rect x="-25" y="-2.5" width="50" height="5" fill="white" opacity=".15" rx="1"/>
        <ellipse cx="-9" cy="-13" rx="8" ry="5" fill="white" opacity=".5" transform="rotate(-25,-9,-13)"/>
      </g>

      {/* yellow R=16 */}
      <g transform="translate(1390,184) rotate(-24)" opacity="0.85">
        <path d="M-16,0Q-16,16,0,16Q16,16,16,0Z" fill="#fef08a"/>
        <path d="M-16,0Q-16,-16,0,-16Q16,-16,16,0Z" fill="#eab308"/>
        <path d="M-16,0Q-16,-16,0,-16Q16,-16,16,0Z" fill="url(#hcs)"/>
        <rect x="-16" y="-1.5" width="32" height="3" fill="white" opacity=".13" rx="1"/>
        <ellipse cx="-6" cy="-8" rx="5" ry="3" fill="white" opacity=".45" transform="rotate(-25,-6,-8)"/>
      </g>

      {/* ── ROW 3 ── */}
      {/* purple R=35 */}
      <g transform="translate(128,312) rotate(-12)" opacity="0.9">
        <ellipse cx="4" cy="39" rx="30" ry="9" fill="black" opacity=".18"/>
        <path d="M-35,0Q-35,35,0,35Q35,35,35,0Z" fill="#f3e8ff"/>
        <path d="M-35,0Q-35,-35,0,-35Q35,-35,35,0Z" fill="#a21caf"/>
        <path d="M-35,0Q-35,-35,0,-35Q35,-35,35,0Z" fill="url(#hcs)"/>
        <rect x="-35" y="-3.5" width="70" height="7" fill="white" opacity=".15" rx="1"/>
        <ellipse cx="-12" cy="-18" rx="11" ry="7" fill="white" opacity=".5" transform="rotate(-25,-12,-18)"/>
      </g>

      {/* coral-red R=25 */}
      <g transform="translate(282,305) rotate(22)" opacity="0.9">
        <ellipse cx="3" cy="28" rx="21" ry="6" fill="black" opacity=".2"/>
        <path d="M-25,0Q-25,25,0,25Q25,25,25,0Z" fill="#ffb3c6"/>
        <path d="M-25,0Q-25,-25,0,-25Q25,-25,25,0Z" fill="#ff3366"/>
        <path d="M-25,0Q-25,-25,0,-25Q25,-25,25,0Z" fill="url(#hcs)"/>
        <rect x="-25" y="-2.5" width="50" height="5" fill="white" opacity=".15" rx="1"/>
        <ellipse cx="-9" cy="-13" rx="8" ry="5" fill="white" opacity=".5" transform="rotate(-25,-9,-13)"/>
      </g>

      {/* cyan R=16 */}
      <g transform="translate(428,316) rotate(-6)" opacity="0.85">
        <path d="M-16,0Q-16,16,0,16Q16,16,16,0Z" fill="#a5f3fc"/>
        <path d="M-16,0Q-16,-16,0,-16Q16,-16,16,0Z" fill="#0891b2"/>
        <path d="M-16,0Q-16,-16,0,-16Q16,-16,16,0Z" fill="url(#hcs)"/>
        <rect x="-16" y="-1.5" width="32" height="3" fill="white" opacity=".13" rx="1"/>
        <ellipse cx="-6" cy="-8" rx="5" ry="3" fill="white" opacity=".45" transform="rotate(-25,-6,-8)"/>
      </g>

      {/* orange R=35 */}
      <g transform="translate(575,306) rotate(18)" opacity="0.92">
        <ellipse cx="4" cy="39" rx="30" ry="9" fill="black" opacity=".18"/>
        <path d="M-35,0Q-35,35,0,35Q35,35,35,0Z" fill="#fed7aa"/>
        <path d="M-35,0Q-35,-35,0,-35Q35,-35,35,0Z" fill="#ea580c"/>
        <path d="M-35,0Q-35,-35,0,-35Q35,-35,35,0Z" fill="url(#hcs)"/>
        <rect x="-35" y="-3.5" width="70" height="7" fill="white" opacity=".15" rx="1"/>
        <ellipse cx="-12" cy="-18" rx="11" ry="7" fill="white" opacity=".5" transform="rotate(-25,-12,-18)"/>
      </g>

      {/* hot-pink R=25 */}
      <g transform="translate(720,314) rotate(-28)" opacity="0.9">
        <ellipse cx="3" cy="28" rx="21" ry="6" fill="black" opacity=".2"/>
        <path d="M-25,0Q-25,25,0,25Q25,25,25,0Z" fill="#fce7f3"/>
        <path d="M-25,0Q-25,-25,0,-25Q25,-25,25,0Z" fill="#be185d"/>
        <path d="M-25,0Q-25,-25,0,-25Q25,-25,25,0Z" fill="url(#hcs)"/>
        <rect x="-25" y="-2.5" width="50" height="5" fill="white" opacity=".15" rx="1"/>
        <ellipse cx="-9" cy="-13" rx="8" ry="5" fill="white" opacity=".5" transform="rotate(-25,-9,-13)"/>
      </g>

      {/* yellow R=35 */}
      <g transform="translate(868,305) rotate(10)" opacity="0.9">
        <ellipse cx="4" cy="39" rx="30" ry="9" fill="black" opacity=".18"/>
        <path d="M-35,0Q-35,35,0,35Q35,35,35,0Z" fill="#fef9c3"/>
        <path d="M-35,0Q-35,-35,0,-35Q35,-35,35,0Z" fill="#ca8a04"/>
        <path d="M-35,0Q-35,-35,0,-35Q35,-35,35,0Z" fill="url(#hcs)"/>
        <rect x="-35" y="-3.5" width="70" height="7" fill="white" opacity=".15" rx="1"/>
        <ellipse cx="-12" cy="-18" rx="11" ry="7" fill="white" opacity=".5" transform="rotate(-25,-12,-18)"/>
      </g>

      {/* green R=16 */}
      <g transform="translate(1015,316) rotate(-20)" opacity="0.85">
        <path d="M-16,0Q-16,16,0,16Q16,16,16,0Z" fill="#bbf7d0"/>
        <path d="M-16,0Q-16,-16,0,-16Q16,-16,16,0Z" fill="#15803d"/>
        <path d="M-16,0Q-16,-16,0,-16Q16,-16,16,0Z" fill="url(#hcs)"/>
        <rect x="-16" y="-1.5" width="32" height="3" fill="white" opacity=".13" rx="1"/>
        <ellipse cx="-6" cy="-8" rx="5" ry="3" fill="white" opacity=".45" transform="rotate(-25,-6,-8)"/>
      </g>

      {/* purple R=25 */}
      <g transform="translate(1162,306) rotate(26)" opacity="0.9">
        <ellipse cx="3" cy="28" rx="21" ry="6" fill="black" opacity=".2"/>
        <path d="M-25,0Q-25,25,0,25Q25,25,25,0Z" fill="#ddd6fe"/>
        <path d="M-25,0Q-25,-25,0,-25Q25,-25,25,0Z" fill="#6d28d9"/>
        <path d="M-25,0Q-25,-25,0,-25Q25,-25,25,0Z" fill="url(#hcs)"/>
        <rect x="-25" y="-2.5" width="50" height="5" fill="white" opacity=".15" rx="1"/>
        <ellipse cx="-9" cy="-13" rx="8" ry="5" fill="white" opacity=".5" transform="rotate(-25,-9,-13)"/>
      </g>

      {/* blue R=35 */}
      <g transform="translate(1308,314) rotate(-8)" opacity="0.9">
        <ellipse cx="4" cy="39" rx="30" ry="9" fill="black" opacity=".18"/>
        <path d="M-35,0Q-35,35,0,35Q35,35,35,0Z" fill="#bfdbfe"/>
        <path d="M-35,0Q-35,-35,0,-35Q35,-35,35,0Z" fill="#2563eb"/>
        <path d="M-35,0Q-35,-35,0,-35Q35,-35,35,0Z" fill="url(#hcs)"/>
        <rect x="-35" y="-3.5" width="70" height="7" fill="white" opacity=".15" rx="1"/>
        <ellipse cx="-12" cy="-18" rx="11" ry="7" fill="white" opacity=".5" transform="rotate(-25,-12,-18)"/>
      </g>

      {/* ── ROW 4 ── */}
      {/* yellow R=25 */}
      <g transform="translate(82,428) rotate(18)" opacity="0.9">
        <ellipse cx="3" cy="28" rx="21" ry="6" fill="black" opacity=".2"/>
        <path d="M-25,0Q-25,25,0,25Q25,25,25,0Z" fill="#fef08a"/>
        <path d="M-25,0Q-25,-25,0,-25Q25,-25,25,0Z" fill="#d97706"/>
        <path d="M-25,0Q-25,-25,0,-25Q25,-25,25,0Z" fill="url(#hcs)"/>
        <rect x="-25" y="-2.5" width="50" height="5" fill="white" opacity=".15" rx="1"/>
        <ellipse cx="-9" cy="-13" rx="8" ry="5" fill="white" opacity=".5" transform="rotate(-25,-9,-13)"/>
      </g>

      {/* green R=35 */}
      <g transform="translate(235,438) rotate(-16)" opacity="0.9">
        <ellipse cx="4" cy="39" rx="30" ry="9" fill="black" opacity=".18"/>
        <path d="M-35,0Q-35,35,0,35Q35,35,35,0Z" fill="#d1fae5"/>
        <path d="M-35,0Q-35,-35,0,-35Q35,-35,35,0Z" fill="#059669"/>
        <path d="M-35,0Q-35,-35,0,-35Q35,-35,35,0Z" fill="url(#hcs)"/>
        <rect x="-35" y="-3.5" width="70" height="7" fill="white" opacity=".15" rx="1"/>
        <ellipse cx="-12" cy="-18" rx="11" ry="7" fill="white" opacity=".5" transform="rotate(-25,-12,-18)"/>
      </g>

      {/* hot-pink R=16 */}
      <g transform="translate(382,422) rotate(30)" opacity="0.85">
        <path d="M-16,0Q-16,16,0,16Q16,16,16,0Z" fill="#fbcfe8"/>
        <path d="M-16,0Q-16,-16,0,-16Q16,-16,16,0Z" fill="#db2777"/>
        <path d="M-16,0Q-16,-16,0,-16Q16,-16,16,0Z" fill="url(#hcs)"/>
        <rect x="-16" y="-1.5" width="32" height="3" fill="white" opacity=".13" rx="1"/>
        <ellipse cx="-6" cy="-8" rx="5" ry="3" fill="white" opacity=".45" transform="rotate(-25,-6,-8)"/>
      </g>

      {/* coral-red R=25 */}
      <g transform="translate(528,432) rotate(-8)" opacity="0.9">
        <ellipse cx="3" cy="28" rx="21" ry="6" fill="black" opacity=".2"/>
        <path d="M-25,0Q-25,25,0,25Q25,25,25,0Z" fill="#fecaca"/>
        <path d="M-25,0Q-25,-25,0,-25Q25,-25,25,0Z" fill="#dc2626"/>
        <path d="M-25,0Q-25,-25,0,-25Q25,-25,25,0Z" fill="url(#hcs)"/>
        <rect x="-25" y="-2.5" width="50" height="5" fill="white" opacity=".15" rx="1"/>
        <ellipse cx="-9" cy="-13" rx="8" ry="5" fill="white" opacity=".5" transform="rotate(-25,-9,-13)"/>
      </g>

      {/* cyan R=35 */}
      <g transform="translate(678,428) rotate(22)" opacity="0.92">
        <ellipse cx="4" cy="39" rx="30" ry="9" fill="black" opacity=".18"/>
        <path d="M-35,0Q-35,35,0,35Q35,35,35,0Z" fill="#cffafe"/>
        <path d="M-35,0Q-35,-35,0,-35Q35,-35,35,0Z" fill="#0e7490"/>
        <path d="M-35,0Q-35,-35,0,-35Q35,-35,35,0Z" fill="url(#hcs)"/>
        <rect x="-35" y="-3.5" width="70" height="7" fill="white" opacity=".15" rx="1"/>
        <ellipse cx="-12" cy="-18" rx="11" ry="7" fill="white" opacity=".5" transform="rotate(-25,-12,-18)"/>
      </g>

      {/* yellow R=16 */}
      <g transform="translate(828,438) rotate(-14)" opacity="0.85">
        <path d="M-16,0Q-16,16,0,16Q16,16,16,0Z" fill="#fde68a"/>
        <path d="M-16,0Q-16,-16,0,-16Q16,-16,16,0Z" fill="#b45309"/>
        <path d="M-16,0Q-16,-16,0,-16Q16,-16,16,0Z" fill="url(#hcs)"/>
        <rect x="-16" y="-1.5" width="32" height="3" fill="white" opacity=".13" rx="1"/>
        <ellipse cx="-6" cy="-8" rx="5" ry="3" fill="white" opacity=".45" transform="rotate(-25,-6,-8)"/>
      </g>

      {/* purple R=35 */}
      <g transform="translate(975,422) rotate(6)" opacity="0.9">
        <ellipse cx="4" cy="39" rx="30" ry="9" fill="black" opacity=".18"/>
        <path d="M-35,0Q-35,35,0,35Q35,35,35,0Z" fill="#ede9fe"/>
        <path d="M-35,0Q-35,-35,0,-35Q35,-35,35,0Z" fill="#7c3aed"/>
        <path d="M-35,0Q-35,-35,0,-35Q35,-35,35,0Z" fill="url(#hcs)"/>
        <rect x="-35" y="-3.5" width="70" height="7" fill="white" opacity=".15" rx="1"/>
        <ellipse cx="-12" cy="-18" rx="11" ry="7" fill="white" opacity=".5" transform="rotate(-25,-12,-18)"/>
      </g>

      {/* orange R=25 */}
      <g transform="translate(1128,432) rotate(-26)" opacity="0.9">
        <ellipse cx="3" cy="28" rx="21" ry="6" fill="black" opacity=".2"/>
        <path d="M-25,0Q-25,25,0,25Q25,25,25,0Z" fill="#fed7aa"/>
        <path d="M-25,0Q-25,-25,0,-25Q25,-25,25,0Z" fill="#c2410c"/>
        <path d="M-25,0Q-25,-25,0,-25Q25,-25,25,0Z" fill="url(#hcs)"/>
        <rect x="-25" y="-2.5" width="50" height="5" fill="white" opacity=".15" rx="1"/>
        <ellipse cx="-9" cy="-13" rx="8" ry="5" fill="white" opacity=".5" transform="rotate(-25,-9,-13)"/>
      </g>

      {/* blue R=35 */}
      <g transform="translate(1285,428) rotate(14)" opacity="0.9">
        <ellipse cx="4" cy="39" rx="30" ry="9" fill="black" opacity=".18"/>
        <path d="M-35,0Q-35,35,0,35Q35,35,35,0Z" fill="#93c5fd"/>
        <path d="M-35,0Q-35,-35,0,-35Q35,-35,35,0Z" fill="#1d4ed8"/>
        <path d="M-35,0Q-35,-35,0,-35Q35,-35,35,0Z" fill="url(#hcs)"/>
        <rect x="-35" y="-3.5" width="70" height="7" fill="white" opacity=".15" rx="1"/>
        <ellipse cx="-12" cy="-18" rx="11" ry="7" fill="white" opacity=".5" transform="rotate(-25,-12,-18)"/>
      </g>

      {/* ── ROW 5 ── */}
      {/* blue R=35 */}
      <g transform="translate(162,538) rotate(-24)" opacity="0.9">
        <ellipse cx="4" cy="39" rx="30" ry="9" fill="black" opacity=".18"/>
        <path d="M-35,0Q-35,35,0,35Q35,35,35,0Z" fill="#bfdbfe"/>
        <path d="M-35,0Q-35,-35,0,-35Q35,-35,35,0Z" fill="#2563eb"/>
        <path d="M-35,0Q-35,-35,0,-35Q35,-35,35,0Z" fill="url(#hcs)"/>
        <rect x="-35" y="-3.5" width="70" height="7" fill="white" opacity=".15" rx="1"/>
        <ellipse cx="-12" cy="-18" rx="11" ry="7" fill="white" opacity=".5" transform="rotate(-25,-12,-18)"/>
      </g>

      {/* purple R=25 */}
      <g transform="translate(322,548) rotate(10)" opacity="0.9">
        <ellipse cx="3" cy="28" rx="21" ry="6" fill="black" opacity=".2"/>
        <path d="M-25,0Q-25,25,0,25Q25,25,25,0Z" fill="#ddd6fe"/>
        <path d="M-25,0Q-25,-25,0,-25Q25,-25,25,0Z" fill="#7c3aed"/>
        <path d="M-25,0Q-25,-25,0,-25Q25,-25,25,0Z" fill="url(#hcs)"/>
        <rect x="-25" y="-2.5" width="50" height="5" fill="white" opacity=".15" rx="1"/>
        <ellipse cx="-9" cy="-13" rx="8" ry="5" fill="white" opacity=".5" transform="rotate(-25,-9,-13)"/>
      </g>

      {/* orange R=35 */}
      <g transform="translate(478,532) rotate(-18)" opacity="0.9">
        <ellipse cx="4" cy="39" rx="30" ry="9" fill="black" opacity=".18"/>
        <path d="M-35,0Q-35,35,0,35Q35,35,35,0Z" fill="#ffedd5"/>
        <path d="M-35,0Q-35,-35,0,-35Q35,-35,35,0Z" fill="#ea580c"/>
        <path d="M-35,0Q-35,-35,0,-35Q35,-35,35,0Z" fill="url(#hcs)"/>
        <rect x="-35" y="-3.5" width="70" height="7" fill="white" opacity=".15" rx="1"/>
        <ellipse cx="-12" cy="-18" rx="11" ry="7" fill="white" opacity=".5" transform="rotate(-25,-12,-18)"/>
      </g>

      {/* coral-red R=25 */}
      <g transform="translate(632,542) rotate(28)" opacity="0.9">
        <ellipse cx="3" cy="28" rx="21" ry="6" fill="black" opacity=".2"/>
        <path d="M-25,0Q-25,25,0,25Q25,25,25,0Z" fill="#fecdd3"/>
        <path d="M-25,0Q-25,-25,0,-25Q25,-25,25,0Z" fill="#e11d48"/>
        <path d="M-25,0Q-25,-25,0,-25Q25,-25,25,0Z" fill="url(#hcs)"/>
        <rect x="-25" y="-2.5" width="50" height="5" fill="white" opacity=".15" rx="1"/>
        <ellipse cx="-9" cy="-13" rx="8" ry="5" fill="white" opacity=".5" transform="rotate(-25,-9,-13)"/>
      </g>

      {/* green R=16 */}
      <g transform="translate(782,536) rotate(-6)" opacity="0.85">
        <path d="M-16,0Q-16,16,0,16Q16,16,16,0Z" fill="#d1fae5"/>
        <path d="M-16,0Q-16,-16,0,-16Q16,-16,16,0Z" fill="#059669"/>
        <path d="M-16,0Q-16,-16,0,-16Q16,-16,16,0Z" fill="url(#hcs)"/>
        <rect x="-16" y="-1.5" width="32" height="3" fill="white" opacity=".13" rx="1"/>
        <ellipse cx="-6" cy="-8" rx="5" ry="3" fill="white" opacity=".45" transform="rotate(-25,-6,-8)"/>
      </g>

      {/* hot-pink R=35 */}
      <g transform="translate(932,548) rotate(20)" opacity="0.9">
        <ellipse cx="4" cy="39" rx="30" ry="9" fill="black" opacity=".18"/>
        <path d="M-35,0Q-35,35,0,35Q35,35,35,0Z" fill="#fce7f3"/>
        <path d="M-35,0Q-35,-35,0,-35Q35,-35,35,0Z" fill="#be185d"/>
        <path d="M-35,0Q-35,-35,0,-35Q35,-35,35,0Z" fill="url(#hcs)"/>
        <rect x="-35" y="-3.5" width="70" height="7" fill="white" opacity=".15" rx="1"/>
        <ellipse cx="-12" cy="-18" rx="11" ry="7" fill="white" opacity=".5" transform="rotate(-25,-12,-18)"/>
      </g>

      {/* cyan R=25 */}
      <g transform="translate(1082,532) rotate(-30)" opacity="0.9">
        <ellipse cx="3" cy="28" rx="21" ry="6" fill="black" opacity=".2"/>
        <path d="M-25,0Q-25,25,0,25Q25,25,25,0Z" fill="#a5f3fc"/>
        <path d="M-25,0Q-25,-25,0,-25Q25,-25,25,0Z" fill="#0891b2"/>
        <path d="M-25,0Q-25,-25,0,-25Q25,-25,25,0Z" fill="url(#hcs)"/>
        <rect x="-25" y="-2.5" width="50" height="5" fill="white" opacity=".15" rx="1"/>
        <ellipse cx="-9" cy="-13" rx="8" ry="5" fill="white" opacity=".5" transform="rotate(-25,-9,-13)"/>
      </g>

      {/* yellow R=35 */}
      <g transform="translate(1242,542) rotate(12)" opacity="0.9">
        <ellipse cx="4" cy="39" rx="30" ry="9" fill="black" opacity=".18"/>
        <path d="M-35,0Q-35,35,0,35Q35,35,35,0Z" fill="#fef9c3"/>
        <path d="M-35,0Q-35,-35,0,-35Q35,-35,35,0Z" fill="#ca8a04"/>
        <path d="M-35,0Q-35,-35,0,-35Q35,-35,35,0Z" fill="url(#hcs)"/>
        <rect x="-35" y="-3.5" width="70" height="7" fill="white" opacity=".15" rx="1"/>
        <ellipse cx="-12" cy="-18" rx="11" ry="7" fill="white" opacity=".5" transform="rotate(-25,-12,-18)"/>
      </g>

      {/* purple R=25 */}
      <g transform="translate(1400,536) rotate(-16)" opacity="0.88">
        <ellipse cx="3" cy="28" rx="21" ry="6" fill="black" opacity=".2"/>
        <path d="M-25,0Q-25,25,0,25Q25,25,25,0Z" fill="#e9d5ff"/>
        <path d="M-25,0Q-25,-25,0,-25Q25,-25,25,0Z" fill="#9333ea"/>
        <path d="M-25,0Q-25,-25,0,-25Q25,-25,25,0Z" fill="url(#hcs)"/>
        <rect x="-25" y="-2.5" width="50" height="5" fill="white" opacity=".15" rx="1"/>
        <ellipse cx="-9" cy="-13" rx="8" ry="5" fill="white" opacity=".5" transform="rotate(-25,-9,-13)"/>
      </g>
    </svg>
  );
}
