import type { AbiParameterToPrimitiveType } from "abitype";
import { readContract } from "../../../../../transaction/read-contract.js";
import type { BaseTransactionOptions } from "../../../../../transaction/types.js";
import { encodeAbiParameters } from "../../../../../utils/abi/encodeAbiParameters.js";
import { decodeAbiParameters } from "viem";
import type { Hex } from "../../../../../utils/encoding/hex.js";

/**
 * Represents the parameters for the "getPublishedContractVersions" function.
 */
export type GetPublishedContractVersionsParams = {
  publisher: AbiParameterToPrimitiveType<{
    type: "address";
    name: "publisher";
  }>;
  contractId: AbiParameterToPrimitiveType<{
    type: "string";
    name: "contractId";
  }>;
};

export const FN_SELECTOR = "0x80251dac" as const;
const FN_INPUTS = [
  {
    type: "address",
    name: "publisher",
  },
  {
    type: "string",
    name: "contractId",
  },
] as const;
const FN_OUTPUTS = [
  {
    type: "tuple[]",
    name: "published",
    components: [
      {
        type: "string",
        name: "contractId",
      },
      {
        type: "uint256",
        name: "publishTimestamp",
      },
      {
        type: "string",
        name: "publishMetadataUri",
      },
      {
        type: "bytes32",
        name: "bytecodeHash",
      },
      {
        type: "address",
        name: "implementation",
      },
    ],
  },
] as const;

/**
 * Encodes the parameters for the "getPublishedContractVersions" function.
 * @param options - The options for the getPublishedContractVersions function.
 * @returns The encoded ABI parameters.
 * @extension THIRDWEB
 * @example
 * ```ts
 * import { encodeGetPublishedContractVersionsParams } "thirdweb/extensions/thirdweb";
 * const result = encodeGetPublishedContractVersionsParams({
 *  publisher: ...,
 *  contractId: ...,
 * });
 * ```
 */
export function encodeGetPublishedContractVersionsParams(
  options: GetPublishedContractVersionsParams,
) {
  return encodeAbiParameters(FN_INPUTS, [
    options.publisher,
    options.contractId,
  ]);
}

/**
 * Decodes the result of the getPublishedContractVersions function call.
 * @param result - The hexadecimal result to decode.
 * @returns The decoded result as per the FN_OUTPUTS definition.
 * @extension THIRDWEB
 * @example
 * ```ts
 * import { decodeGetPublishedContractVersionsResult } from "thirdweb/extensions/thirdweb";
 * const result = decodeGetPublishedContractVersionsResult("...");
 * ```
 */
export function decodeGetPublishedContractVersionsResult(result: Hex) {
  return decodeAbiParameters(FN_OUTPUTS, result)[0];
}

/**
 * Calls the "getPublishedContractVersions" function on the contract.
 * @param options - The options for the getPublishedContractVersions function.
 * @returns The parsed result of the function call.
 * @extension THIRDWEB
 * @example
 * ```ts
 * import { getPublishedContractVersions } from "thirdweb/extensions/thirdweb";
 *
 * const result = await getPublishedContractVersions({
 *  publisher: ...,
 *  contractId: ...,
 * });
 *
 * ```
 */
export async function getPublishedContractVersions(
  options: BaseTransactionOptions<GetPublishedContractVersionsParams>,
) {
  return readContract({
    contract: options.contract,
    method: [FN_SELECTOR, FN_INPUTS, FN_OUTPUTS] as const,
    params: [options.publisher, options.contractId],
  });
}
