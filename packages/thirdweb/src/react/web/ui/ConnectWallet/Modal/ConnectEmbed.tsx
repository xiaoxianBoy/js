import {
  SetModalConfigCtx,
  WalletUIStatesProvider,
} from "../../../providers/wallet-ui-states-provider.js";
import {
  modalMaxWidthCompact,
  defaultTheme,
  modalMaxWidthWide,
  wideModalMaxHeight,
} from "../constants.js";
import { useSetupScreen } from "./screen.js";
import { type ComponentProps, useContext, useEffect, useState } from "react";
import { radius, type Theme } from "../../design-system/index.js";
import { StyledDiv } from "../../design-system/elements.js";
import {
  useCustomTheme,
  CustomThemeProvider,
} from "../../design-system/CustomThemeProvider.js";
import { DynamicHeight } from "../../components/DynamicHeight.js";
import {
  useActiveAccount,
  useIsAutoConnecting,
} from "../../../../core/hooks/wallets/wallet-hooks.js";
import { ConnectModalContent } from "./ConnectModalContent.js";
import { canFitWideModal } from "../../../utils/canFitWideModal.js";
import type { Wallet } from "../../../../../wallets/interfaces/wallet.js";
import type { Chain } from "../../../../../chains/types.js";
import { useWalletConnectionCtx } from "../../../../core/hooks/others/useWalletConnectionCtx.js";
import type { ThirdwebClient } from "../../../../../client/client.js";
import type { LocaleId } from "../../types.js";
import { WalletConnectionContext } from "../../../../core/providers/wallet-connection.js";
import { getDefaultWallets } from "../../../wallets/defaultWallets.js";
import type { ConnectLocale } from "../locale/types.js";
import { LoadingScreen } from "../../../wallets/shared/LoadingScreen.js";
import type { AppMetadata } from "../../../../../wallets/types.js";
import { getConnectLocale } from "../locale/getConnectLocale.js";
import { AutoConnect } from "../../../../core/hooks/connection/useAutoConnect.js";
import type { SmartWalletOptions } from "../../../../../wallets/smart/types.js";

