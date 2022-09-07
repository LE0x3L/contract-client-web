const develNet = false;

const cfgLocalNet = {
    addrApiCLH : "0x3194cBDC3dbcd3E11a07892e7bA5c3394048Cc87",
    addrCLFactory : "0xe0aA552A10d7EC8760Fc6c246D391E698a82dDf9",
    defaultCLH : "0x321824B9e41754539061F1d5110d8e77f6F2D467",
    pKeyPayeer : "0x840bdb63e4e065597a3f5d5e5a3eed7b6b858400f2e262e83065bcec77049194", //BRW#99
    domEIP712Name: "CLHouse",
    domEIP712Version: "0.0.10",
    domEIP712IdChain: "0x539",
};

const cfgTestNet = {
    addrApiCLH : "0xc796366b43209BF25ea3a37a3F6346c727Dbe196",
    addrCLFactory : "0x8A330876a0110fBfE5faCD6349d99e7Fcd67f775",
    defaultCLH : "0x8e7eeb87637F56543C1413621011fc7e8fd5fD8D",
    pKeyPayeer : "0x840bdb63e4e065597a3f5d5e5a3eed7b6b858400f2e262e83065bcec77049194", //BRW#99
    domEIP712Name: "CLHouse",
    domEIP712Version: "0.0.10",
    domEIP712IdChain: "0x5",
};

const appcfg = develNet ? cfgLocalNet : cfgTestNet;