import { ChevronLeftIcon } from "@radix-ui/react-icons";
import { useContext, useState, useRef, useEffect, lazy, Suspense } from "react";
import {
  ModalConfigCtx,
  // SetModalConfigCtx,
} from "../../providers/wallet-ui-states-provider.js";
import { Img } from "../components/Img.js";
import { Spacer } from "../components/Spacer.js";
import { TextDivider } from "../components/TextDivider.js";
import {
  Container,
  ScreenBottomContainer,
  Line,
  ModalHeader,
  noScrollBar,
} from "../components/basic.js";
import { Button, IconButton } from "../components/buttons.js";
import { ModalTitle } from "../components/modalElements.js";
import { Link } from "../components/text.js";
import { StyledDiv, StyledUl } from "../design-system/elements.js";
import { fontSize, iconSize, radius, spacing } from "../design-system/index.js";
import { TOS } from "./Modal/TOS.js";
import { TWIcon } from "./icons/twIcon.js";
import { Text } from "../components/text.js";
import { PoweredByThirdweb } from "./PoweredByTW.js";
// import { localWalletMetadata } from "../../../../wallets/local/index._ts";
import { useWalletConnectionCtx } from "../../../core/hooks/others/useWalletConnectionCtx.js";
import type { Wallet } from "../../../../wallets/interfaces/wallet.js";
import { WalletImage } from "../components/WalletImage.js";
import { getMIPDStore } from "../../../../wallets/injected/mipdStore.js";
import { createWallet } from "../../../../wallets/create-wallet.js";
import type { InjectedSupportedWalletIds } from "../../../../wallets/__generated__/wallet-ids.js";
import type { WalletId } from "../../../../wallets/wallet-types.js";
import { LoadingScreen } from "../../wallets/shared/LoadingScreen.js";
import { WalletButton, WalletEntryButton } from "./WalletEntryButton.js";
import { sortWallets } from "../../utils/sortWallets.js";
import { useCustomTheme } from "../design-system/CustomThemeProvider.js";

const InAppWalletSelectionUI = /* @__PURE__ */ lazy(
  () => import("../../wallets/in-app/InAppWalletSelectionUI.js"),
);

// const localWalletId = "local";
const inAppWalletId: WalletId = "inApp";

/**
 * @internal
 */
