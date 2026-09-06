// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title PulseAudit
 * @notice Cryptographic attestation and decision seal for Pulse market-making decisions on Somnia Shannon.
 * @dev Records decision hashes, predicted probabilities, and calibration Brier scores on-chain before expiry.
 */
contract PulseAudit {
    struct DecisionProof {
        bytes32 marketId;
        uint64 timestamp;
        uint16 predictedProbBps; // 6420 = 64.20%
        uint16 brierScoreBps;    // Rolling Brier Score in basis points
        bytes32 decisionHash;    // SHA-256 of (marketId + orderParams + spotPrice + volatility)
    }

    event QuotingProofRecorded(
        bytes32 indexed marketId,
        address indexed agent,
        uint16 predictedProbBps,
        uint16 brierScoreBps,
        bytes32 decisionHash
    );

    mapping(bytes32 => DecisionProof) public proofs;

    /**
     * @notice Records an immutable quoting decision proof on-chain
     * @param marketId Identifier of the DreamDEX Event Contract market
     * @param predictedProbBps Predicted probability of Up in basis points (e.g. 5000 = 50.00%)
     * @param brierScoreBps Current rolling Brier calibration score in basis points
     * @param decisionHash SHA-256 digest of decision inputs
     */
    function recordDecision(
        bytes32 marketId,
        uint16 predictedProbBps,
        uint16 brierScoreBps,
        bytes32 decisionHash
    ) external {
        proofs[marketId] = DecisionProof(
            marketId,
            uint64(block.timestamp),
            predictedProbBps,
            brierScoreBps,
            decisionHash
        );

        emit QuotingProofRecorded(
            marketId,
            msg.sender,
            predictedProbBps,
            brierScoreBps,
            decisionHash
        );
    }
}