export type ConnectEmbedProps = {
  /**
   * A client is the entry point to the thirdweb SDK.
   * It is required for all other actions.
   * You can create a client using the `createThirdwebClient` function. Refer to the [Creating a Client](https://portal.thirdweb.com/typescript/v5/client) documentation for more information.
   *
   * You must provide a `clientId` or `secretKey` in order to initialize a client. Pass `clientId` if you want for client-side usage and `secretKey` for server-side usage.
   *
   * ```tsx
   * import { createThirdwebClient } from "thirdweb";
   *
   * const client = createThirdwebClient({
   *  clientId: "<your_client_id>",
   * })
   * ```
   */
  client: ThirdwebClient;

  /**
   * Metadata of the app that will be passed to connected wallet. Setting this is highly recommended.
   *
   * Some wallets display this information to the user when they connect to your app.
   * @example
   * ```ts
   * {
   *   name: "My App",
   *   url: "https://my-app.com",
   *   description: "some description about your app",
   *   logoUrl: "https://path/to/my-app/logo.svg",
   * };
   * ```
   */
  appMetadata?: AppMetadata;

  /**
   * By default - ConnectEmbed UI uses the `en-US` locale for english language users.
   *
   * You can customize the language used in the ConnectEmbed UI by setting the `locale` prop.
   *
   * Refer to the [`LocaleId`](https://portal.thirdweb.com/references/typescript/v5/LocaleId) type for supported locales.
   */
  locale?: LocaleId;

  /**
   * Array of supported wallets. If not provided, default wallets will be used.
   * @example
   * ```tsx
   * import { AutoConnect } from "thirdweb/react";
   * import { createWallet, inAppWallet } from "thirdweb/wallets";
   *
   * const wallets = [
   *   inAppWallet(),
   *   createWallet("io.metamask"),
   *   createWallet("com.coinbase.wallet"),
   *   createWallet("me.rainbow"),
   * ];
   *
   * function Example() {
   *  return (
   *    <ConnectEmbed
   *      client={client}
   *      wallets={wallets}
   *    />
   *  )
   * }
   * ```
   *
   * If no wallets are specified. The component will show All the EIP-6963 compliant installed wallet extensions, as well as below default wallets:
   *
   * ```tsx
   * const defaultWallets = [
   *  inAppWallet(),
   *  createWallet("io.metamask"),
   *  createWallet("com.coinbase.wallet"),
   *  createWallet("me.rainbow"),
   *  createWallet("io.zerion.wallet"),
   * ]
   * ```
   *
   * The `ConnectEmbed` also shows a "All wallets" button at the end of wallet list which allows user to connect to any of the 350+ wallets
   */
  wallets?: Wallet[];

  /**
   * When the user has connected their wallet to your site, this configuration determines whether or not you want to automatically connect to the last connected wallet when user visits your site again in the future.
   *
   * By default it is set to `{ timeout: 15000 }` meaning that autoConnect is enabled and if the autoConnection does not succeed within 15 seconds, it will be cancelled.
   *
   * If you want to disable autoConnect, set this prop to `false`.
   *
   * If you want to customize the timeout, you can assign an object with a `timeout` key to this prop.
   * ```tsx
   * <ConnectEmbed client={client} autoConnect={{ timeout: 10000 }} />
   * ```
   */
  autoConnect?:
    | {
        timeout: number;
      }
    | boolean;

  /**
   * The [`Chain`](https://portal.thirdweb.com/references/typescript/v5/Chain) object of the blockchain you want the wallet to connect to
   *
   * If a `chain` is not specified, Wallet will be connected to whatever is the default set in the wallet.
   *
   * If a `chain` is specified, Wallet will be prompted to switch to given chain after connection if it is not already connected to it.
   * This ensures that the wallet is connected to the correct blockchain before interacting with your app.
   *
   * You can create a `Chain` object using the [`defineChain`](https://portal.thirdweb.com/references/typescript/v5/defineChain) function.
   * At minimum, you need to pass the `id` of the blockchain to `defineChain` function to create a `Chain` object.
   * @example
   * ```tsx
   * import { polygon } from "thirdweb/chains";
   *
   * function Example() {
   *  return <div> <ConnectEmbed chain={polygon} /> </div>
   * }
   * ```
   */
  chain?: Chain;

  /**
   * Array of chains that your app supports.
   *
   * This is only relevant if your app is a multi-chain app and works across multiple blockchains.
   * If your app only works on a single blockchain, you should only specify the `chain` prop.
   *
   * Given list of chains will used in various ways:
   * - They will be displayed in the network selector in the `ConnectEmbed`'s details modal post connection
   * - They will be sent to wallet at the time of connection if the wallet supports requesting multiple chains ( example: WalletConnect ) so that users can switch between the chains post connection easily
   *
   * ```tsx
   * <ConnectEmbed chains={[ethereum, polygon, optimism]} />
   * ```
   *
   * You can create a `Chain` object using the [`defineChain`](https://portal.thirdweb.com/references/typescript/v5/defineChain) function.
   * At minimum, you need to pass the `id` of the blockchain to `defineChain` function to create a `Chain` object.
   *
   * ```tsx
   * import { defineChain } from "thirdweb/react";
   *
   * const polygon = defineChain({
   *   id: 137,
   * });
   * ```
   */
  chains?: Chain[];

  /**
   * Class name to be added to the root element of ConnectEmbed
   */
  className?: string;

  /**
   * Set the theme for the `ConnectEmbed` component. By default it is set to `"dark"`
   *
   * theme can be set to either `"dark"`, `"light"` or a custom theme object.
   * You can also import [`lightTheme`](https://portal.thirdweb.com/references/typescript/v5/lightTheme)
   * or [`darkTheme`](https://portal.thirdweb.com/references/typescript/v5/darkTheme)
   * functions from `thirdweb/react` to use the default themes as base and overrides parts of it.
   * @example
   * ```ts
   * import { lightTheme } from "thirdweb/react";
   *
   * const customTheme = lightTheme({
   *  colors: {
   *    modalBg: 'red'
   *  }
   * })
   *
   * function Example() {
   *  return <ConnectEmbed theme={customTheme} />
   * }
   * ```
   */
  theme?: "dark" | "light" | Theme;

  /**
   * CSS styles to be applied to the root element of ConnectEmbed
   */
  style?: React.CSSProperties;

  /**
   * If provided, Embed will show a Terms of Service message at the bottom with below link
   */
  termsOfServiceUrl?: string;

  /**
   * If provided, Embed will show a Privacy Policy message at the bottom with below link
   */
  privacyPolicyUrl?: string;

  /**
   * Callback to be called on successful connection of wallet. The callback is called with the connected account
   *
   * ```tsx
   * <ConnectEmbed
   *  onConnect={(account) => {
   *    console.log("connected to", account)
   *  }}
   * />
   * ```
   *
   * Note that this does not include the sign in, If you want to call a callback after user connects AND signs in with their wallet, use `auth.onLogin` prop instead
   *
   * ```tsx
   * <ConnectEmbed
   *  auth={{
   *   onLogin: () => {
   *     console.log("wallet connected and signed in")
   *   }
   *  }}
   * />
   * ```
   */
  onConnect?: (wallet: Wallet) => void;

  /**
   * By default, A "Powered by Thirdweb" branding is shown at the bottom of the embed.
   *
   * If you want to hide it, set this to `false`
   * @example
   * ```tsx
   * <ConnectEmbed showThirdwebBranding={false} />
   * ```
   */
  showThirdwebBranding?: boolean;

  /**
   * Configure options for WalletConnect
   *
   * By default WalletConnect uses the thirdweb's default project id.
   * Setting your own project id is recommended.
   *
   * You can create a project id by signing up on [walletconnect.com](https://walletconnect.com/)
   */
  walletConnect?: {
    projectId?: string;
  };

  /**
   * Enable Account abstraction for all wallets. This will connect to the users's smart account based on the connected personal wallet and the given options.
   *
   * This allows to sponsor gas fees for your user's transaction using the thirdweb account abstraction infrastructure.
   *
   * ```tsx
   * <ConnectEmbed
   *   accountAbstraction={{
   *    factoryAddress: "0x123...",
   *    chain: sepolia,
   *    gasless: true;
   *   }}
   * />
   */
  accountAbstraction?: SmartWalletOptions;

  /**
   * Wallets to show as recommended in the `ConnectEmbed` UI
   */
  recommendedWallets?: Wallet[];

  /**
   * By default, `ConnectEmbed` shows a "All Wallets" button that shows a list of 350+ wallets.
   *
   * You can disable this button by setting `showAllWallets` prop to `false`
   */
  showAllWallets?: boolean;

  /**
   * ConnectEmbed supports two modal size variants: `compact` and `wide`.
   *
   * By default it is set to `compact`, you can set it to `wide` if you want to show a wider modal.
   *
   * Note that if the screen width can not fit the wide modal, the `compact` version will be shown regardless of this `modalSize` options provided
   */
  modalSize?: "compact" | "wide";
};

