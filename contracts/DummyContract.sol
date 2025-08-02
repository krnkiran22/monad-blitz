// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract MonadContract {
    enum RefundDecision {
        Pending,
        FullRefund,
        PartialRefund,
        NoRefund
    }
    
    struct Dispute {
        uint256 id;
        address submitter;
        string txHash;
        string description;
        RefundDecision decision;
        bool isChallenged;
        uint256 timestamp;
    }
    
    mapping(uint256 => Dispute) public disputes;
    mapping(address => bool) public authorizedJurors;
    
    uint256 public disputeCounter;
    address public owner;
    
    event DisputeSubmitted(uint256 indexed disputeId, address indexed submitter);
    event DisputeChallenged(uint256 indexed disputeId);
    event DisputeReviewed(uint256 indexed disputeId, RefundDecision decision);
    
    constructor() {
        owner = msg.sender;
        disputeCounter = 0;
    }
    
    function submitDispute(
        string calldata _txHash,
        string calldata _description
    ) external returns (uint256) {
        disputeCounter++;
        
        disputes[disputeCounter] = Dispute({
            id: disputeCounter,
            submitter: msg.sender,
            txHash: _txHash,
            description: _description,
            decision: RefundDecision.Pending,
            isChallenged: false,
            timestamp: block.timestamp
        });
        
        emit DisputeSubmitted(disputeCounter, msg.sender);
        return disputeCounter;
    }
    
    function challengeDispute(uint256 _disputeId) external {
        require(disputes[_disputeId].submitter == msg.sender, "Only submitter can challenge");
        require(!disputes[_disputeId].isChallenged, "Already challenged");
        
        disputes[_disputeId].isChallenged = true;
        emit DisputeChallenged(_disputeId);
    }
    
    function reviewDispute(uint256 _disputeId, RefundDecision _decision) external {
        require(authorizedJurors[msg.sender], "Only authorized jurors");
        require(disputes[_disputeId].isChallenged, "Must be challenged first");
        
        disputes[_disputeId].decision = _decision;
        emit DisputeReviewed(_disputeId, _decision);
    }
    
    function authorizeJuror(address _juror) external {
        require(msg.sender == owner, "Only owner");
        authorizedJurors[_juror] = true;
    }
    
    function getDispute(uint256 _disputeId) external view returns (Dispute memory) {
        return disputes[_disputeId];
    }
    
    function getTotalDisputes() external view returns (uint256) {
        return disputeCounter;
    }
}
