import type { AbiParameterToPrimitiveType } from "abitype";
import type { BaseTransactionOptions } from "../../../../../transaction/types.js";
import { prepareContractCall } from "../../../../../transaction/prepare-contract-call.js";
import { encodeAbiParameters } from "../../../../../utils/abi/encodeAbiParameters.js";

/**
 * Represents the parameters for the "claim" function.
 */

export type ClaimParams = {
  receiver: AbiParameterToPrimitiveType<{ type: "address"; name: "receiver" }>;
  tokenId: AbiParameterToPrimitiveType<{ type: "uint256"; name: "tokenId" }>;
  quantity: AbiParameterToPrimitiveType<{ type: "uint256"; name: "quantity" }>;
  currency: AbiParameterToPrimitiveType<{ type: "address"; name: "currency" }>;
  pricePerToken: AbiParameterToPrimitiveType<{
    type: "uint256";
    name: "pricePerToken";
  }>;
  allowlistProof: AbiParameterToPrimitiveType<{
    type: "tuple";
    name: "allowlistProof";
    components: [
      { type: "bytes32[]"; name: "proof" },
      { type: "uint256"; name: "quantityLimitPerWallet" },
      { type: "uint256"; name: "pricePerToken" },
      { type: "address"; name: "currency" },
    ];
  }>;
  data: AbiParameterToPrimitiveType<{ type: "bytes"; name: "data" }>;
};

export const FN_SELECTOR = "0x57bc3d78" as const;
const FN_INPUTS = [
  {
    type: "address",
    name: "receiver",
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
    type: "address",
    name: "currency",
  },
  {
    type: "uint256",
    name: "pricePerToken",
  },
  {
    type: "tuple",
    name: "allowlistProof",
    components: [
      {
        type: "bytes32[]",
        name: "proof",
      },
      {
        type: "uint256",
        name: "quantityLimitPerWallet",
      },
      {
        type: "uint256",
        name: "pricePerToken",
      },
      {
        type: "address",
        name: "currency",
      },
    ],
  },
  {
    type: "bytes",
    name: "data",
  },
] as const;
const FN_OUTPUTS = [] as const;

/**
 * Encodes the parameters for the "claim" function.
 * @param options - The options for the claim function.
 * @returns The encoded ABI parameters.
 * @extension ERC1155
 * @example
 * ```ts
 * import { encodeClaimParams } "thirdweb/extensions/erc1155";
 * const result = encodeClaimParams({
 *  receiver: ...,
 *  tokenId: ...,
 *  quantity: ...,
 *  currency: ...,
 *  pricePerToken: ...,
 *  allowlistProof: ...,
 *  data: ...,
 * });
 * ```
 */
export function encodeClaimParams(options: ClaimParams) {
  return encodeAbiParameters(FN_INPUTS, [
    options.receiver,
    options.tokenId,
    options.quantity,
    options.currency,
    options.pricePerToken,
    options.allowlistProof,
    options.data,
  ]);
}

/**
 * Calls the "claim" function on the contract.
 * @param options - The options for the "claim" function.
 * @returns A prepared transaction object.
 * @extension ERC1155
 * @example
 * ```ts
 * import { claim } from "thirdweb/extensions/erc1155";
 *
 * const transaction = claim({
 *  contract,
 *  receiver: ...,
 *  tokenId: ...,
 *  quantity: ...,
 *  currency: ...,
 *  pricePerToken: ...,
 *  allowlistProof: ...,
 *  data: ...,
 * });
 *
 * // Send the transaction
 * ...
 *
 * ```
 */
export function claim(
  options: BaseTransactionOptions<
    | ClaimParams
    | {
        asyncParams: () => Promise<ClaimParams>;
      }
  >,
) {
  return prepareContractCall({
    contract: options.contract,
    method: [FN_SELECTOR, FN_INPUTS, FN_OUTPUTS] as const,
    params:
      "asyncParams" in options
        ? async () => {
            const resolvedParams = await options.asyncParams();
            return [
              resolvedParams.receiver,
              resolvedParams.tokenId,
              resolvedParams.quantity,
              resolvedParams.currency,
              resolvedParams.pricePerToken,
              resolvedParams.allowlistProof,
              resolvedParams.data,
            ] as const;
          }
        : [
            options.receiver,
            options.tokenId,
            options.quantity,
            options.currency,
            options.pricePerToken,
            options.allowlistProof,
            options.data,
          ],
  });
}
