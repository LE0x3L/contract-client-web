const develNet = false;

const cfgLocalNet = {
    addrApiCLH : "0x6951b5Bd815043E3F842c1b026b0Fa888Cc2DD85",
    addrCLFactory : "0xe0aA552A10d7EC8760Fc6c246D391E698a82dDf9",
    defaultCLH : "0x321824B9e41754539061F1d5110d8e77f6F2D467",
    pKeyPayeer : "0x840bdb63e4e065597a3f5d5e5a3eed7b6b858400f2e262e83065bcec77049194", //BRW#99
    domEIP712Name: "CLHouse",
    domEIP712Version: "0.0.10",
    domEIP712IdChain: "0x539",
};

const cfgTestNet = {
    addrApiCLH : "0x6b41bC24282E4BB8484B287854e75C8792ef7386",
    addrCLFactory : "0xa2D38046fd49231E892F5653F239145779e9d924",
    defaultCLH : "0xB30da0D62bFB50C1f4AC19233dAD4BD2fD580020",
    pKeyPayeer : "0x840bdb63e4e065597a3f5d5e5a3eed7b6b858400f2e262e83065bcec77049194", //BRW#99
    domEIP712Name: "CLHouse",
    domEIP712Version: "0.0.10",
    domEIP712IdChain: "0x5",
};

const appcfg = develNet ? cfgLocalNet : cfgTestNet;