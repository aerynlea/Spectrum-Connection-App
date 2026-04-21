import Link from "next/link";

const adminToolItems = [
  {
    id: "members",
    href: "/admin-tools/members",
    label: "Member roster",
  },
  {
    id: "email-lookup",
    href: "/admin-tools/email-lookup",
    label: "Email lookup",
  },
  {
    id: "moderation",
    href: "/admin-tools/moderation",
    label: "Moderation queue",
  },
] as const;

type AdminToolId = (typeof adminToolItems)[number]["id"];

type AdminToolLinksProps = {
  active: AdminToolId;
};

export function AdminToolLinks({ active }: AdminToolLinksProps) {
  return (
    <div className="button-row button-row--compact">
      {adminToolItems.map((item) => (
        <Link
          className={item.id === active ? "button-primary" : "button-secondary"}
          href={item.href}
          key={item.id}
        >
          {item.label}
        </Link>
      ))}
    </div>
  );
}
