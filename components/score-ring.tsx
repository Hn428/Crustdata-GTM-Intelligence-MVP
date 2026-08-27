export function ScoreRing({ score }: { score: number }) {
  return (
    <div
      className="grid h-[74px] w-[74px] shrink-0 place-items-center rounded-full"
      style={{ background: `conic-gradient(var(--mint) ${score * 3.6}deg, #e5ece7 0deg)` }}
      aria-label={`${score} percent fit score`}
    >
      <div className="grid h-[62px] w-[62px] place-items-center rounded-full bg-white text-center">
        <span className="text-[21px] font-extrabold leading-none tracking-[-0.05em] text-[var(--ink)]">{score}</span>
        <span className="mt-[-8px] text-[9px] font-bold uppercase tracking-[0.1em] text-[#81938c]">fit</span>
      </div>
    </div>
  );
}
