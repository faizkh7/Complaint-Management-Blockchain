// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract ComplaintSystem {
    mapping(address => bool) public isAdmin;
    mapping(address => bool) public isUser;

    enum ComplaintStatus { Pending, Resolved }
    enum Action { Access, Resolve, Reply }

    struct Transaction {
        address accessor;
        Action actionType; // Include action type
        uint256 timestamp;
    }

    struct File {
        string ipfsHash;
        string name;
    }

    struct Complaint {
        uint256 id;
        address complainant;
        string description;
        ComplaintStatus status;
        File file;
        uint256 timestamp;
    }

    struct Reply {
        address senderAddress;
        string replyText;
        uint256 timestamp;
    }

    mapping(uint256 => Complaint) public complaints;
    mapping(uint256 => Transaction[]) public transactions;
    mapping(uint256 => Reply[]) public replies;
    uint256 public complaintCount;

    modifier onlyAdmin() {
        require(isAdmin[msg.sender], "Only admin can call this function");
        _;
    }

    modifier onlyUser() {
        require(isUser[msg.sender], "Only user can call this function");
        _;
    }

    event ComplaintCreated(uint256 indexed id, address indexed complainant, string ipfsHash, string description);
    event ComplaintResolved(uint256 indexed id, string response);
    event TransactionAdded(uint256 indexed complaintId, address indexed accessor, Action action, uint256 timestamp);
    event AdminRegistered(address indexed admin);
    event UserRegistered(address indexed user);

    function registerUser() external {
        isUser[msg.sender] = true;
        emit UserRegistered(msg.sender);
    }

    function registerAdmin() external {
        isAdmin[msg.sender] = true;
        emit AdminRegistered(msg.sender);
    }

    function createComplaint(string memory _ipfsHash, string memory _description, string memory fileName) external onlyUser {
        require(bytes(_ipfsHash).length > 0, "No file provided");
        uint256 complaintId = complaintCount++;
        complaints[complaintId] = Complaint(complaintId, msg.sender, _description, ComplaintStatus.Pending, File(_ipfsHash, fileName), block.timestamp);
        emit ComplaintCreated(complaintId, msg.sender, _ipfsHash, _description);
    }

    function resolveComplaint(uint256 _complaintId, string memory _response) external onlyAdmin {
        require(complaints[_complaintId].status == ComplaintStatus.Pending, "Complaint is already resolved");
        complaints[_complaintId].status = ComplaintStatus.Resolved;
        emit ComplaintResolved(_complaintId, _response);
        _addTransaction(_complaintId, msg.sender, Action.Resolve);
    }

    function accessComplaint(uint256 _complaintId) external {
        _addTransaction(_complaintId, msg.sender, Action.Access);
    }

    function replyToComplaint(uint256 _complaintId, string memory _replyText) external {
        replies[_complaintId].push(Reply(msg.sender, _replyText, block.timestamp));
        emit TransactionAdded(_complaintId, msg.sender, Action.Reply, block.timestamp);
    }

    function _addTransaction(uint256 _complaintId, address _accessor, Action _actionType) internal {
        transactions[_complaintId].push(Transaction(_accessor, _actionType, block.timestamp));
        emit TransactionAdded(_complaintId, _accessor, _actionType, block.timestamp); // Emit action type
    }

    function getUserComplaints(address _user) external view returns (Complaint[] memory) {
        uint256 userComplaintsCount = 0;
        for (uint256 i = 0; i < complaintCount; i++) {
            if (complaints[i].complainant == _user) {
                userComplaintsCount++;
            }
        }
        Complaint[] memory userComplaints = new Complaint[](userComplaintsCount);
        uint256 index = 0;
        for (uint256 i = 0; i < complaintCount; i++) {
            if (complaints[i].complainant == _user) {
                userComplaints[index++] = complaints[i];
            }
        }
        return userComplaints;
    }

    function getUserReplies(address _user) external view returns (Reply[] memory) {
        Reply[] memory userReplies = new Reply[](complaintCount);
        uint256 userRepliesCount = 0;
        for (uint256 i = 0; i < complaintCount; i++) {
            if (complaints[i].complainant == _user) {
                for (uint256 j = 0; j < replies[i].length; j++) {
                    userReplies[userRepliesCount++] = replies[i][j];
                }
            }
        }
        // Resize the array to remove unused slots
        assembly {
            mstore(userReplies, userRepliesCount)
        }
        return userReplies;
    }

    function getUnresolvedComplaints() external view returns (Complaint[] memory) {
        uint256 unresolvedCount = 0;
        for (uint256 i = 0; i < complaintCount; i++) {
            if (complaints[i].status == ComplaintStatus.Pending) {
                unresolvedCount++;
            }
        }
        Complaint[] memory unresolvedComplaints = new Complaint[](unresolvedCount);
        uint256 currentIndex = 0;
        for (uint256 i = 0; i < complaintCount; i++) {
            if (complaints[i].status == ComplaintStatus.Pending) {
                unresolvedComplaints[currentIndex++] = complaints[i];
            }
        }
        return unresolvedComplaints;
    }

    function getTransactionsById(uint256 _complaintId) external view returns (Transaction[] memory) {
        return transactions[_complaintId];
    }

    function getRepliesById(uint256 _complaintId) external view returns (Reply[] memory) {
        return replies[_complaintId];
    }

    function getComplaintById(uint256 _complaintId) external view returns (Complaint memory) {
        return complaints[_complaintId];
    }
}
