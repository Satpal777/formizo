import {
  Check,
  FilePlus2,
  FolderOpen,
  GitBranch,
  Lightbulb,
  Server,
  Sparkle,
  Upload,
} from "lucide-react";

const startLinks = [
  { label: "New File...", icon: FilePlus2 },
  { label: "Open File...", icon: Upload },
  { label: "Open Folder...", icon: FolderOpen },
  { label: "Open Repository...", icon: GitBranch },
  { label: "Open Tunnel...", icon: Server },
];

const walkthroughs = [
  {
    title: "Get Started with VS Code for the Web",
    subtitle: "Customize your editor, learn the basics, and start coding",
    featured: true,
  },
  { title: "Learn the Fundamentals", icon: Lightbulb },
  {
    title: "Browse & Edit Remote Repositories without Cloni...",
    image: true,
    badge: "Updated",
  },
];

export function WelcomeContent() {
  return (
    <div className="relative h-[calc(100%-72px)] overflow-auto px-6 pb-14 pt-[84px]">
      <div className="mx-auto grid max-w-[680px] grid-cols-[minmax(280px,1fr)_minmax(300px,440px)] gap-[94px] xl:max-w-[968px]">
        <section>
          <h1 className="text-[34px] font-normal leading-none text-[#d4d4d4]">Visual Studio Code</h1>
          <p className="mt-1 text-[18px] leading-none text-[#9d9d9d]">Editing evolved</p>

          <div className="mt-7">
            <h2 className="text-[19px] font-normal leading-none text-[#dddddd]">Start</h2>
            <div className="mt-3 space-y-2.5">
              {startLinks.map((item) => (
                <button
                  key={item.label}
                  className="flex items-center gap-2.5 text-[13px] leading-none text-[#3794ff] transition hover:text-[#5fb3ff] hover:underline"
                >
                  <item.icon className="size-[18px]" strokeWidth={1.9} />
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6">
            <h2 className="text-[19px] font-normal leading-none text-[#dddddd]">Recent</h2>
            <p className="mt-3 text-[13px] text-white">
              You have no recent folders,{" "}
              <button className="text-[#3794ff] hover:underline">open a folder</button> to start.
            </p>
          </div>
        </section>

        <section className="pt-[82px]">
          <h2 className="text-[19px] font-normal leading-none text-[#dddddd]">Walkthroughs</h2>
          <div className="mt-3.5 space-y-4">
            {walkthroughs.map((item) => (
              <article
                key={item.title}
                className="relative flex min-h-8 items-center overflow-hidden rounded-[6px] bg-[#2b2b2b] px-2.5 text-[#dddddd]"
              >
                {item.featured ? (
                  <>
                    <div className="absolute left-0 top-0 size-9 bg-[#3794ff] [clip-path:polygon(0_0,100%_0,0_100%)]" />
                    <Sparkle className="absolute left-[5px] top-1 size-3.5 text-white" fill="white" />
                  </>
                ) : null}

                {item.icon ? <item.icon className="mr-3 size-4 shrink-0 text-[#3794ff]" /> : null}
                {item.image ? (
                  <div className="mr-2.5 grid size-5 shrink-0 place-items-center rounded-sm bg-[#d8dee9] text-[11px] text-[#4f7f37]">
                    <FolderOpen className="size-3.5" />
                  </div>
                ) : null}

                <div className={item.featured ? "py-2.5 pl-7" : "min-w-0 py-1.5"}>
                  <h3 className="truncate text-[14px] font-semibold leading-none">{item.title}</h3>
                  {item.subtitle ? (
                    <p className="mt-2.5 text-[12px] leading-none text-white">{item.subtitle}</p>
                  ) : null}
                </div>

                {item.badge ? (
                  <span className="ml-1.5 rounded-[4px] bg-[#0078d4] px-1.5 py-0.5 text-[10px] font-semibold text-white">
                    {item.badge}
                  </span>
                ) : null}
              </article>
            ))}
          </div>
        </section>
      </div>

      <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 flex-col items-center text-center text-[12px] leading-[1.4] text-white">
        <label className="flex items-center gap-2.5">
          <span className="grid size-5 place-items-center rounded-[4px] border border-[#4d4d4d] bg-[#303030]">
            <Check className="size-3.5 text-[#d4d4d4]" />
          </span>
          <span>Show welcome page on startup</span>
        </label>
        <p>
          Code collects usage data. Read our{" "}
          <button className="text-[#3794ff] hover:underline">privacy statement</button> and learn
          how to <button className="text-[#3794ff] hover:underline">opt out</button>.
        </p>
      </div>
    </div>
  );
}
