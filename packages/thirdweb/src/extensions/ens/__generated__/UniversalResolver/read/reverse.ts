import type { AbiParameterToPrimitiveType } from "abitype";
import { readContract } from "../../../../../transaction/read-contract.js";
import type { BaseTransactionOptions } from "../../../../../transaction/types.js";
import { encodeAbiParameters } from "../../../../../utils/abi/encodeAbiParameters.js";
import { decodeAbiParameters } from "viem";
import type { Hex } from "../../../../../utils/encoding/hex.js";

/**
 * Represents the parameters for the "reverse" function.
 */
export type ReverseParams = {
  reverseName: AbiParameterToPrimitiveType<{
    type: "bytes";
    name: "reverseName";
  }>;
};

export const FN_SELECTOR = "0xec11c823" as const;
const FN_INPUTS = [
  {
    type: "bytes",
    name: "reverseName",
  },
] as const;
const FN_OUTPUTS = [
  {
    type: "string",
  },
  {
    type: "address",
  },
  {
    type: "address",
  },
  {
    type: "address",
  },
] as const;

/**
 * Encodes the parameters for the "reverse" function.
 * @param options - The options for the reverse function.
 * @returns The encoded ABI parameters.
 * @extension ENS
 * @example
 * ```ts
 * import { encodeReverseParams } "thirdweb/extensions/ens";
 * const result = encodeReverseParams({
 *  reverseName: ...,
 * });
 * ```
 */
export function encodeReverseParams(options: ReverseParams) {
  return encodeAbiParameters(FN_INPUTS, [options.reverseName]);
}

/**
 * Decodes the result of the reverse function call.
 * @param result - The hexadecimal result to decode.
 * @returns The decoded result as per the FN_OUTPUTS definition.
 * @extension ENS
 * @example
 * ```ts
 * import { decodeReverseResult } from "thirdweb/extensions/ens";
 * const result = decodeReverseResult("...");
 * ```
 */
export function decodeReverseResult(result: Hex) {
  return decodeAbiParameters(FN_OUTPUTS, result);
}

/**
 * Calls the "reverse" function on the contract.
 * @param options - The options for the reverse function.
 * @returns The parsed result of the function call.
 * @extension ENS
 * @example
 * ```ts
 * import { reverse } from "thirdweb/extensions/ens";
 *
 * const result = await reverse({
 *  reverseName: ...,
 * });
 *
 * ```
 */
export async function reverse(options: BaseTransactionOptions<ReverseParams>) {
  return readContract({
    contract: options.contract,
    method: [FN_SELECTOR, FN_INPUTS, FN_OUTPUTS] as const,
    params: [options.reverseName],
  });
}