export const WalletSelector: React.FC<{
  wallets: Wallet[];
  selectWallet: (wallet: Wallet) => void;
  onGetStarted: () => void;
  title: string;
  done: (wallet: Wallet) => void;
  goBack?: () => void;
  onShowAll: () => void;
}> = (props) => {
  const modalConfig = useContext(ModalConfigCtx);
  const isCompact = modalConfig.modalSize === "compact";
  const { termsOfServiceUrl, privacyPolicyUrl } = modalConfig;
  const [isWalletGroupExpanded, setIsWalletGroupExpanded] = useState(false);

  const installedWallets = getInstalledWallets();
  const propsWallets = props.wallets;
  const _wallets: Wallet[] = [...propsWallets];

  installedWallets.forEach((iW) => {
    if (!propsWallets.find((w) => w.id === iW.id)) {
      _wallets.push(iW);
    }
  });

  // const disconnect = useDisconnect();
  // const connectionStatus = useActiveWalletConnectionStatus();
  const locale = useWalletConnectionCtx().connectLocale;
  const recommendedWallets = useWalletConnectionCtx().recommendedWallets;

  const localWalletConfig = false; // _wallets.find((w) => w.id === localWalletId);

  const nonLocalWalletConfigs = _wallets; // _wallets.filter((w) => w.id !== localWalletId);

  const socialWallets = nonLocalWalletConfigs.filter(
    (w) => w.id === inAppWalletId,
  );

  const eoaWallets = sortWallets(
    nonLocalWalletConfigs.filter((w) => w.id !== inAppWalletId),
    recommendedWallets,
  );

  const continueAsGuest = localWalletConfig && (
    <Button
      fullWidth
      variant={isCompact ? "outline" : "link"}
      style={
        !isCompact
          ? {
              textAlign: "left",
              justifyContent: "flex-start",
            }
          : undefined
      }
      onClick={() => {
        props.selectWallet(localWalletConfig);
      }}
      data-test="continue-as-guest-button"
    >
      {locale.continueAsGuest}
    </Button>
  );

  // prevent accidental clicks on the TW icon when clicking on back icon from previous screen
  const enableTWIconLink = useRef(false);
  useEffect(() => {
    setTimeout(() => {
      enableTWIconLink.current = true;
    }, 1000);
  }, []);

  const twTitle = (
    <Container gap="xxs" center="y" flex="row">
      {modalConfig.titleIconUrl === undefined ? (
        <Link
          color="primaryText"
          hoverColor="accentText"
          target="_blank"
          href="https://thirdweb.com/connect?utm_source=cw"
          style={{
            display: "flex",
            alignItems: "center",
          }}
          onClick={(e) => {
            if (!enableTWIconLink.current) {
              e.preventDefault();
            }
          }}
        >
          <TWIcon size={iconSize.md} />
        </Link>
      ) : modalConfig.titleIconUrl === "" ? null : (
        <Img
          src={modalConfig.titleIconUrl}
          width={iconSize.md}
          height={iconSize.md}
        />
      )}

      <ModalTitle> {props.title} </ModalTitle>
    </Container>
  );

  const handleSelect = async (wallet: Wallet) => {
    // if (connectionStatus !== "disconnected") {
    //   await disconnect();
    // }
    props.selectWallet(wallet);
  };

  const connectAWallet = (
    <Button
      fullWidth
      variant="outline"
      style={{
        display: "flex",
        justifyContent: "center",
        gap: spacing.sm,
        padding: spacing.md,
      }}
      onClick={() => {
        setIsWalletGroupExpanded(true);
      }}
    >
      <Container flex="row" gap="xxs">
        {eoaWallets.slice(0, 2).map((w) => (
          <WalletImage key={w.id} id={w.id} size={iconSize.sm} />
        ))}
      </Container>
      {locale.connectAWallet}
    </Button>
  );

  const newToWallets = (
    <Container
      flex="row"
      style={{
        justifyContent: "space-between",
      }}
    >
      <Text color="secondaryText" size="sm" weight={500}>
        {locale.newToWallets}
      </Text>
      <Link
        weight={500}
        size="sm"
        target="_blank"
        href="https://blog.thirdweb.com/web3-wallet/"
      >
        {locale.getStarted}
      </Link>
    </Container>
  );

  const tos =
    termsOfServiceUrl || privacyPolicyUrl ? (
      <TOS
        termsOfServiceUrl={termsOfServiceUrl}
        privacyPolicyUrl={privacyPolicyUrl}
      />
    ) : undefined;

  let topSection: React.ReactNode;
  let bottomSection: React.ReactNode;

  // wide modal
  if (!isCompact) {
    topSection = (
      <WalletSelection
        wallets={nonLocalWalletConfigs}
        selectWallet={handleSelect}
        done={props.done}
        goBack={props.goBack}
        onShowAll={props.onShowAll}
      />
    );

    if (continueAsGuest) {
      bottomSection = (
        <ScreenBottomContainer>{continueAsGuest}</ScreenBottomContainer>
      );
    }
  }

  // compact
  else {
    // no social logins
    if (socialWallets.length === 0) {
      topSection = (
        <WalletSelection
          wallets={nonLocalWalletConfigs}
          selectWallet={handleSelect}
          done={props.done}
          goBack={props.goBack}
          onShowAll={props.onShowAll}
        />
      );

      bottomSection = (
        <>
          <Line />
          <Container flex="column" p="lg" gap="lg">
            {newToWallets}
            {continueAsGuest}
          </Container>
          {!continueAsGuest && <Line />}
          {tos && (
            <Container
              px="md"
              style={{
                paddingBottom: spacing.md,
                paddingTop: continueAsGuest ? 0 : spacing.md,
              }}
            >
              {tos}
            </Container>
          )}
        </>
      );
    }

    // social logins
    else {
      // not expanded state
      if (!isWalletGroupExpanded) {
        topSection = (
          <Container px="xs">
            <WalletSelection
              wallets={socialWallets}
              selectWallet={handleSelect}
              done={props.done}
              goBack={props.goBack}
            />
            {eoaWallets.length > 0 && (
              <>
                <TextDivider text={locale.or} />
                <Spacer y="lg" />
              </>
            )}
          </Container>
        );

        // only social login - no eoa wallets
        if (eoaWallets.length === 0) {
          bottomSection =
            tos || continueAsGuest ? (
              <>
                <Spacer y="md" />
                <Line />
                {continueAsGuest && (
                  <Container p="lg"> {continueAsGuest}</Container>
                )}
                {tos && <Container p="md"> {tos} </Container>}
              </>
            ) : (
              <Spacer y="sm" />
            );
        }

        // social login + eoa wallets
        else {
          // social login + More than 1 eoa wallets
          if (eoaWallets.length > 1) {
            bottomSection = (
              <Container flex="column" gap="sm">
                <Container px="lg" flex="column" gap="md">
                  {connectAWallet}
                  {continueAsGuest}
                </Container>

                {tos ? (
                  <Container p="md"> {tos} </Container>
                ) : (
                  <Spacer y="md" />
                )}
              </Container>
            );
          }

          // social login + single eoa wallet
          else {
            bottomSection = (
              <>
                <Container px="lg">
                  <WalletSelection
                    wallets={eoaWallets}
                    selectWallet={handleSelect}
                    done={props.done}
                    goBack={props.goBack}
                    onShowAll={props.onShowAll}
                  />
                </Container>

                {continueAsGuest && (
                  <Container flex="column" px="lg" gap="lg">
                    {continueAsGuest}
                  </Container>
                )}

                {tos ? (
                  <>
                    {continueAsGuest ? <Spacer y="md" /> : <Line />}
                    <Container p="md"> {tos} </Container>
                  </>
                ) : (
                  <>{continueAsGuest && <Spacer y="xl" />}</>
                )}
              </>
            );
          }
        }
      }

      // expanded state
      else {
        topSection = (
          <WalletSelection
            wallets={eoaWallets}
            selectWallet={handleSelect}
            done={props.done}
            goBack={props.goBack}
            onShowAll={props.onShowAll}
          />
        );

        bottomSection = (
          <ScreenBottomContainer>{newToWallets}</ScreenBottomContainer>
        );
      }
    }
  }

  return (
    <Container
      scrollY
      flex="column"
      animate="fadein"
      fullHeight
      style={{
        maxHeight: modalConfig.modalSize === "compact" ? "550px" : undefined,
      }}
    >
      {/* Header */}
      {!modalConfig.isEmbed && (
        <Container
          p="lg"
          style={{
            paddingBottom: spacing.md,
          }}
        >
          {isWalletGroupExpanded ? (
            <ModalHeader
              title={twTitle}
              onBack={() => {
                setIsWalletGroupExpanded(false);
              }}
            />
          ) : (
            twTitle
          )}
        </Container>
      )}

      {/* Body */}
      <Container
        expand
        scrollY
        px="md"
        style={
          modalConfig.isEmbed
            ? {
                paddingTop: spacing.lg,
              }
            : {
                paddingTop: "2px",
              }
        }
      >
        {modalConfig.isEmbed && isWalletGroupExpanded && (
          <Container
            flex="row"
            center="y"
            style={{
              padding: spacing.sm,
              paddingTop: 0,
            }}
          >
            <IconButton
              onClick={() => {
                setIsWalletGroupExpanded(false);
              }}
              style={{
                gap: spacing.xxs,
                transform: `translateX(-${spacing.xs})`,
                paddingBlock: spacing.xxs,
                paddingRight: spacing.xs,
              }}
            >
              <ChevronLeftIcon width={iconSize.sm} height={iconSize.sm} />
              {locale.goBackButton}
            </IconButton>
          </Container>
        )}

        {topSection}
      </Container>

      {bottomSection}
      {isCompact && modalConfig.showThirdwebBranding !== false && (
        <Container py="md">
          <PoweredByThirdweb />
        </Container>
      )}
    </Container>
  );
};

