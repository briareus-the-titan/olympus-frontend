import { useEffect, useState } from "react";
import { t, Trans } from "@lingui/macro";
import { ClaimBondTableData, ClaimBondCardData } from "./ClaimRow";
import { isPendingTxn, txnButtonTextGeneralPending } from "src/slices/PendingTxnsSlice";
import { redeemAllBonds } from "src/slices/BondSlice";
import CardHeader from "../../components/CardHeader/CardHeader";
import AccordionSection from "./AccordionSection";
import { useWeb3Context } from "src/hooks/web3Context";
import useBonds from "src/hooks/Bonds";
import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Zoom,
  Typography,
  Tabs,
  Tab,
} from "@material-ui/core";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import "./choosebond.scss";
import { useDispatch, useSelector } from "react-redux";
import { ContactSupportOutlined } from "@material-ui/icons";
import { useAppSelector } from "src/hooks";
import { claimAllNotes, IUserNote } from "src/slices/BondSliceV2";

function ClaimBonds({ activeNotes }: { activeNotes: IUserNote[] }) {
  const dispatch = useDispatch();
  const { provider, address, networkId } = useWeb3Context();

  const [numberOfBonds, setNumberOfBonds] = useState(0);
  const isSmallScreen = useMediaQuery("(max-width: 733px)"); // change to breakpoint query

  const pendingTransactions = useAppSelector(state => {
    return state.pendingTransactions;
  });

  const onRedeemAll = () => {
    // console.log("redeeming all bonds");
    // dispatch(redeemAllBonds({ address, bonds, networkID: networkId, provider, autostake }));
    dispatch(claimAllNotes({ address, provider, networkID: networkId }));
    // console.log("redeem all complete");
  };

  useEffect(() => {
    let bondCount = Object.keys(activeNotes).length;
    setNumberOfBonds(bondCount);
  }, [activeNotes]);

  const currentBlock = useAppSelector(state => {
    return state.app.currentBlock!;
  });

  const fullyVestedBonds = activeNotes.filter(note => note.fullyMatured);
  const vestingBonds = activeNotes.filter(note => !note.fullyMatured);

  const totalClaimable = fullyVestedBonds.reduce((a, b) => {
    return a + b.payout;
  }, 0);

  const [view, setView] = useState(0);
  function a11yProps(index: number) {
    return {
      id: `simple-tab-${index}`,
      "aria-controls": `simple-tabpanel-${index}`,
    };
  }
  const changeView = (_event: React.ChangeEvent<{}>, newView: number) => {
    setView(newView);
  };
  return (
    <>
      {numberOfBonds >= 1 && (
        <Zoom in={true}>
          <Paper className="ohm-card claim-bonds-card">
            <CardHeader title="Your Bonds (1,1)" />
            <Box
              display="flex"
              flexDirection="column"
              alignItems="center"
              className={`global-claim-buttons ${isSmallScreen ? "small" : ""}`}
            >
              <Typography variant="h4" align="center" className="payout-options-header">
                Payout Options{" "}
              </Typography>
              <Tabs
                centered
                value={view}
                textColor="primary"
                indicatorColor="primary"
                onChange={changeView}
                aria-label="payout token tabs"
              >
                <Tab label={t`sOHM`} {...a11yProps(0)} className="payout-token-tabs" />

                <Tab label={t`gOHM`} {...a11yProps(1)} className="payout-token-tabs" />
              </Tabs>
            </Box>
            <Box>
              {!isSmallScreen && (
                <TableContainer>
                  <Table aria-label="Claimable bonds">
                    <TableBody>
                      {fullyVestedBonds.length > 0 && (
                        <AccordionSection bonds={fullyVestedBonds} title="Fully Vested Bonds" />
                      )}

                      <Box
                        display="flex"
                        flexDirection="column"
                        alignItems="center"
                        className={`global-claim-buttons ${isSmallScreen ? "small" : ""}`}
                      >
                        <Typography variant="h5" align="center" className="claimable-balance">
                          Claimable Balance
                        </Typography>
                        <Typography variant="h4" align="center" style={{ marginBottom: "10px" }}>
                          {totalClaimable} {view === 0 ? "sOHM" : "gOHM"}
                        </Typography>

                        <Button
                          variant="contained"
                          color="primary"
                          className="transaction-button"
                          fullWidth
                          disabled={
                            isPendingTxn(pendingTransactions, "claim_all_bonds") ||
                            !activeNotes
                              .map(note => note.fullyMatured)
                              .reduce((prev, current, idx, arr) => prev || current)
                          }
                          onClick={onRedeemAll}
                        >
                          {txnButtonTextGeneralPending(pendingTransactions, "claim_all_bonds", t`Claim all`)}
                        </Button>
                      </Box>

                      {vestingBonds.length > 0 && <AccordionSection bonds={vestingBonds} title="Vesting Bonds" />}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}

              {isSmallScreen && activeNotes.map((bond, i) => <ClaimBondCardData key={i} userNote={bond} />)}
            </Box>
          </Paper>
        </Zoom>
      )}
    </>
  );
}

export default ClaimBonds;