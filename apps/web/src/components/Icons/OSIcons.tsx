import React from 'react';

// 1. VS Code / IBP Studio Icon (Blue origami ribbon style from user's image)
export const VSCodeStudioIcon: React.FC<{ size?: number; showShortcutArrow?: boolean }> = ({
  size = 48,
  showShortcutArrow = true,
}) => (
  <div className="relative inline-block select-none" style={{ width: size, height: size }}>
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className="drop-shadow-[0_4px_8px_rgba(0,0,0,0.45)]"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="vscode-blue-1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0065A9" />
          <stop offset="100%" stopColor="#007ACC" />
        </linearGradient>
        <linearGradient id="vscode-blue-2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1F9CF0" />
          <stop offset="100%" stopColor="#007ACC" />
        </linearGradient>
        <linearGradient id="vscode-blue-3" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#0065A9" />
          <stop offset="100%" stopColor="#004A7F" />
        </linearGradient>
        <linearGradient id="vscode-highlight" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#38BDF8" />
          <stop offset="100%" stopColor="#0284C7" />
        </linearGradient>
      </defs>

      {/* Back flap */}
      <path
        d="M71.5 95.8L94.2 84.7C97.8 82.9 100 79.3 100 75.3V24.7C100 20.7 97.8 17.1 94.2 15.3L71.5 4.2C68.9 2.9 65.8 3.5 63.8 5.6L27.5 38.6L14.4 28.5C12.4 27 9.6 27.2 7.8 29L1.8 34.6C-0.3 36.6 -0.5 39.9 1.3 42.1L19.2 60.5L1.3 78C-0.5 80.2 -0.3 83.5 1.8 85.5L7.8 91.1C9.6 92.8 12.4 93.1 14.4 91.5L27.5 81.5L63.8 114.5C65.8 116.5 68.9 117.1 71.5 115.8Z"
        transform="scale(0.85) translate(8, -8)"
        fill="url(#vscode-blue-3)"
        opacity="0.35"
      />

      {/* Main Origami Shape */}
      {/* Wing Left Top */}
      <path
        d="M70 6L25 43L12 33C10.5 31.8 8.3 32 7 33.4L2.5 38C1.2 39.4 1.3 41.6 2.7 42.9L20 58L2.7 73.1C1.3 74.4 1.2 76.6 2.5 78L7 82.6C8.3 84 10.5 84.2 12 83L25 73L70 110C72 111.5 74.8 111 76.3 109L95.5 84C97 82 97.5 79.5 97.5 77V39C97.5 36.5 97 34 95.5 32L76.3 7C74.8 5 72 4.5 70 6Z"
        transform="scale(0.85) translate(8, -5)"
        fill="url(#vscode-blue-1)"
      />

      {/* Upper Fold */}
      <path
        d="M95 32L70 51L25 43L70 6C72 4.5 74.8 5 76.3 7L95 32Z"
        transform="scale(0.85) translate(8, -5)"
        fill="url(#vscode-highlight)"
      />

      {/* Lower Fold */}
      <path
        d="M95 84L76.3 109C74.8 111 72 111.5 70 110L25 73L70 65L95 84Z"
        transform="scale(0.85) translate(8, -5)"
        fill="url(#vscode-blue-3)"
      />

      {/* Center Ribbon Crossing */}
      <path
        d="M70 51L25 43L70 65V51Z"
        transform="scale(0.85) translate(8, -5)"
        fill="#005A9E"
        opacity="0.7"
      />

      {/* Right Blade */}
      <path
        d="M97 39V77C97 79.5 96 82 94.5 84L70 65V51L94.5 32C96 34 97 36.5 97 39Z"
        transform="scale(0.85) translate(8, -5)"
        fill="url(#vscode-blue-2)"
      />
    </svg>

    {/* Windows Shortcut Badge Overlay (as seen in user's image) */}
    {showShortcutArrow && (
      <div className="absolute -bottom-0.5 -left-0.5 w-4 h-4 bg-white rounded-sm shadow-md flex items-center justify-center border border-slate-300">
        <svg viewBox="0 0 16 16" width="11" height="11" fill="none">
          <path d="M4 12L12 4M12 4H6M12 4V10" stroke="#0284C7" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    )}
  </div>
);

