import { readContract } from "../../../../../transaction/read-contract.js";
import type { BaseTransactionOptions } from "../../../../../transaction/types.js";

import { decodeAbiParameters } from "viem";
import type { Hex } from "../../../../../utils/encoding/hex.js";

export const FN_SELECTOR = "0xe33acf38" as const;
const FN_INPUTS = [] as const;
const FN_OUTPUTS = [
  {
    type: "uint256",
  },
] as const;

/**
 * Decodes the result of the maxKeysPerFid function call.
 * @param result - The hexadecimal result to decode.
 * @returns The decoded result as per the FN_OUTPUTS definition.
 * @extension FARCASTER
 * @example
 * ```ts
 * import { decodeMaxKeysPerFidResult } from "thirdweb/extensions/farcaster";
 * const result = decodeMaxKeysPerFidResult("...");
 * ```
 */
export function decodeMaxKeysPerFidResult(result: Hex) {
  return decodeAbiParameters(FN_OUTPUTS, result)[0];
}

/**
 * Calls the "maxKeysPerFid" function on the contract.
 * @param options - The options for the maxKeysPerFid function.
 * @returns The parsed result of the function call.
 * @extension FARCASTER
 * @example
 * ```ts
 * import { maxKeysPerFid } from "thirdweb/extensions/farcaster";
 *
 * const result = await maxKeysPerFid();
 *
 * ```
 */
export async function maxKeysPerFid(options: BaseTransactionOptions) {
  return readContract({
    contract: options.contract,
    method: [FN_SELECTOR, FN_INPUTS, FN_OUTPUTS] as const,
    params: [],
  });
}
