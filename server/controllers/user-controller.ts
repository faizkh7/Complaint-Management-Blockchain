import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import axios from "axios";
import multer from "multer";
const { web3 } = require('../ethereum/web3');
const receiptJson = require('../ethereum/receipt-ganache.json');

const prisma = new PrismaClient();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const contractObject = new web3.eth.Contract(
    receiptJson.jsonInterface,
    receiptJson.address
);

export const register = async (req: Request, res: Response) => {
    const { email, name, password, walletAddress, isAdmin } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        const user = await prisma.user.create({
            data: {
                email,
                name,
                password: hashedPassword,
                walletAddress,
                isAdmin,
            },
        });
        if (isAdmin) {
            const receipt = await contractObject.methods.registerAdmin(walletAddress).send({ from: walletAddress });
            console.log(receipt);
        } else {
            const receipt = await contractObject.methods.registerUser(walletAddress).send({ from: walletAddress });
            console.log(receipt);
        }
        res.json(user);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};

export const login = async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({
        where: {
            email,
        },
    });
    if (!user) {
        return res.status(400).json({ error: "Invalid email or password" });
    }
    const isValid = await bcrypt.compare(password, user.password || '');
    if (!isValid) {
        return res.status(400).json({ error: "Invalid email or password" });
    }
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET!);
    res.json({ token, user });
};