// 2. Windows User / File Folder Icon (Yellow folder with user silhouette from user's image)
export const FolderUserIcon: React.FC<{ size?: number; hasUserBadge?: boolean }> = ({
  size = 48,
  hasUserBadge = true,
}) => (
  <div className="relative inline-block select-none" style={{ width: size, height: size }}>
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className="drop-shadow-[0_4px_8px_rgba(0,0,0,0.45)]"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Folder Back Tab Gradient */}
        <linearGradient id="folder-tab-grad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#D97706" />
        </linearGradient>
        {/* Main Folder Body Gradient */}
        <linearGradient id="folder-body-grad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FDE047" />
          <stop offset="30%" stopColor="#FACC15" />
          <stop offset="100%" stopColor="#EAB308" />
        </linearGradient>
        {/* Top Rim Highlight */}
        <linearGradient id="folder-rim-grad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#FEF08A" />
          <stop offset="100%" stopColor="#FDE047" />
        </linearGradient>
      </defs>

      {/* Back tab */}
      <path
        d="M6 24C6 20.6863 8.68629 18 12 18H38C40.5 18 43 19.5 45 22L51 28H88C91.3137 28 94 30.6863 94 34V46H6V24Z"
        fill="url(#folder-tab-grad)"
      />

      {/* Front Folder Flap with 3D bevel */}
      <path
        d="M4 34C4 30.6863 6.68629 28 10 28H90C93.3137 28 96 30.6863 96 34V78C96 82.4183 92.4183 86 88 86H12C7.58172 86 4 82.4183 4 78V34Z"
        fill="url(#folder-body-grad)"
      />

      {/* Top rim highlight */}
      <path
        d="M4 34C4 30.6863 6.68629 28 10 28H90C93.3137 28 96 30.6863 96 34V36H4V34Z"
        fill="url(#folder-rim-grad)"
      />

      {/* Subtle bottom shadow on front flap */}
      <path
        d="M4 76L96 76V78C96 82.4183 92.4183 86 88 86H12C7.58172 86 4 82.4183 4 78V76Z"
        fill="#CA8A04"
        opacity="0.3"
      />

      {/* User Silhouette on folder (exact match to user's Acer image!) */}
      {hasUserBadge && (
        <g opacity="0.80">
          {/* Head */}
          <circle cx="50" cy="52" r="11" fill="#78350F" />
          {/* Shoulders */}
          <path
            d="M30 76C30 65 39 61 50 61C61 61 70 65 70 76C70 78 68 79 66 79H34C32 79 30 78 30 76Z"
            fill="#78350F"
          />
        </g>
      )}
    </svg>
  </div>
);

// 3. LangCraft Studio Icon (Purple Magical Crystal / Language Architect)
export const LangCraftIcon: React.FC<{ size?: number }> = ({ size = 48 }) => (
  <div className="relative inline-block select-none" style={{ width: size, height: size }}>
    <svg viewBox="0 0 100 100" width={size} height={size} className="drop-shadow-[0_4px_8px_rgba(0,0,0,0.45)]" fill="none">
      <defs>
        <linearGradient id="langcraft-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#A855F7" />
          <stop offset="50%" stopColor="#7C3AED" />
          <stop offset="100%" stopColor="#4C1D95" />
        </linearGradient>
        <linearGradient id="wand-gold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FDE047" />
          <stop offset="100%" stopColor="#CA8A04" />
        </linearGradient>
      </defs>
      {/* Glossy rounded squircle base */}
      <rect x="6" y="6" width="88" height="88" rx="24" fill="url(#langcraft-grad)" />
      <rect x="6" y="6" width="88" height="88" rx="24" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" />
      <path d="M6 30C6 16.7452 16.7452 6 30 6H70C83.2548 6 94 16.7452 94 30V40C94 40 60 52 6 40V30Z" fill="white" opacity="0.12" />

      {/* Magic Wand & Sparkles */}
      <path d="M28 72L62 38" stroke="url(#wand-gold)" strokeWidth="6" strokeLinecap="round" />
      <circle cx="28" cy="72" r="5" fill="#EAB308" />
      <path d="M66 34L76 24M76 24L80 30M76 24L70 20" stroke="#FDE047" strokeWidth="3" strokeLinecap="round" />
      {/* Central Star */}
      <path d="M65 22L68 14L71 22L79 25L71 28L68 36L65 28L57 25L65 22Z" fill="#FACC15" />
      <circle cx="40" cy="28" r="3" fill="#E9D5FF" />
      <circle cx="75" cy="55" r="2.5" fill="#E9D5FF" />
      <circle cx="32" cy="46" r="2" fill="#FDE047" />
    </svg>
  </div>
);

