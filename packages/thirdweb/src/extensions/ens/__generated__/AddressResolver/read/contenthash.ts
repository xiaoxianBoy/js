import type { AbiParameterToPrimitiveType } from "abitype";
import { readContract } from "../../../../../transaction/read-contract.js";
import type { BaseTransactionOptions } from "../../../../../transaction/types.js";
import { encodeAbiParameters } from "../../../../../utils/abi/encodeAbiParameters.js";
import { decodeAbiParameters } from "viem";
import type { Hex } from "../../../../../utils/encoding/hex.js";

/**
 * Represents the parameters for the "contenthash" function.
 */
export type ContenthashParams = {
  name: AbiParameterToPrimitiveType<{ type: "bytes32"; name: "name" }>;
};

export const FN_SELECTOR = "0xbc1c58d1" as const;
const FN_INPUTS = [
  {
    type: "bytes32",
    name: "name",
  },
] as const;
const FN_OUTPUTS = [
  {
    type: "bytes",
  },
] as const;

/**
 * Encodes the parameters for the "contenthash" function.
 * @param options - The options for the contenthash function.
 * @returns The encoded ABI parameters.
 * @extension ENS
 * @example
 * ```ts
 * import { encodeContenthashParams } "thirdweb/extensions/ens";
 * const result = encodeContenthashParams({
 *  name: ...,
 * });
 * ```
 */
export function encodeContenthashParams(options: ContenthashParams) {
  return encodeAbiParameters(FN_INPUTS, [options.name]);
}

/**
 * Decodes the result of the contenthash function call.
 * @param result - The hexadecimal result to decode.
 * @returns The decoded result as per the FN_OUTPUTS definition.
 * @extension ENS
 * @example
 * ```ts
 * import { decodeContenthashResult } from "thirdweb/extensions/ens";
 * const result = decodeContenthashResult("...");
 * ```
 */
export function decodeContenthashResult(result: Hex) {
  return decodeAbiParameters(FN_OUTPUTS, result)[0];
}

/**
 * Calls the "contenthash" function on the contract.
 * @param options - The options for the contenthash function.
 * @returns The parsed result of the function call.
 * @extension ENS
 * @example
 * ```ts
 * import { contenthash } from "thirdweb/extensions/ens";
 *
 * const result = await contenthash({
 *  name: ...,
 * });
 *
 * ```
 */
export async function contenthash(
  options: BaseTransactionOptions<ContenthashParams>,
) {
  return readContract({
    contract: options.contract,
    method: [FN_SELECTOR, FN_INPUTS, FN_OUTPUTS] as const,
    params: [options.name],
  });
}
