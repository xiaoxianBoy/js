import type {
  ClientIdWithQuerierType,
  GetUser,
  GetUserWalletStatusRpcReturnType,
  SetUpWalletRpcReturnType,
  WalletAddressObjectType,
} from "../../interfaces/in-app-wallets/in-app-wallets.js";
import { UserWalletStatus } from "../../interfaces/in-app-wallets/in-app-wallets.js";
import { LocalStorage } from "../../utils/Storage/LocalStorage.js";
import type { InAppWalletIframeCommunicator } from "../../utils/iFrameCommunication/InAppWalletIframeCommunicator.js";
import type {
  GetAddressReturnType,
  SignMessageReturnType,
  SignTransactionReturnType,
  SignedTypedDataReturnType,
} from "../../interfaces/in-app-wallets/signer.js";
import { getRpcClient } from "../../../../../rpc/rpc.js";
import { defineChain } from "../../../../../chains/utils.js";
import type {
  Account,
  SendTransactionOption,
} from "../../../../interfaces/wallet.js";
import type { Hex, TypedDataDefinition } from "viem";
import type * as ethers5 from "ethers5";
import { eth_sendRawTransaction } from "../../../../../rpc/actions/eth_sendRawTransaction.js";
import type { ThirdwebClient } from "../../../../../client/client.js";

export type WalletManagementTypes = {
  createWallet: void;
  setUpNewDevice: void;
  getUserStatus: void;
};
export type WalletManagementUiTypes = {
  createWalletUi: void;
  setUpNewDeviceUi: void;
};

export type InAppWalletInternalHelperType = { showUi: boolean };

export type SignerProcedureTypes = {
  getAddress: void;
  signMessage: {
    message: string | Hex;
    chainId: number;
    rpcEndpoint?: string;
  };
  signTransaction: {
    transaction: ethers5.ethers.providers.TransactionRequest;
    chainId: number;
    rpcEndpoint?: string;
  };
  signTypedDataV4: {
    domain: TypedDataDefinition["domain"];
    types: TypedDataDefinition["types"];
    message: TypedDataDefinition["message"];
    chainId: number;
    rpcEndpoint?: string;
  };
  //connect: { provider: Provider };
};

type PostWalletSetup = SetUpWalletRpcReturnType & {
  walletUserId: string;
};

/**
 *
 */
export class InAppWallet {
  protected client: ThirdwebClient;
  protected walletManagerQuerier: InAppWalletIframeCommunicator<
    WalletManagementTypes & WalletManagementUiTypes
  >;
  protected localStorage: LocalStorage;

  /**
   * Not meant to be initialized directly. Call {@link initializeUser} to get an instance
   * @internal
   */
  constructor({ client, querier }: ClientIdWithQuerierType) {
    this.client = client;
    this.walletManagerQuerier = querier;

    this.localStorage = new LocalStorage({ clientId: client.clientId });
  }

  /**
   * Used to set-up the user device in the case that they are using incognito
   * @returns `{walletAddress : string }` The user's wallet details
   * @internal
   */
  async postWalletSetUp({
    deviceShareStored,
    walletAddress,
    isIframeStorageEnabled,
    walletUserId,
  }: PostWalletSetup): Promise<WalletAddressObjectType> {
    if (!isIframeStorageEnabled) {
      await this.localStorage.saveDeviceShare(deviceShareStored, walletUserId);
    }
    return { walletAddress };
  }