// 4. Terminal Icon (Black matte CLI window with green code prompt)
export const TerminalOSIcon: React.FC<{ size?: number }> = ({ size = 48 }) => (
  <div className="relative inline-block select-none" style={{ width: size, height: size }}>
    <svg viewBox="0 0 100 100" width={size} height={size} className="drop-shadow-[0_4px_8px_rgba(0,0,0,0.45)]" fill="none">
      <defs>
        <linearGradient id="term-body" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#1E293B" />
          <stop offset="100%" stopColor="#0B1324" />
        </linearGradient>
      </defs>
      <rect x="6" y="10" width="88" height="80" rx="18" fill="url(#term-body)" />
      <rect x="6" y="10" width="88" height="80" rx="18" stroke="rgba(255,255,255,0.18)" strokeWidth="1.5" />
      {/* Header Bar */}
      <path d="M6 24C6 16.268 12.268 10 20 10H80C87.732 10 94 16.268 94 24V28H6V24Z" fill="#0F172A" />
      <circle cx="18" cy="19" r="3.5" fill="#EF4444" />
      <circle cx="28" cy="19" r="3.5" fill="#F59E0B" />
      <circle cx="38" cy="19" r="3.5" fill="#10B981" />
      {/* Prompt `>_` */}
      <path d="M22 42L36 52L22 62" stroke="#10B981" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="42" y1="62" x2="60" y2="62" stroke="#38BDF8" strokeWidth="5" strokeLinecap="round" />
    </svg>
  </div>
);

// 5. Learn IBP / Handbook Icon (Cyan Knowledge Book)
export const HandbookOSIcon: React.FC<{ size?: number }> = ({ size = 48 }) => (
  <div className="relative inline-block select-none" style={{ width: size, height: size }}>
    <svg viewBox="0 0 100 100" width={size} height={size} className="drop-shadow-[0_4px_8px_rgba(0,0,0,0.45)]" fill="none">
      <defs>
        <linearGradient id="book-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0EA5E9" />
          <stop offset="100%" stopColor="#0284C7" />
        </linearGradient>
      </defs>
      <rect x="6" y="6" width="88" height="88" rx="24" fill="url(#book-grad)" />
      <rect x="6" y="6" width="88" height="88" rx="24" stroke="rgba(255,255,255,0.22)" strokeWidth="1.5" />
      <path d="M6 30C6 16.7452 16.7452 6 30 6H70C83.2548 6 94 16.7452 94 30V40C94 40 60 50 6 40V30Z" fill="white" opacity="0.15" />
      {/* Open Book Vector */}
      <path
        d="M26 34C34 32 44 34 50 38C56 34 66 32 74 34V68C66 66 56 68 50 72C44 68 34 66 26 68V34Z"
        fill="#F8FAFC"
      />
      <line x1="50" y1="38" x2="50" y2="72" stroke="#0284C7" strokeWidth="2.5" />
      <line x1="32" y1="44" x2="44" y2="44" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" />
      <line x1="32" y1="52" x2="44" y2="52" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" />
      <line x1="56" y1="44" x2="68" y2="44" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" />
      <line x1="56" y1="52" x2="68" y2="52" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" />
    </svg>
  </div>
);

