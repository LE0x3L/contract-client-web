const develNet = false;

const cfgLocalNet = {
    addrApiCLH : "0x3194cBDC3dbcd3E11a07892e7bA5c3394048Cc87",
    addrCLFactory : "0x420b1099B9eF5baba6D92029594eF45E19A04A4A",
    addrCLBeacon : "0x4973215186cd002578B4d92f54B868550627f2a4",
    pKeyPayeer : "0x840bdb63e4e065597a3f5d5e5a3eed7b6b858400f2e262e83065bcec77049194", //BRW#99
    domEIP712Name: "CLHouse",
    domEIP712Version: "0.0.10",
    domEIP712IdChain: "0x539",
};

const cfgTestNet = {
    addrApiCLH : "0xa0ccC5f57812E699929C53B2A5C536Da12CD54e3",
    addrCLFactory : "0x6def2797169299C12EA7e24C042de739234e2d95",
    addrCLBeacon : "0x4973215186cd002578B4d92f54B868550627f2a4",
    pKeyPayeer : "0x840bdb63e4e065597a3f5d5e5a3eed7b6b858400f2e262e83065bcec77049194", //BRW#99
    domEIP712Name: "CLHouse",
    domEIP712Version: "0.0.10",
    domEIP712IdChain: "0x5",
};

const appcfg = develNet ? cfgLocalNet : cfgTestNet;