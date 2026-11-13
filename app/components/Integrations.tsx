export type Status = { serv: boolean; dolphin: boolean; reppo: boolean; kite: boolean };

const ITEMS: { key: keyof Status; name: string; role: string }[] = [
  { key: "serv", name: "SERV Reasoning", role: "AI judgment" },
  { key: "dolphin", name: "Dolphin", role: "open AI models" },
  { key: "reppo", name: "Reppo", role: "scoring" },
  { key: "kite", name: "Kite Passport", role: "identity and limits" },
];

export default function Integrations({ status }: { status: Status | null }) {
  return (
    <div className="integrations" aria-label="Integrations">
      {ITEMS.map((it) => {
        const on = status?.[it.key];
        return (
          <div className={`integration ${status ? (on ? "on" : "off") : "wait"}`} key={it.key}>
            <span className="dot" />
            <span className="int-name">{it.name}</span>
            <span className="int-role">{on ? it.role : "ready to add"}</span>
          </div>
        );
      })}
    </div>
  );
}
