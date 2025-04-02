"use client";

export function StepMessage({
  part,
  messageID,
}: {
  part: any;
  messageID: string;
}) {
  return (
    <div>
      <div className="flex justify-between items-center cursor-pointer">
        <div className="font-semibold">Step {part.step} Finished</div>
      </div>
    </div>
  );
}
