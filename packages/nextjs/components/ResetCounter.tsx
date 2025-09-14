"use client";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-stark/useScaffoldWriteContract";
import { useDeployedContractInfo } from "~~/hooks/scaffold-stark/useDeployedContractInfo";
import { CONTRACT_NAME } from "~~/utils/Constants";
import useScaffoldStrkBalance from "~~/hooks/scaffold-stark/useScaffoldStrkBalance";
import { uint256, Uint256 } from "starknet";

const DECIMALS = 18n;
const PAYMENT_TOKENS = 1n;
const PAYMENT_AMOUNT = uint256.bnToUint256(PAYMENT_TOKENS * 10n ** DECIMALS);

interface ResetCounterProps {
  counter: number;
  connectedAddress: string;
  ownerAddress: string;
}

export const ResetCounter = ({ counter, connectedAddress, ownerAddress }: ResetCounterProps) => {
  const { data: counterContract } = useDeployedContractInfo(CONTRACT_NAME);
  const counterAddress = counterContract?.address;

  const { value: strkBalance } = useScaffoldStrkBalance({ address: connectedAddress });

  const isOwner = connectedAddress && ownerAddress
    ? BigInt(connectedAddress) === BigInt(ownerAddress)
    : false;

  const hasSufficientBalance = strkBalance !== undefined && strkBalance >= PAYMENT_TOKENS;

  const isZero = counter === 0;
  const hasEnoughBalance = (strkBalance ?? 0n) >= uint256.uint256ToBN(PAYMENT_AMOUNT);

  const { sendAsync: sendResetAsync, isPending: isResetPending } = useScaffoldWriteContract({
    contractName: CONTRACT_NAME,
    functionName: "reset_counter",
  });

  const { sendAsync: sendApproveAsync, isPending: isApprovePending } = useScaffoldWriteContract({
    contractName: "Strk",
    functionName: "approve",
    args: [counterAddress ?? undefined, PAYMENT_AMOUNT],
  });

  const handleResetCounter = async () => {
    try {
      if (!isOwner && counterAddress) {
        await sendApproveAsync();
      }
      await sendResetAsync();
    } catch (e) {
      console.error("Error resetting counter:", e);
    }
  };

  return (
    <button
      title={!isOwner ? `Resetting the counter costs ${PAYMENT_TOKENS} STRK` : undefined}
      onClick={handleResetCounter}
      disabled={isResetPending || isApprovePending || isZero || (!isOwner && !hasSufficientBalance)}
      className="btn btn-primary"
    >
      Reset Counter
    </button>
  );
};