// 6. Playground Icon (Golden Trophy)
export const PlaygroundOSIcon: React.FC<{ size?: number }> = ({ size = 48 }) => (
  <div className="relative inline-block select-none" style={{ width: size, height: size }}>
    <svg viewBox="0 0 100 100" width={size} height={size} className="drop-shadow-[0_4px_8px_rgba(0,0,0,0.45)]" fill="none">
      <defs>
        <linearGradient id="trophy-bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#B45309" />
        </linearGradient>
      </defs>
      <rect x="6" y="6" width="88" height="88" rx="24" fill="url(#trophy-bg)" />
      <rect x="6" y="6" width="88" height="88" rx="24" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" />
      {/* Trophy */}
      <path d="M34 26H66V46C66 54.8366 58.8366 62 50 62C41.1634 62 34 54.8366 34 46V26Z" fill="#FEF08A" />
      <path d="M34 32H24C20.6863 32 18 34.6863 18 38C18 43 22 47 28 47H34V32Z" stroke="#FEF08A" strokeWidth="3" />
      <path d="M66 32H76C79.3137 32 82 34.6863 82 38C82 43 78 47 72 47H66V32Z" stroke="#FEF08A" strokeWidth="3" />
      <rect x="46" y="62" width="8" height="10" fill="#FDE047" />
      <rect x="36" y="72" width="28" height="8" rx="2" fill="#78350F" />
      <rect x="40" y="74" width="20" height="4" rx="1" fill="#FEF08A" />
      <circle cx="50" cy="42" r="5" fill="#D97706" />
    </svg>
  </div>
);

// 7. System Monitor Icon (Pulse Graph telemetry)
export const MonitorOSIcon: React.FC<{ size?: number }> = ({ size = 48 }) => (
  <div className="relative inline-block select-none" style={{ width: size, height: size }}>
    <svg viewBox="0 0 100 100" width={size} height={size} className="drop-shadow-[0_4px_8px_rgba(0,0,0,0.45)]" fill="none">
      <defs>
        <linearGradient id="mon-bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4F46E5" />
          <stop offset="100%" stopColor="#312E81" />
        </linearGradient>
      </defs>
      <rect x="6" y="6" width="88" height="88" rx="24" fill="url(#mon-bg)" />
      <rect x="6" y="6" width="88" height="88" rx="24" stroke="rgba(255,255,255,0.22)" strokeWidth="1.5" />
      {/* Screen Frame */}
      <rect x="18" y="22" width="64" height="46" rx="8" fill="#0B132B" stroke="#6366F1" strokeWidth="2" />
      <path d="M22 46H34L40 32L48 58L56 40L62 48H78" stroke="#38BDF8" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="44" y="68" width="12" height="6" fill="#6366F1" />
      <path d="M36 74H64" stroke="#6366F1" strokeWidth="3" strokeLinecap="round" />
    </svg>
  </div>
);

