import type { BaseTransactionOptions } from "../../../../../transaction/types.js";
import { prepareContractCall } from "../../../../../transaction/prepare-contract-call.js";

export const FN_SELECTOR = "0xd111515d" as const;
const FN_INPUTS = [] as const;
const FN_OUTPUTS = [] as const;

/**
 * Calls the "freezeMetadata" function on the contract.
 * @param options - The options for the "freezeMetadata" function.
 * @returns A prepared transaction object.
 * @extension ERC721
 * @example
 * ```ts
 * import { freezeMetadata } from "thirdweb/extensions/erc721";
 *
 * const transaction = freezeMetadata();
 *
 * // Send the transaction
 * ...
 *
 * ```
 */
export function freezeMetadata(options: BaseTransactionOptions) {
  return prepareContractCall({
    contract: options.contract,
    method: [FN_SELECTOR, FN_INPUTS, FN_OUTPUTS] as const,
  });
}
