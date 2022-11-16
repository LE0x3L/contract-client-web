const develNet = false;

const cfgLocalNet = {
    addrApiCLH : "0x3194cBDC3dbcd3E11a07892e7bA5c3394048Cc87",
    addrCLFactory : "0x420b1099B9eF5baba6D92029594eF45E19A04A4A",
    addrCLBeacon : "0x9E4c14403d7d9A8A782044E86a93CAE09D7B2ac9",
    pKeyPayeer : "0x840bdb63e4e065597a3f5d5e5a3eed7b6b858400f2e262e83065bcec77049194", //BRW#99
    domEIP712Name: "CLHouse",
    domEIP712Version: "0.1.0",
    domEIP712IdChain: "0x539",
};

const cfgTestNet = {
    addrApiCLH : "0x64e165A55E43ebddeC5000D1BE4aE35E17cB7bfD",
    addrCLFactory : "0xB049136321DE7113b19F4F15f8F3fb7375212D63",
    addrCLBeacon : "0xe8F4087322dad5450C538670688F8c5e64775786",
    pKeyPayeer : "0x840bdb63e4e065597a3f5d5e5a3eed7b6b858400f2e262e83065bcec77049194", //BRW#99
    domEIP712Name: "CLHouse",
    domEIP712Version: "0.1.0",
    domEIP712IdChain: "0x5",
};

const appcfg = develNet ? cfgLocalNet : cfgTestNet;