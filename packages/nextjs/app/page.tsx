"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ConnectedAddress } from "~~/components/ConnectedAddress";
import { useScaffoldContract } from "~~/hooks/scaffold-stark/useScaffoldContract";
import { IncreaseCounter } from "~~/components/IncreaseCounter";
import { DecreaseCounter } from "~~/components/DecreaseCounter";
import { ResetCounter } from "~~/components/ResetCounter";
import { SetCounter } from "~~/components/SetCounter";
import { useAccount } from "~~/hooks/useAccount";
import { CONTRACT_NAME } from "~~/utils/Constants";
import { CounterEvent } from "~~/components/CounterEvent";

const Home = () => {
  const [counter, setCounter] = useState<number | null>(null);
  const [ownerAddress, setOwnerAddress] = useState<string>("");

  // Lấy instance hợp đồng
  const { data: contract, isLoading: isCounterLoading } = useScaffoldContract({
    contractName: CONTRACT_NAME,
  });

  // Lấy instance hợp đồng cho owner
  const { data: ownerContract, isLoading: isOwnerLoading } = useScaffoldContract({
    contractName: CONTRACT_NAME,
  });

  // Gọi các hàm hợp đồng bất đồng bộ
  useEffect(() => {
    const fetchData = async () => {
      if (contract) {
        try {
          const counterData = await contract.get_counter();
          setCounter(Number(counterData));
        } catch (err) {
          console.error("Error fetching counter:", err);
          setCounter(0);
        }
      }
      if (ownerContract) {
        try {
          const ownerData = await ownerContract.owner();
          setOwnerAddress(ownerData.toString());
        } catch (err) {
          console.error("Error fetching owner:", err);
          setOwnerAddress("");
        }
      }
    };
    fetchData();
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, [contract, ownerContract]);

  const { address: connectedAddress } = useAccount();
  const connectedAddressStr = connectedAddress ?? "";

  return (
    <div className="flex items-center flex-col flex-grow pt-10">
      <p>Counter: {isCounterLoading || counter === null ? "Loading..." : counter}</p>
      <div className="flex gap-4 items-center">
        <IncreaseCounter />
        <DecreaseCounter counter={counter ?? 0} />
        <ResetCounter
          counter={counter ?? 0}
          connectedAddress={connectedAddressStr}
          ownerAddress={ownerAddress}
        />
      </div>
      <div className="mt-4">
        <SetCounter connectedAddress={connectedAddressStr} ownerAddress={ownerAddress} />
      </div>
      <CounterEvent />
    </div>
  );
};

export default Home;