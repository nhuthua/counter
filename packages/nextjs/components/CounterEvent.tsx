"use client";
import { useScaffoldEventHistory } from "~~/hooks/scaffold-stark/useScaffoldEventHistory";
import { CONTRACT_NAME } from "~~/utils/Constants";

type CounterChangeParsedArg = {
  caller: string;
  old_value: number;
  new_value: number;
  reason?: Reason;
};

type Reason = {
  variant: Record<string, {}>;
};

export const CounterEvent = () => {
  const { data, isLoading } = useScaffoldEventHistory({
    contractName: CONTRACT_NAME,
    eventName: "CounterChanged",
    fromBlock: 0n,
    watch: true,
    format: true,
  });

  const activeVariant = (reason: Reason): string => {
    const variant = reason.variant;
    const keys = Object.keys(variant);
    if (keys.length === 0) {
      return "";
    } else if (keys.length === 1) {
      return keys[0];
    } else {
      return keys.find((k) => variant[k]) ?? "";
    }
  };

  return (
    <div className="w-full max-w-xl mt-6">
      <h3 className="font-semibold mb-2">Counter Change Events</h3>
      <div className="border rounded p-3 space-y-2 text-sm">
        {isLoading ? (
          <div className="text-sm opacity-70">Loading events...</div>
        ) : data && data.length > 0 ? (
          data.map((ev: { parsedArgs: CounterChangeParsedArg }, idx: number) => (
            <div key={idx}>
              <div>
                <span className="font-medium">Caller:</span> {ev.parsedArgs.caller}
              </div>
              <div>
                <span className="font-medium">Old Value:</span> {ev.parsedArgs.old_value}
                {" "}
                <span className="font-medium">New Value:</span> {ev.parsedArgs.new_value}
                {" "}
                {ev.parsedArgs.reason && (
                  <>
                    <span className="font-medium">Reason:</span>{" "}
                    {activeVariant(ev.parsedArgs.reason)}
                  </>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="text-sm opacity-70">No events found</div>
        )}
      </div>
    </div>
  );
};