// 8. Settings Icon (Silver Metallic Gear)
export const SettingsOSIcon: React.FC<{ size?: number }> = ({ size = 48 }) => (
  <div className="relative inline-block select-none" style={{ width: size, height: size }}>
    <svg viewBox="0 0 100 100" width={size} height={size} className="drop-shadow-[0_4px_8px_rgba(0,0,0,0.45)]" fill="none">
      <defs>
        <linearGradient id="gear-bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#64748B" />
          <stop offset="100%" stopColor="#334155" />
        </linearGradient>
        <linearGradient id="gear-metal" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#F8FAFC" />
          <stop offset="100%" stopColor="#CBD5E1" />
        </linearGradient>
      </defs>
      <rect x="6" y="6" width="88" height="88" rx="24" fill="url(#gear-bg)" />
      <rect x="6" y="6" width="88" height="88" rx="24" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" />
      {/* 3D Gear */}
      <path
        d="M50 32C40.0589 32 32 40.0589 32 50C32 59.9411 40.0589 68 50 68C59.9411 68 68 59.9411 68 50C68 40.0589 59.9411 32 50 32Z"
        fill="url(#gear-metal)"
      />
      <circle cx="50" cy="50" r="8" fill="#334155" />
      {/* Teeth */}
      <rect x="46" y="24" width="8" height="10" rx="2" fill="url(#gear-metal)" />
      <rect x="46" y="66" width="8" height="10" rx="2" fill="url(#gear-metal)" />
      <rect x="24" y="46" width="10" height="8" rx="2" fill="url(#gear-metal)" />
      <rect x="66" y="46" width="10" height="8" rx="2" fill="url(#gear-metal)" />
      <rect x="31" y="31" width="8" height="8" rx="2" transform="rotate(45 35 35)" fill="url(#gear-metal)" />
      <rect x="61" y="61" width="8" height="8" rx="2" transform="rotate(45 65 65)" fill="url(#gear-metal)" />
      <rect x="31" y="61" width="8" height="8" rx="2" transform="rotate(-45 35 65)" fill="url(#gear-metal)" />
      <rect x="61" y="31" width="8" height="8" rx="2" transform="rotate(-45 65 35)" fill="url(#gear-metal)" />
    </svg>
  </div>
);

// 9. Chrome / Web Browser Icon (Authentic Google Chrome 4-color circular disk)
export const ChromeBrowserIcon: React.FC<{ size?: number; showShortcutArrow?: boolean }> = ({
  size = 48,
  showShortcutArrow = false,
}) => (
  <div className="relative inline-block select-none" style={{ width: size, height: size }}>
    <svg viewBox="0 0 100 100" width={size} height={size} className="drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)]" fill="none">
      <defs>
        <linearGradient id="chrome-red" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#EA4335" />
          <stop offset="100%" stopColor="#C5221F" />
        </linearGradient>
        <linearGradient id="chrome-green" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#34A853" />
          <stop offset="100%" stopColor="#1E8E3E" />
        </linearGradient>
        <linearGradient id="chrome-yellow" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FBBC04" />
          <stop offset="100%" stopColor="#F29900" />
        </linearGradient>
        <linearGradient id="chrome-blue" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4285F4" />
          <stop offset="100%" stopColor="#1A73E8" />
        </linearGradient>
      </defs>

      {/* Red sector */}
      <path
        d="M50 8C64.2 8 76.9 14.8 84.8 25.3L50 50L21.4 33.5C27.5 18.2 42.4 8 50 8Z"
        fill="url(#chrome-red)"
      />
      {/* Green sector */}
      <path
        d="M84.8 25.3C92 34.8 96 46.5 96 59C96 82.2 78.8 91.5 63 92L50 50L84.8 25.3Z"
        fill="url(#chrome-green)"
      />
      {/* Yellow sector */}
      <path
        d="M63 92C48.8 92 36.1 85.2 28.2 74.7L50 50L21.4 33.5C10.2 46.2 8.5 66.8 19 80C26.5 89.4 37.8 92 50 92L63 92Z"
        fill="url(#chrome-yellow)"
      />

      {/* Outer Circle Ring border */}
      <circle cx="50" cy="50" r="44" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" />

      {/* White inner border ring */}
      <circle cx="50" cy="50" r="21" fill="#FFFFFF" />

      {/* Center Blue Circle */}
      <circle cx="50" cy="50" r="17" fill="url(#chrome-blue)" />
      <circle cx="48" cy="48" r="15" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
    </svg>

    {showShortcutArrow && (
      <div className="absolute -bottom-0.5 -left-0.5 w-4 h-4 bg-white rounded-sm shadow-md flex items-center justify-center border border-slate-300">
        <svg viewBox="0 0 16 16" width="11" height="11" fill="none">
          <path d="M4 12L12 4M12 4H6M12 4V10" stroke="#0284C7" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    )}
  </div>
);

