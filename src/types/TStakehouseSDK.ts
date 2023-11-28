export type TStakehouseSDK = {
  reportBalance: (...args: any) => any
  reportBalanceIncrease: (...args: any) => any
  registerValidatorInitials: (...args: any) => any
  registerValidator: (...args: any) => any
  createStakehouse: (...args: any) => any
  joinStakehouse: (...args: any) => any
  addKnotToOpenIndexAndWithdraw: (...args: any) => any
  batchAddKnotToOpenIndexAndWithdraw: (...args: any) => any
  batchTransferKnotsToSingleIndex: (...args: any) => any
  BLSAuthentication: (...args: any) => any
  rageQuitKnot: (...args: any) => any
  rageQuit: (...args: any) => any
  depositIntoSavETHRegistry: (...args: any) => any
  depositAndIsolateKnotIntoIndex: (...args: any) => any
  slash: (...args: any) => any
  slashAndTopUpSlot: (...args: any) => any
  createIndex: (...args: any) => any
  approveTransferOfIndexOwnership: (...args: any) => any
  transferIndexOwnership: (...args: any) => any
  transferKnotToAnotherIndex: (...args: any) => any
  approveSpendingOfKnotInIndex: (...args: any) => any
  joinStakeHouseAndCreateBrand: (...args: any) => any
  balanceReport: {
    getFinalisedEpochReport: (...args: any) => any
    authenticateReport: (...args: any) => any
    getTotalETHSentToBlsKey: (...args: any) => any
    getStartAndEndSlotByValidatorIndex: (...args: any) => any
    getDETHSweeps: (...args: any) => any
    calculateSumOfSweeps: (...args: any) => any
    getFinalSweep: (...args: any) => any
    generateFinalReport: (...args: any) => any
    formatSweepReport: (...args: any) => any
    verifyFinalReport: (...args: any) => any
    getFinalisedEpochReportForMultipleBLSKeys: (...args: any) => any
  }
  utils: {
    calculateExitFeeBeforeWithdrawalEpoch: (...args: any) => any
    pushSavETHIntoOpenIndex: (...args: any) => any
    lsdRageQuitChecks: (...args: any) => any
    checkKeystorePass: (...args: any) => any
    add0x: (...args: any) => any
    remove0x: (...args: any) => any
    getPersonalSignInitials: (...args: any) => any
    getPersonalSignInitialsByPrivateKey: (...args: any) => any
    generateCredentials: (...args: any) => any
    getValidatorLifecycleStatus: (...args: any) => any
    formDepositDataRoot: (...args: any) => any
    getLastDepositIndex: (...args: any) => any
    getDETHBalanceInIndex: (...args: any) => any
    getSLOTBalanceInVault: (...args: any) => any
    getsETHAddress: (...args: any) => any
    getsETHBalance: (...args: any) => any
    getGenericERC20WalletBalance: (...args: any) => any
    currentSlashedAmountOfSLOTForKnot: (...args: any) => any
    calculateExitFee: (...args: any) => any
    getNumberOfCollateralisedSlotOwnersForKnot: (...args: any) => any
    getStakehouseRedemptionRate: (...args: any) => any
    getStakehouseExchangeRate: (...args: any) => any
    getStakehouseSETHRedemptionThreshold: (...args: any) => any
    getTotalUserCollateralisedSETHBalanceInHouse: (...args: any) => any
    totalFundsInKNOTQueue: (...args: any) => any
    associatedIndexIdForKnot: (...args: any) => any
    rageQuitChecks: (...args: any) => any
    indexIdToOwner: (...args: any) => any
    isBalanceLower: (...args: any) => any
    dETHToSavETH: (...args: any) => any
    savETHToDETH: (...args: any) => any
    dETHRewardsMintedForKNOT: (...args: any) => any
    dETHRequiredForIsolation: (...args: any) => any
    savETHRequiredForIsolation: (...args: any) => any
    getKNOTNonce: (...args: any) => any
    getLastKnownReportForKNOT: (...args: any) => any
    updateSavETHIndexName: (...args: any) => any
    topUpSlashedSlot: (...args: any) => any
    topUpSlashedSlotWithOneEth: (...args: any) => any
    topUpKNOT: (...args: any) => any
    topUpKNOTWithOneEth: (...args: any) => any
    dETHMetadata: (...args: any) => any
    getStakehouse: (...args: any) => any
  }
  subgraph: {
    getAllIndexesOwnedByAUser: (...args: any) => any
    getPersonalIndex: (...args: any) => any
    knotToStakehouse: (...args: any) => any
    getAllEventsForAKnot: (...args: any) => any
  }
  cip: {
    generateAESCredentials: (...args: any) => any
    formAESKeystore: (...args: any) => any
    validateBLSKeystore: (...args: any) => any
    unlockAESPrivateKey: (...args: any) => any
    unlockBLSKeystore: (...args: any) => any
    formCIPCiphertext: (...args: any) => any
    isReEncryptionCompleted: (...args: any) => any
    reEncrypt: (...args: any) => any
    applyForDecryption: (...args: any) => any
    getRequestAvailabilityBlock: (...args: any) => any
    getParitalDecryptionPieces: (...args: any) => any
    getAllGuardians: (...args: any) => any
    getThreshold: (...args: any) => any
    getAESPublicKeyfromPrivateKey: (...args: any) => any
    aggregateSharedPrivateKeys: (...args: any) => any
    formBLSKeystore: (...args: any) => any
    getDecryptionState: (...args: any) => any
    decryptionEligibilityChecks: (...args: any) => any
  }
  wizard: {
    depositETHForProtectedStaking: (...args: any) => any
    isBLSPublicKeyPartOfLSDN: (...args: any) => any
    depositETHForFeesAndMEV: (...args: any) => any
    getListOfLSDNetworks: (...args: any) => any
    getLSDNForBLSPublicKey: (...args: any) => any
    depositETHByNodeRunner: (...args: any) => any
    availableToStake: (...args: any) => any
    isBLSPublicKeyBanned: (...args: any) => any
    fundNodeOperatorFromGiantSavETHPool: (...args: any) => any
    fundNodeOperatorFromGiantFeesAndMevPool: (...args: any) => any
    calculateFundsRequiredForStaking: (...args: any) => any
    stake: (...args: any) => any
    getAllBLSPublicKeysForANodeRunnerInAnLSDNetwork: (...args: any) => any
    getUserGiantFeesAndMevLPBalance: (...args: any) => any
    getGiantPoolDETHBalance: (...args: any) => any
    getMinimum: (...args: any) => any
    getUserGiantProtectedStakingLPBalance: (...args: any) => any
    previewNodeOperatorRewards: (...args: any) => any
    claimProtectedStakingRewards: (...args: any) => any
    claimFeesAndMevRewards: (...args: any) => any
    getValidatorsToBeRotated: (...args: any) => any
    rotateFundsBackToGiantProtectedStakingPool: (...args: any) => any
    rotateFundsBackToGiantFeesAndMevPool: (...args: any) => any
    isETHAvailableInProtectedStakingOfSomeLSDN: (...args: any) => any
    isETHAvailableInFeesAndMevOfSomeLSDN: (...args: any) => any
    getLpTokensDataForClaimRewards: (...args: any) => any
    previewFeesAndMevRewards: (...args: any) => any
    getLastInteractedTimestamp: (...args: any) => any
    isEligibleToInteractWithGiantLPToken: (...args: any) => any
    getCumulativeListOfValidators: (...args: any) => any
    getCumulativeActivity: (...args: any) => any
    getCumulativeHouseCreated: (...args: any) => any
    getCumulativeHouseJoined: (...args: any) => any
    getCumulativeValidatorsCreated: (...args: any) => any
    getCumulativeValidatorIndexes: (...args: any) => any
    getCumulativeValidatorIndexDetails: (...args: any) => any
    isLSD: (...args: any) => any
  }
  withdrawal: {
    reportAndWithdrawETH: (...args: any) => any
    reportSweepsForMultipleBLSPublicKeys: (...args: any) => any
    reportSweeps: (...args: any) => any
    isValidShanghaiReport: (...args: any) => any
    previewTotalMintableDETH: (...args: any) => any
    getSumOfUnreportedSweeps: (...args: any) => any
    totalReportedUnknownTopUpsForBlsPublicKey: (...args: any) => any
    claim: (...args: any) => any
    filterUnreportedSweepReports: (...args: any) => any
    reportFinalSweepAndWithdraw: (...args: any) => any
    isValidFinalSweep: (...args: any) => any
    voluntaryWithdrawal: (...args: any) => any
    broadcastVoluntaryWithdrawal: (...args: any) => any
    reportVoluntaryWithdrawal: (...args: any) => any
    verifyAndReportAllSweepsAtOnce: (...args: any) => any
    batchUnwrapDETH: (...args: any) => any
  }
  multipartyRageQuit: {
    deployRageQuitAssistant: (...args: any) => any
    executeFullWithdrawal: (...args: any) => any
    getRageQuitAssistantAddress: (...args: any) => any
    depositSETHInRageQuitAssistant: (...args: any) => any
    depositDETHInRageQuitAssistant: (...args: any) => any
    multipartyRageQuit: (...args: any) => any
    getDETHRequiredForIsolation: (...args: any) => any
    getClaimUnstakedETH: (...args: any) => any
    nodeOperatorClaimFromRageQuitAssistant: (...args: any) => any
    claimDETHFromRageQuitAssistant: (...args: any) => any
    claimSETHFromRageQuitAssistant: (...args: any) => any
    claimForCollateralisedSlotOwner: (...args: any) => any
    nodeOperatorClaimPreview: (...args: any) => any
  }
  constants: Promise<{
    stakehouseAddresses: any
    stakehouseUrls: any
    customErrors: any
    signatureEnum: any
  }>
  contractInstance: Promise<any>
}
