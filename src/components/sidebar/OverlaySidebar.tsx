"use client";

interface OverlaySidebarProps {
  onClose: () => void;
  children: React.ReactNode;
  ariaLabel?: string;
}

export default function OverlaySidebar({
  onClose,
  children,
  ariaLabel = "폴더",
}: OverlaySidebarProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex"
      role="dialog"
      aria-modal="true"
      aria-label={ariaLabel}
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
        aria-label="닫기"
      />
      <div className="relative">{children}</div>
    </div>
  );
}
