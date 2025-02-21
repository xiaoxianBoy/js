import type { AbiParameterToPrimitiveType } from "abitype";
import { readContract } from "../../../../../transaction/read-contract.js";
import type { BaseTransactionOptions } from "../../../../../transaction/types.js";
import { encodeAbiParameters } from "../../../../../utils/abi/encodeAbiParameters.js";
import { decodeAbiParameters } from "viem";
import type { Hex } from "../../../../../utils/encoding/hex.js";

/**
 * Represents the parameters for the "getListing" function.
 */
export type GetListingParams = {
  listingId: AbiParameterToPrimitiveType<{
    type: "uint256";
    name: "_listingId";
  }>;
};

export const FN_SELECTOR = "0x107a274a" as const;
const FN_INPUTS = [
  {
    type: "uint256",
    name: "_listingId",
  },
] as const;
const FN_OUTPUTS = [
  {
    type: "tuple",
    name: "listing",
    components: [
      {
        type: "uint256",
        name: "listingId",
      },
      {
        type: "uint256",
        name: "tokenId",
      },
      {
        type: "uint256",
        name: "quantity",
      },
      {
        type: "uint256",
        name: "pricePerToken",
      },
      {
        type: "uint128",
        name: "startTimestamp",
      },
      {
        type: "uint128",
        name: "endTimestamp",
      },
      {
        type: "address",
        name: "listingCreator",
      },
      {
        type: "address",
        name: "assetContract",
      },
      {
        type: "address",
        name: "currency",
      },
      {
        type: "uint8",
        name: "tokenType",
      },
      {
        type: "uint8",
        name: "status",
      },
      {
        type: "bool",
        name: "reserved",
      },
    ],
  },
] as const;

/**
 * Encodes the parameters for the "getListing" function.
 * @param options - The options for the getListing function.
 * @returns The encoded ABI parameters.
 * @extension MARKETPLACE
 * @example
 * ```ts
 * import { encodeGetListingParams } "thirdweb/extensions/marketplace";
 * const result = encodeGetListingParams({
 *  listingId: ...,
 * });
 * ```
 */
export function encodeGetListingParams(options: GetListingParams) {
  return encodeAbiParameters(FN_INPUTS, [options.listingId]);
}

/**
 * Decodes the result of the getListing function call.
 * @param result - The hexadecimal result to decode.
 * @returns The decoded result as per the FN_OUTPUTS definition.
 * @extension MARKETPLACE
 * @example
 * ```ts
 * import { decodeGetListingResult } from "thirdweb/extensions/marketplace";
 * const result = decodeGetListingResult("...");
 * ```
 */
export function decodeGetListingResult(result: Hex) {
  return decodeAbiParameters(FN_OUTPUTS, result)[0];
}

/**
 * Calls the "getListing" function on the contract.
 * @param options - The options for the getListing function.
 * @returns The parsed result of the function call.
 * @extension MARKETPLACE
 * @example
 * ```ts
 * import { getListing } from "thirdweb/extensions/marketplace";
 *
 * const result = await getListing({
 *  listingId: ...,
 * });
 *
 * ```
 */
export async function getListing(
  options: BaseTransactionOptions<GetListingParams>,
) {
  return readContract({
    contract: options.contract,
    method: [FN_SELECTOR, FN_INPUTS, FN_OUTPUTS] as const,
    params: [options.listingId],
  });
}
