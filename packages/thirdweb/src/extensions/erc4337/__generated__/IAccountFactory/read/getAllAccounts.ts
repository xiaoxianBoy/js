import { readContract } from "../../../../../transaction/read-contract.js";
import type { BaseTransactionOptions } from "../../../../../transaction/types.js";

import { decodeAbiParameters } from "viem";
import type { Hex } from "../../../../../utils/encoding/hex.js";

export const FN_SELECTOR = "0x08e93d0a" as const;
const FN_INPUTS = [] as const;
const FN_OUTPUTS = [
  {
    type: "address[]",
  },
] as const;

/**
 * Decodes the result of the getAllAccounts function call.
 * @param result - The hexadecimal result to decode.
 * @returns The decoded result as per the FN_OUTPUTS definition.
 * @extension ERC4337
 * @example
 * ```ts
 * import { decodeGetAllAccountsResult } from "thirdweb/extensions/erc4337";
 * const result = decodeGetAllAccountsResult("...");
 * ```
 */
export function decodeGetAllAccountsResult(result: Hex) {
  return decodeAbiParameters(FN_OUTPUTS, result)[0];
}

/**
 * Calls the "getAllAccounts" function on the contract.
 * @param options - The options for the getAllAccounts function.
 * @returns The parsed result of the function call.
 * @extension ERC4337
 * @example
 * ```ts
 * import { getAllAccounts } from "thirdweb/extensions/erc4337";
 *
 * const result = await getAllAccounts();
 *
 * ```
 */
export async function getAllAccounts(options: BaseTransactionOptions) {
  return readContract({
    contract: options.contract,
    method: [FN_SELECTOR, FN_INPUTS, FN_OUTPUTS] as const,
    params: [],
  });
}
