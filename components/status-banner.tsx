type StatusBannerProps = {
  message?: string | null;
  tone?: "error" | "success";
};

export function StatusBanner({
  message,
  tone = "success",
}: StatusBannerProps) {
  if (!message) {
    return null;
  }

  return (
    <p className={tone === "error" ? "status-banner status-banner--error" : "status-banner"}>
      {message}
    </p>
  );
}