let _installedWallets: Wallet[] = [];

function getInstalledWallets() {
  if (_installedWallets.length === 0) {
    const providers = getMIPDStore().getProviders();
    const walletIds = providers.map((provider) => provider.info.rdns);
    _installedWallets = walletIds.map((w) =>
      createWallet(w as InjectedSupportedWalletIds),
    );
  }

  return _installedWallets;
}

/**
 * @internal
 */
const WalletSelection: React.FC<{
  wallets: Wallet[];
  selectWallet: (wallet: Wallet) => void;
  maxHeight?: string;
  done: (wallet: Wallet) => void;
  goBack?: () => void;
  onShowAll?: () => void;
}> = (props) => {
  const { recommendedWallets, showAllWallets } = useWalletConnectionCtx();
  const { modalSize } = useContext(ModalConfigCtx);
  const wallets = sortWallets(props.wallets, recommendedWallets);

  // const modalConfig = useContext(ModalConfigCtx);
  // const setModalConfig = useContext(SetModalConfigCtx);

  // const saveData = useCallback(
  //   (data: any) => {
  //     setModalConfig({
  //       ...modalConfig,
  //       data,
  //     });
  //   },
  //   [modalConfig, setModalConfig],
  // );

  return (
    <WalletList
      style={{
        minHeight: "100%",
      }}
    >
      {wallets.map((wallet) => {
        return (
          <li
            key={wallet.id}
            // data-full-width={!!walletConfig.selectUI}
          >
            {wallet.id === "inApp" && modalSize === "compact" ? (
              <Suspense fallback={<LoadingScreen height="195px" />}>
                <InAppWalletSelectionUI
                  done={() => props.done(wallet)}
                  select={() => props.selectWallet(wallet)}
                  wallet={wallet as Wallet<"inApp">}
                  goBack={props.goBack}
                />
              </Suspense>
            ) : (
              <WalletEntryButton
                walletId={wallet.id}
                selectWallet={() => {
                  props.selectWallet(wallet);
                }}
              />
            )}
          </li>
        );
      })}

      {props.onShowAll && showAllWallets !== false && (
        <ButtonContainer>
          <WalletButton onClick={props.onShowAll}>
            <ShowAllWalletsIcon>
              <div data-dot></div>
              <div data-dot></div>
              <div data-dot></div>
              <div data-dot></div>
            </ShowAllWalletsIcon>
            <Container flex="row" gap="xs">
              <Text color="primaryText">All Wallets</Text>
              <BadgeText> 350+ </BadgeText>
            </Container>
          </WalletButton>
        </ButtonContainer>
      )}
    </WalletList>
  );
};