// 10. Zenzy Shop Icon (Vibrant Luxury E-Commerce Bag & Star Tag)
export const ZenzyShopIcon: React.FC<{ size?: number; showShortcutArrow?: boolean }> = ({
  size = 48,
  showShortcutArrow = true,
}) => (
  <div className="relative inline-block select-none" style={{ width: size, height: size }}>
    <svg viewBox="0 0 100 100" width={size} height={size} className="drop-shadow-[0_4px_12px_rgba(236,72,153,0.35)]" fill="none">
      <defs>
        <linearGradient id="zenzy-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#EC4899" />
          <stop offset="50%" stopColor="#A855F7" />
          <stop offset="100%" stopColor="#6366F1" />
        </linearGradient>
        <linearGradient id="zenzy-bag" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#F1F5F9" />
        </linearGradient>
      </defs>

      {/* Squircle Background */}
      <rect x="6" y="6" width="88" height="88" rx="24" fill="url(#zenzy-grad)" />
      <rect x="6" y="6" width="88" height="88" rx="24" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" />

      {/* Bag Handle */}
      <path
        d="M38 38C38 30 43 24 50 24C57 24 62 30 62 38"
        stroke="#FFFFFF"
        strokeWidth="4"
        strokeLinecap="round"
      />

      {/* Bag Body */}
      <path
        d="M26 38H74L79 78C79.5 82 76.5 85 72.5 85H27.5C23.5 85 20.5 82 21 78L26 38Z"
        fill="url(#zenzy-bag)"
      />

      {/* Modern 'Z' monogram on bag */}
      <path
        d="M40 50H60L42 70H61"
        stroke="url(#zenzy-grad)"
        strokeWidth="4.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Sparkle */}
      <polygon points="76,22 79,29 86,32 79,35 76,42 73,35 66,32 73,29" fill="#FDE047" />
    </svg>

    {showShortcutArrow && (
      <div className="absolute -bottom-0.5 -left-0.5 w-4 h-4 bg-white rounded-sm shadow-md flex items-center justify-center border border-slate-300">
        <svg viewBox="0 0 16 16" width="11" height="11" fill="none">
          <path d="M4 12L12 4M12 4H6M12 4V10" stroke="#EC4899" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    )}
  </div>
);

// 11. Ishant Portfolio Icon (Modern Creator Monogram & Code Diamond)
export const IshantPortfolioIcon: React.FC<{ size?: number; showShortcutArrow?: boolean }> = ({
  size = 48,
  showShortcutArrow = true,
}) => (
  <div className="relative inline-block select-none" style={{ width: size, height: size }}>
    <svg viewBox="0 0 100 100" width={size} height={size} className="drop-shadow-[0_4px_12px_rgba(14,165,233,0.35)]" fill="none">
      <defs>
        <linearGradient id="ishant-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0EA5E9" />
          <stop offset="50%" stopColor="#2563EB" />
          <stop offset="100%" stopColor="#7C3AED" />
        </linearGradient>
        <linearGradient id="ishant-glow" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#38BDF8" />
          <stop offset="100%" stopColor="#818CF8" />
        </linearGradient>
      </defs>

      {/* Squircle Background */}
      <rect x="6" y="6" width="88" height="88" rx="24" fill="url(#ishant-grad)" />
      <rect x="6" y="6" width="88" height="88" rx="24" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" />

      {/* Inner Glowing Hexagon / Shield */}
      <polygon
        points="50,18 78,34 78,66 50,82 22,66 22,34"
        fill="rgba(15, 23, 42, 0.45)"
        stroke="url(#ishant-glow)"
        strokeWidth="2.5"
      />

      {/* 'I' Monogram */}
      <path
        d="M42 32H58M50 32V68M42 68H58"
        stroke="#FFFFFF"
        strokeWidth="6"
        strokeLinecap="round"
      />

      {/* Crown / Star Top */}
      <circle cx="50" cy="24" r="3.5" fill="#38BDF8" />
      <circle cx="34" cy="36" r="2" fill="#F472B6" />
      <circle cx="66" cy="36" r="2" fill="#F472B6" />
    </svg>

    {showShortcutArrow && (
      <div className="absolute -bottom-0.5 -left-0.5 w-4 h-4 bg-white rounded-sm shadow-md flex items-center justify-center border border-slate-300">
        <svg viewBox="0 0 16 16" width="11" height="11" fill="none">
          <path d="M4 12L12 4M12 4H6M12 4V10" stroke="#0284C7" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    )}
  </div>
);

