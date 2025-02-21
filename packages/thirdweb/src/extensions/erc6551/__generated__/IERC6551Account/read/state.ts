import { readContract } from "../../../../../transaction/read-contract.js";
import type { BaseTransactionOptions } from "../../../../../transaction/types.js";

import { decodeAbiParameters } from "viem";
import type { Hex } from "../../../../../utils/encoding/hex.js";

export const FN_SELECTOR = "0xc19d93fb" as const;
const FN_INPUTS = [] as const;
const FN_OUTPUTS = [
  {
    type: "uint256",
  },
] as const;

/**
 * Decodes the result of the state function call.
 * @param result - The hexadecimal result to decode.
 * @returns The decoded result as per the FN_OUTPUTS definition.
 * @extension ERC6551
 * @example
 * ```ts
 * import { decodeStateResult } from "thirdweb/extensions/erc6551";
 * const result = decodeStateResult("...");
 * ```
 */
export function decodeStateResult(result: Hex) {
  return decodeAbiParameters(FN_OUTPUTS, result)[0];
}

/**
 * Calls the "state" function on the contract.
 * @param options - The options for the state function.
 * @returns The parsed result of the function call.
 * @extension ERC6551
 * @example
 * ```ts
 * import { state } from "thirdweb/extensions/erc6551";
 *
 * const result = await state();
 *
 * ```
 */
export async function state(options: BaseTransactionOptions) {
  return readContract({
    contract: options.contract,
    method: [FN_SELECTOR, FN_INPUTS, FN_OUTPUTS] as const,
    params: [],
  });
}
