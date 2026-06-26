import { getT } from '@gitroom/react/translation/get.translation.service.backend';

export const dynamic = 'force-dynamic';
import { ReactNode } from 'react';
import loadDynamic from 'next/dynamic';
const ReturnUrlComponent = loadDynamic(() => import('./return.url.component'));
export default async function AuthLayout({
  children,
}: {
  children: ReactNode;
}) {
  const t = await getT();

  return (
    <div className="bg-[#0E0E0E] flex flex-1 p-[12px] gap-[12px] min-h-screen w-screen text-white">
      {/*<style>{`html, body {overflow-x: hidden;}`}</style>*/}
      <ReturnUrlComponent />
      <div className="flex flex-col py-[40px] px-[20px] flex-1 lg:w-[600px] lg:flex-none rounded-[12px] text-white p-[12px] bg-[#1A1919]">
        <div className="w-full max-w-[440px] mx-auto justify-center gap-[20px] h-full flex flex-col text-white">
          <div className="text-[28px] font-semibold tracking-[-0.04em] lowercase">
            givebettr
          </div>
          <div className="flex">{children}</div>
        </div>
      </div>
      <div className="text-[36px] flex-1 pt-[88px] hidden lg:flex flex-col items-center">
        <div className="text-center">
          Plan, schedule, and grow
          <br />
          your social presence
        </div>
        <div className="mt-[36px] max-w-[850px] grid grid-cols-2 gap-[12px] px-[40px] text-left text-[16px]">
          <div className="rounded-[16px] border border-white/10 bg-white/5 p-[20px]">
            Unified publishing across your key social channels.
          </div>
          <div className="rounded-[16px] border border-white/10 bg-white/5 p-[20px]">
            AI-assisted drafting and scheduling workflows.
          </div>
          <div className="rounded-[16px] border border-white/10 bg-white/5 p-[20px]">
            A focused workspace for planning, review, and publishing.
          </div>
          <div className="rounded-[16px] border border-white/10 bg-white/5 p-[20px]">
            Flexible self-hosted deployment for controlled pilot use.
          </div>
        </div>
      </div>
    </div>
  );
}