const BadgeText = /* @__PURE__ */ StyledDiv(() => {
  const theme = useCustomTheme();
  return {
    backgroundColor: theme.colors.secondaryButtonBg,
    paddingBlock: "3px",
    paddingInline: spacing.xxs,
    fontSize: fontSize.xs,
    borderRadius: radius.sm,
    color: theme.colors.secondaryText,
  };
});

const ButtonContainer = /* @__PURE__ */ StyledDiv(() => {
  const theme = useCustomTheme();
  return {
    "&:hover [data-dot]": {
      background: theme.colors.primaryText,
    },
  };
});

const ShowAllWalletsIcon = /* @__PURE__ */ StyledDiv(() => {
  const theme = useCustomTheme();
  return {
    width: iconSize.xl + "px",
    height: iconSize.xl + "px",
    backgroundColor: theme.colors.walletSelectorButtonHoverBg,
    border: `2px solid ${theme.colors.borderColor}`,
    borderRadius: radius.md,
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    justifyItems: "center",
    alignItems: "center",
    padding: spacing.xs,
    "& div": {
      transition: "background 200ms ease",
      background: theme.colors.secondaryText,
      borderRadius: "50%",
      width: "10px",
      height: "10px",
    },
  };
});

const WalletList = /* @__PURE__ */ StyledUl({
  all: "unset",
  listStyleType: "none",
  display: "flex",
  flexDirection: "column",
  gap: "2px",
  boxSizing: "border-box",
  overflowY: "auto",
  flex: 1,
  ...noScrollBar,
  // to show the box-shadow of inputs that overflows
  padding: "2px",
  margin: "-2px",
  marginBottom: 0,
  paddingBottom: spacing.lg,
});