/**
 * A component that allows the user to connect their wallet.
 *
 * it renders the same UI as the [`ConnectButton`](https://portal.thirdweb.com/react/v4/components/ConnectButton) component's modal - but directly on the page instead of being in a modal.
 *
 * It only renders UI if wallet is not connected
 * @example
 * ```tsx
 * <ConnectEmbed
 *    client={client}
 *    appMetadata={{
 *      name: "Example",
 *      url: "https://example.com",
 *    }}
 * />
 * ```
 * @param props -
 * The props for the `ConnectEmbed` component.
 *
 * Refer to the [`ConnectEmbedProps`](https://portal.thirdweb.com/references/typescript/v5/ConnectEmbedProps) type for more details
 * @component
 */
export function ConnectEmbed(props: ConnectEmbedProps) {
  const activeAccount = useActiveAccount();
  const show = !activeAccount;

  const wallets = props.wallets || getDefaultWallets();
  const localeId = props.locale || "en_US";
  const [locale, setLocale] = useState<ConnectLocale | undefined>();

  useEffect(() => {
    getConnectLocale(localeId).then(setLocale);
  }, [localeId]);

  const contextTheme = useCustomTheme();

  const modalSize = !canFitWideModal()
    ? "compact"
    : props.modalSize || ("compact" as const);

  const walletUIStatesProps = {
    theme: props.theme || contextTheme || defaultTheme,
    modalSize: modalSize,
    title: undefined,
    termsOfServiceUrl: props.termsOfServiceUrl,
    privacyPolicyUrl: props.privacyPolicyUrl,
    isEmbed: true,
    // auth: props.auth,
    onConnect: props.onConnect,
    showThirdwebBranding: props.showThirdwebBranding,
  };

  const autoConnectComp = props.autoConnect !== false && (
    <AutoConnect
      appMetadata={props.appMetadata}
      client={props.client}
      wallets={wallets}
      timeout={
        typeof props.autoConnect === "boolean"
          ? undefined
          : props.autoConnect?.timeout
      }
    />
  );

  if (show) {
    if (!locale) {
      return (
        <>
          {autoConnectComp}
          <EmbedContainer modalSize={modalSize}>
            <LoadingScreen />
          </EmbedContainer>
        </>
      );
    }

    return (
      <WalletConnectionContext.Provider
        value={{
          appMetadata: props.appMetadata,
          client: props.client,
          wallets: wallets,
          locale: localeId,
          connectLocale: locale,
          chain: props.chain,
          chains: props.chains,
          walletConnect: props.walletConnect,
          accountAbstraction: props.accountAbstraction,
          recommendedWallets: props.recommendedWallets,
          showAllWallets: props.showAllWallets,
        }}
      >
        <WalletUIStatesProvider {...walletUIStatesProps}>
          <CustomThemeProvider theme={walletUIStatesProps.theme}>
            <ConnectEmbedContent {...props} onConnect={props.onConnect} />
            <SyncedWalletUIStates {...walletUIStatesProps} />
            {autoConnectComp}
          </CustomThemeProvider>
        </WalletUIStatesProvider>
      </WalletConnectionContext.Provider>
    );
  }

  return <div>{autoConnectComp}</div>;
}

