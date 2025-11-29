// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract DisputeResolution {
    enum DisputeStatus {
        Submitted,
        UnderReview,
        Resolved,
        Challenged
    }
    
    enum RefundDecision {
        Pending,
        FullRefund,
        PartialRefund,
        NoRefund,
        NotPossible
    }
    
    struct Dispute {
        uint256 id;
        address submitter;
        string txHash;
        string description;
        string contractAddress;
        string recipientAddress;
        string ipfsHash;
        string aiAnalysis;
        DisputeStatus status;
        RefundDecision jurorDecision;
        address juror;
        string jurorReasoning;
        uint256 submissionTime;
        uint256 reviewTime;
        bool isChallenged;
    }
    
    mapping(uint256 => Dispute) public disputes;
    mapping(address => uint256[]) public userDisputes;
    mapping(address => bool) public authorizedJurors;
    
    uint256 public disputeCounter;
    address public owner;
    
    event DisputeSubmitted(uint256 indexed disputeId, address indexed submitter, string txHash);
    event DisputeChallenged(uint256 indexed disputeId, address indexed submitter);
    event DisputeReviewed(uint256 indexed disputeId, address indexed juror, RefundDecision decision);
    event JurorAuthorized(address indexed juror);
    event JurorRemoved(address indexed juror);
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
    
    modifier onlyAuthorizedJuror() {
        require(authorizedJurors[msg.sender], "Only authorized jurors can call this function");
        _;
    }
    
    modifier onlyDisputeSubmitter(uint256 _disputeId) {
        require(disputes[_disputeId].submitter == msg.sender, "Only dispute submitter can call this function");
        _;
    }
    
    constructor() {
        owner = msg.sender;
        disputeCounter = 0;
    }
    
    function submitDispute(
        string calldata _txHash,
        string calldata _description,
        string calldata _contractAddress
    ) external returns (uint256) {
        disputeCounter++;
        
        disputes[disputeCounter].id = disputeCounter;
        disputes[disputeCounter].submitter = msg.sender;
        disputes[disputeCounter].txHash = _txHash;
        disputes[disputeCounter].description = _description;
        disputes[disputeCounter].contractAddress = _contractAddress;
        disputes[disputeCounter].status = DisputeStatus.Submitted;
        disputes[disputeCounter].jurorDecision = RefundDecision.Pending;
        disputes[disputeCounter].submissionTime = block.timestamp;
        disputes[disputeCounter].isChallenged = false;
        
        userDisputes[msg.sender].push(disputeCounter);
        emit DisputeSubmitted(disputeCounter, msg.sender, _txHash);
        
        return disputeCounter;
    }
    
    function setDisputeDetails(
        uint256 _disputeId,
        string calldata _recipientAddress,
        string calldata _ipfsHash,
        string calldata _aiAnalysis
    ) external {
        require(disputes[_disputeId].submitter == msg.sender, "Only submitter can set details");
        require(disputes[_disputeId].status == DisputeStatus.Submitted, "Can only set details for submitted disputes");
        
        disputes[_disputeId].recipientAddress = _recipientAddress;
        disputes[_disputeId].ipfsHash = _ipfsHash;
        disputes[_disputeId].aiAnalysis = _aiAnalysis;
    }
    
    function challengeDispute(uint256 _disputeId) external onlyDisputeSubmitter(_disputeId) {
        require(disputes[_disputeId].id != 0, "Dispute does not exist");
        require(!disputes[_disputeId].isChallenged, "Dispute already challenged");
        
        disputes[_disputeId].isChallenged = true;
        disputes[_disputeId].status = DisputeStatus.Challenged;
        
        emit DisputeChallenged(_disputeId, msg.sender);
    }
    
    function reviewDispute(
        uint256 _disputeId,
        RefundDecision _decision,
        string calldata _reasoning
    ) external onlyAuthorizedJuror {
        require(disputes[_disputeId].id != 0, "Dispute does not exist");
        require(disputes[_disputeId].isChallenged, "Dispute must be challenged first");
        require(disputes[_disputeId].status != DisputeStatus.Resolved, "Dispute already resolved");
        
        disputes[_disputeId].jurorDecision = _decision;
        disputes[_disputeId].juror = msg.sender;
        disputes[_disputeId].jurorReasoning = _reasoning;
        disputes[_disputeId].status = DisputeStatus.Resolved;
        disputes[_disputeId].reviewTime = block.timestamp;
        
        emit DisputeReviewed(_disputeId, msg.sender, _decision);
    }
    
    function getAllChallengedDisputes() external view returns (uint256[] memory) {
        uint256[] memory challengedIds = new uint256[](disputeCounter);
        uint256 count = 0;
        
        for (uint256 i = 1; i <= disputeCounter; i++) {
            if (disputes[i].isChallenged && disputes[i].status != DisputeStatus.Resolved) {
                challengedIds[count] = i;
                count++;
            }
        }
        
        // Resize array
        uint256[] memory result = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = challengedIds[i];
        }
        
        return result;
    }
    
    function getUserDisputes(address _user) external view returns (uint256[] memory) {
        return userDisputes[_user];
    }
    
    function getDispute(uint256 _disputeId) external view returns (Dispute memory) {
        require(disputes[_disputeId].id != 0, "Dispute does not exist");
        return disputes[_disputeId];
    }
    
    function authorizeJuror(address _juror) external onlyOwner {
        authorizedJurors[_juror] = true;
        emit JurorAuthorized(_juror);
    }
    
    function removeJuror(address _juror) external onlyOwner {
        authorizedJurors[_juror] = false;
        emit JurorRemoved(_juror);
    }
    
    function isAuthorizedJuror(address _juror) external view returns (bool) {
        return authorizedJurors[_juror];
    }
    
    function getTotalDisputes() external view returns (uint256) {
        return disputeCounter;
    }
}