export const createComplaint = async (req: Request, res: Response) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
        return res.status(401).json({ error: "Token not provided" });
    }
    try {
        const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
        const { id } = decoded;
        const user = await prisma.user.findUnique({
            where: {
                id: id,
            },
        });
        if (!user) {
            return res.status(400).json({ error: "User not found" });
        }

        // Access the uploaded file from req.file
        const file = req.file;
        if (!file) {
            return res.status(400).json({ error: "No file uploaded" });
        }

        const { fileName, description } = req.body;

        // Create FormData object
        const formData = new FormData();
        const fileBlob = new Blob([file.buffer]);
        formData.append("file", fileBlob, fileName);
        const pinataMetadata = JSON.stringify({
            name: fileName,
        });
        formData.append("pinataMetadata", pinataMetadata);

        const pinataOptions = JSON.stringify({
            cidVersion: 1,
        });
        formData.append("pinataOptions", pinataOptions);

        // Make a POST request to upload the file
        const response = await axios.post(
            "https://api.pinata.cloud/pinning/pinFileToIPFS",
            formData,
            {
                headers: {
                    "Authorization": `Bearer ${process.env.PINATA_JWT}`,
                },
            }
        );
        const pinataIpfsHash = response.data.IpfsHash;

        // Use the smart contract function to create a complaint

        const receipt = await contractObject.methods.createComplaint(pinataIpfsHash, description, fileName).send({ from: user.walletAddress, gas: 3000000 });

        res.json({ message: "Complaint created successfully" });
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const getUserComplaints = async (req: Request, res: Response) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
        return res.status(401).json({ error: "Token not provided" });
    }
    try {
        const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
        const { id } = decoded;
        const user = await prisma.user.findUnique({
            where: {
                id: id,
            },
        });
        if (!user) {
            return res.status(400).json({ error: "User not found" });
        }

        const complaints = await contractObject.methods.getUserComplaints(user.walletAddress).call();
        const complaintsData = await Promise.all(complaints.map(async (complaint: any) => {
            const transactions = await contractObject.methods.getTransactionsById(complaint.id).call();
            const replies = await contractObject.methods.getRepliesById(complaint.id).call();

            const transactionsData = await Promise.all(transactions.map(async (transaction: any) => {
                return {
                    accessor: transaction.accessor,
                    timestamp: Number(transaction.timestamp),
                    action: transaction.action
                };
            }));

            const repliesData = await Promise.all(replies.map(async (reply: any) => {
                return {
                    senderAddress: reply.senderAddress,
                    timestamp: Number(reply.timestamp),
                    reply: reply.replyText
                };
            }));

            return {
                id: Number(complaint.id),
                complainant: complaint.complainant,
                description: complaint.description,
                status: Number(complaint.status),
                file: {
                    ipfsHash: complaint.file.ipfsHash,
                    name: complaint.file.name
                },
                timestamp: Number(complaint.timestamp),
                transactions: transactionsData,
                replies: repliesData
            };
        }));

        // Now you can send the response
        res.json(complaintsData);
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const getUnresolvedComplaints = async (req: Request, res: Response) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
        return res.status(401).json({ error: "Token not provided" });
    }
    try {
        const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
        const { id } = decoded;
        const user = await prisma.user.findUnique({
            where: {
                id: id,
            },
        });
        if (!user?.isAdmin) {
            return res.status(400).json({ error: "Cannot access the complaints" });
        }

        const complaints = await contractObject.methods.getUnresolvedComplaints().call({ from: user.walletAddress });
        const complaintsData = await Promise.all(complaints.map(async (complaint: any) => {
            const transactions = await contractObject.methods.getTransactionsById(complaint.id).call();
            const replies = await contractObject.methods.getRepliesById(complaint.id).call();

            const transactionsData = await Promise.all(transactions.map(async (transaction: any) => {
                return {
                    accessor: transaction.accessor,
                    timestamp: Number(transaction.timestamp),
                    action: transaction.action
                };
            }));

            const repliesData = await Promise.all(replies.map(async (reply: any) => {
                return {
                    senderAddress: reply.senderAddress,
                    timestamp: Number(reply.timestamp),
                    reply: reply.replyText
                };
            }));

            return {
                id: Number(complaint.id),
                complainant: complaint.complainant,
                description: complaint.description,
                status: Number(complaint.status),
                file: {
                    ipfsHash: complaint.file.ipfsHash,
                    name: complaint.file.name
                },
                timestamp: Number(complaint.timestamp),
                transactions: transactionsData,
                replies: repliesData
            };
        }));

        // Now you can send the response
        res.json(complaintsData);
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const resolveComplaint = async (req: Request, res: Response) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
        return res.status(401).json({ error: "Token not provided" });
    }
    try {
        const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
        const { id } = decoded;
        const user = await prisma.user.findUnique({
            where: {
                id: id,
            },
        });
        if (!user?.isAdmin) {
            return res.status(400).json({ error: "Cannot resolve the complaint" });
        }

        const { id: complaintId } = req.params;

        const receipt = await contractObject.methods.resolveComplaint(complaintId, "").send({ from: user.walletAddress, gas: 3000000 });

        res.json({ message: "Complaint resolved successfully" });
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const replyComplaint = async (req: Request, res: Response) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
        return res.status(401).json({ error: "Token not provided" });
    }
    try {
        const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
        const { id } = decoded;
        const user = await prisma.user.findUnique({
            where: {
                id: id,
            },
        });
        if (!user) {
            return res.status(400).json({ error: "User not found" });
        }

        const { id: complaintId } = req.params;
        const { replyText } = req.body;
        console.log(req.body);

        const receipt = await contractObject.methods.replyToComplaint(complaintId, replyText).send({ from: user.walletAddress, gas: 3000000 });

        res.json({ message: "Complaint replied successfully" });
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const accessComplaint = async (req: Request, res: Response) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
        return res.status(401).json({ error: "Token not provided" });
    }
    try {
        const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
        const { id } = decoded;
        const user = await prisma.user.findUnique({
            where: {
                id: id,
            },
        });

        if (!user) {
            return res.status(400).json({ error: "User not found" });
        }

        const { id: complaintId } = req.params;

        const receipt = await contractObject.methods.accessComplaint(complaintId).send({ from: user.walletAddress, gas: 3000000 });

        res.json({ message: "Complaint accessed successfully" });
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const complaintById = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const complaint = await contractObject.methods.getComplaintById(id).call();
        const transactions = await contractObject.methods.getTransactionsById(id).call();
        const replies = await contractObject.methods.getRepliesById(id).call();

        const transactionsData = await Promise.all(transactions.map(async (transaction: any) => {
            return {
                accessor: transaction.accessor,
                timestamp: Number(transaction.timestamp),
                action: transaction.action
            };
        }));

        const repliesData = await Promise.all(replies.map(async (reply: any) => {
            return {
                senderAddress: reply.senderAddress,
                timestamp: Number(reply.timestamp),
                reply: reply.replyText
            };
        }));

        const complaintData = {
            id: Number(complaint.id),
            complainant: complaint.complainant,
            description: complaint.description,
            status: Number(complaint.status),
            file: {
                ipfsHash: complaint.file.ipfsHash,
                name: complaint.file.name
            },
            timestamp: Number(complaint.timestamp),
            transactions: transactionsData,
            replies: repliesData
        };

        res.json(complaintData);
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
};