/**
 * @internal
 */
const ConnectEmbedContent = (
  props: ConnectEmbedProps & {
    loginOptional?: boolean;
  },
) => {
  // const requiresSignIn = false;
  const screenSetup = useSetupScreen();
  const { setScreen, initialScreen } = screenSetup;

  const isAutoConnecting = useIsAutoConnecting();

  let content = null;

  const modalSize = !canFitWideModal()
    ? "compact"
    : props.modalSize || ("compact" as const);

  // show spinner on page load and during auto connecting a wallet
  if (isAutoConnecting) {
    content = <LoadingScreen />;
  } else {
    content = (
      <ConnectModalContent
        screenSetup={screenSetup}
        isOpen={true}
        onClose={() => {
          setScreen(initialScreen);
        }}
        setModalVisibility={() => {
          // no op
        }}
      />
    );
  }

  return (
    <EmbedContainer
      modalSize={modalSize}
      className={props.className}
      style={props.style}
    >
      {modalSize === "wide" ? (
        content
      ) : (
        <DynamicHeight> {content} </DynamicHeight>
      )}
    </EmbedContainer>
  );
};

/**
 * @internal
 */
export function SyncedWalletUIStates(
  props: ComponentProps<typeof WalletUIStatesProvider>,
) {
  const setModalConfig = useContext(SetModalConfigCtx);
  const locale = useWalletConnectionCtx().connectLocale;

  // update modalConfig on props change
  useEffect(() => {
    setModalConfig((c) => ({
      ...c,
      title: props.title || locale.defaultModalTitle,
      theme: props.theme || "dark",
      modalSize: (!canFitWideModal() ? "compact" : props.modalSize) || "wide",
      termsOfServiceUrl: props.termsOfServiceUrl,
      privacyPolicyUrl: props.privacyPolicyUrl,
      welcomeScreen: props.welcomeScreen,
      titleIconUrl: props.titleIconUrl,
      showThirdwebBranding: props.showThirdwebBranding,
    }));
  }, [
    props.title,
    props.theme,
    props.modalSize,
    props.termsOfServiceUrl,
    props.privacyPolicyUrl,
    props.welcomeScreen,
    props.titleIconUrl,
    setModalConfig,
    locale.defaultModalTitle,
    props.showThirdwebBranding,
  ]);

  return <WalletUIStatesProvider {...props} />;
}

const EmbedContainer = /* @__PURE__ */ StyledDiv(
  (props: { modalSize: "compact" | "wide" }) => {
    const { modalSize } = props;
    const theme = useCustomTheme();
    return {
      color: theme.colors.primaryText,
      background: theme.colors.modalBg,
      height: modalSize === "compact" ? "auto" : wideModalMaxHeight,
      width: modalSize === "compact" ? modalMaxWidthCompact : modalMaxWidthWide,
      boxSizing: "border-box",
      position: "relative",
      lineHeight: "normal",
      borderRadius: radius.xl,
      border: `1px solid ${theme.colors.borderColor}`,
      overflow: "hidden",
      fontFamily: theme.fontFamily,
      "& *::selection": {
        backgroundColor: theme.colors.primaryText,
        color: theme.colors.modalBg,
      },
      "& *": {
        boxSizing: "border-box",
      },
    };
  },
);
