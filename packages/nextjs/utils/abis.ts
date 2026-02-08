export const publicResolverAbi = [
    {
        name: "setText",
        type: "function",
        inputs: [
            { name: "node", type: "bytes32" },
            { name: "key", type: "string" },
            { name: "value", type: "string" },
        ],
        outputs: [],
        stateMutability: "nonpayable",
    },
    {
        name: "text",
        type: "function",
        inputs: [
            { name: "node", type: "bytes32" },
            { name: "key", type: "string" },
        ],
        outputs: [{ name: "", type: "string" }],
        stateMutability: "view",
    },
] as const;