  /**
   * Gets the various status states of the user
   * @example
   * ```typescript
   *  const userStatus = await Paper.getUserWalletStatus();
   *  switch (userStatus.status) {
   *  case UserWalletStatus.LOGGED_OUT: {
   *    // User is logged out, call one of the auth methods on Paper.auth to authenticate the user
   *    break;
   *  }
   *  case UserWalletStatus.LOGGED_IN_WALLET_UNINITIALIZED: {
   *    // User is logged in, but does not have a wallet associated with it
   *    // you also have access to the user's details
   *    userStatus.user.authDetails;
   *    break;
   *  }
   *  case UserWalletStatus.LOGGED_IN_NEW_DEVICE: {
   *    // User is logged in and created a wallet already, but is missing the device shard
   *    // You have access to:
   *    userStatus.user.authDetails;
   *    userStatus.user.walletAddress;
   *    break;
   *  }
   *  case UserWalletStatus.LOGGED_IN_WALLET_INITIALIZED: {
   *    // user is logged in and wallet is all set up.
   *    // You have access to:
   *    userStatus.user.authDetails;
   *    userStatus.user.walletAddress;
   *    userStatus.user.wallet;
   *    break;
   *  }
   *}
   *```
   * @returns `{GetUserWalletStatusFnReturnType}` an object to containing various information on the user statuses
   * @internal
   */
  async getUserWalletStatus(): Promise<GetUser> {
    const userStatus =
      await this.walletManagerQuerier.call<GetUserWalletStatusRpcReturnType>({
        procedureName: "getUserStatus",
        params: undefined,
      });
    if (userStatus.status === UserWalletStatus.LOGGED_IN_WALLET_INITIALIZED) {
      return {
        status: UserWalletStatus.LOGGED_IN_WALLET_INITIALIZED,
        ...userStatus.user,
        wallet: this,
      };
    } else if (userStatus.status === UserWalletStatus.LOGGED_IN_NEW_DEVICE) {
      return {
        status: UserWalletStatus.LOGGED_IN_WALLET_UNINITIALIZED,
        ...userStatus.user,
      };
    } else if (
      userStatus.status === UserWalletStatus.LOGGED_IN_WALLET_UNINITIALIZED
    ) {
      return {
        status: UserWalletStatus.LOGGED_IN_WALLET_UNINITIALIZED,
        ...userStatus.user,
      };
    } else {
      // Logged out
      return { status: userStatus.status };
    }
  }

  /**
   * Returns an account that communicates with the iFrame for signing operations
   * @internal
   */
  async getAccount(): Promise<Account> {
    const querier = this
      .walletManagerQuerier as unknown as InAppWalletIframeCommunicator<SignerProcedureTypes>;
    const { address } = await querier.call<GetAddressReturnType>({
      procedureName: "getAddress",
      params: undefined,
    });
    const _signTransaction = async (tx: SendTransactionOption) => {
      const { signedTransaction } =
        await querier.call<SignTransactionReturnType>({
          procedureName: "signTransaction",
          params: {
            transaction: {
              to: tx.to ?? undefined,
              data: tx.data,
              value: tx.value,
              gasLimit: tx.gas,
              gasPrice: tx.gasPrice,
              nonce: tx.nonce,
              chainId: tx.chainId,
              accessList: tx.accessList,
              maxFeePerGas: tx.maxFeePerGas,
              maxPriorityFeePerGas: tx.maxPriorityFeePerGas,
              type: tx.maxFeePerGas ? 2 : 0,
            },
            chainId: tx.chainId,
            rpcEndpoint: `https://${tx.chainId}.rpc.thirdweb.com`, // TODO (ew) shouldnt be needed
          },
        });
      return signedTransaction as Hex;
    };
    const client = this.client;
    return {
      address,
      async signTransaction(tx) {
        if (!tx.chainId) {
          throw new Error("chainId required in tx to sign");
        }
        return _signTransaction({
          ...tx,
          chainId: tx.chainId,
        });
      },
      async sendTransaction(tx) {
        const rpcRequest = getRpcClient({
          client,
          chain: defineChain(tx.chainId),
        });
        const signedTx = await _signTransaction(tx);
        const transactionHash = await eth_sendRawTransaction(
          rpcRequest,
          signedTx,
        );
        return {
          transactionHash,
        };
      },
      async signMessage({ message }) {
        const messageDecoded =
          typeof message === "string" ? message : message.raw;
        const { signedMessage } = await querier.call<SignMessageReturnType>({
          procedureName: "signMessage",
          params: {
            message: messageDecoded as any, // wants Bytes or string
            chainId: 1, // TODO check if we need this
          },
        });
        return signedMessage as Hex;
      },
      async signTypedData(_typedData) {
        // deleting EIP712 Domain as it results in ambiguous primary type on some cases
        // this happens when going from viem to ethers via the iframe
        if (_typedData.types && _typedData.types.EIP712Domain) {
          delete _typedData.types.EIP712Domain;
        }
        const chainId = Number((_typedData.domain as any)?.chainId || 1);

        const { signedTypedData } =
          await querier.call<SignedTypedDataReturnType>({
            procedureName: "signTypedDataV4",
            params: {
              domain: _typedData.domain as any,
              types:
                _typedData.types as SignerProcedureTypes["signTypedDataV4"]["types"],
              message:
                _typedData.message as SignerProcedureTypes["signTypedDataV4"]["message"],
              chainId,
              rpcEndpoint: `https://${chainId}.rpc.thirdweb.com`, // TODO (ew) shouldnt be needed
            },
          });
        return signedTypedData as Hex;
      },
    };
  }
}