// 12. Arcade Games Icon (Retro glass controller with neon glow)
export const ArcadeGamesIcon: React.FC<{ size?: number; showShortcutArrow?: boolean }> = ({
  size = 48,
  showShortcutArrow = false,
}) => (
  <div className="relative inline-block select-none" style={{ width: size, height: size }}>
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className="drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)]"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="games-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8B5CF6" />
          <stop offset="50%" stopColor="#6366F1" />
          <stop offset="100%" stopColor="#EC4899" />
        </linearGradient>
      </defs>

      <rect x="6" y="6" width="88" height="88" rx="24" fill="url(#games-grad)" />
      <rect x="6" y="6" width="88" height="88" rx="24" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />

      {/* Controller Body */}
      <rect x="22" y="32" width="56" height="36" rx="14" fill="#0F172A" stroke="rgba(255,255,255,0.2)" strokeWidth="2" />

      {/* D-Pad Left */}
      <path d="M34 42V58M26 50H42" stroke="#38BDF8" strokeWidth="3.5" strokeLinecap="round" />

      {/* Action Buttons Right */}
      <circle cx="62" cy="46" r="3" fill="#EC4899" />
      <circle cx="70" cy="54" r="3" fill="#F59E0B" />
      <circle cx="56" cy="54" r="3" fill="#10B981" />
      <circle cx="64" cy="60" r="3" fill="#3B82F6" />
    </svg>

    {showShortcutArrow && (
      <div className="absolute -bottom-0.5 -left-0.5 w-4 h-4 bg-white rounded-sm shadow-md flex items-center justify-center border border-slate-300">
        <svg viewBox="0 0 16 16" width="11" height="11" fill="none">
          <path d="M4 12L12 4M12 4H6M12 4V10" stroke="#0284C7" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    )}
  </div>
);

// 13. Hyper-Refined IBP OS Insignia Logo (For Start Orb & System Branding)
export const IBPOSLogoIcon: React.FC<{ size?: number; className?: string }> = ({
  size = 36,
  className = '',
}) => (
  <svg
    viewBox="0 0 100 100"
    width={size}
    height={size}
    className={`select-none ${className}`}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <linearGradient id="ibp-orb-outer" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#38BDF8" />
        <stop offset="50%" stopColor="#6366F1" />
        <stop offset="100%" stopColor="#8B5CF6" />
      </linearGradient>
      <linearGradient id="ibp-orb-core" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FFFFFF" />
        <stop offset="100%" stopColor="#BAE6FD" />
      </linearGradient>
      <filter id="ibp-glow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="3" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    </defs>

    {/* Outer Orbital Ring 1 */}
    <ellipse
      cx="50"
      cy="50"
      rx="40"
      ry="16"
      transform="rotate(-25 50 50)"
      stroke="url(#ibp-orb-outer)"
      strokeWidth="3.5"
      strokeDasharray="4 2"
      opacity="0.8"
    />

    {/* Outer Orbital Ring 2 */}
    <ellipse
      cx="50"
      cy="50"
      rx="40"
      ry="16"
      transform="rotate(35 50 50)"
      stroke="url(#ibp-orb-outer)"
      strokeWidth="3.5"
      opacity="0.9"
    />

    {/* Center Polished Nucleus Sphere */}
    <circle cx="50" cy="50" r="18" fill="url(#ibp-orb-outer)" filter="url(#ibp-glow)" />
    <circle cx="45" cy="45" r="7" fill="url(#ibp-orb-core)" opacity="0.9" />

    {/* Satellite Node Points */}
    <circle cx="16" cy="35" r="3" fill="#38BDF8" />
    <circle cx="84" cy="65" r="3" fill="#8B5CF6" />
    <circle cx="50" cy="12" r="2.5" fill="#FFFFFF" />
  </svg>
);
