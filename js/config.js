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
    addrApiCLH : "0x043599651F0EB45Cb275fE26DC789a302D001D4f",
    addrCLFactory : "0xe6039f91dB2b88E608F9E7ab8117aBf6F94aD5a1",
    defaultCLH : "0x67F2b94ff6a3F5b44135bb9F09373272240d4219",
    pKeyPayeer : "0x840bdb63e4e065597a3f5d5e5a3eed7b6b858400f2e262e83065bcec77049194", //BRW#99
    domEIP712Name: "CLHouse",
    domEIP712Version: "0.0.10",
    domEIP712IdChain: "0x5",
};

const appcfg = develNet ? cfgLocalNet : cfgTestNet;