const abiCLH = "./abis/CLHouse.json";
const abiCLFApi = "./abis/CLFactoryApi.json";


const cfgLocalNet = {
    urlExplorer : "#",
    prefixOCBE : "",
    addrApiCLH : "0x3194cBDC3dbcd3E11a07892e7bA5c3394048Cc87",
    addrApiCLF : "0x602C71e4DAC47a042Ee7f46E0aee17F94A3bA0B6",
    addrCLFactory : "0xa3B53dDCd2E3fC28e8E130288F2aBD8d5EE37472",
    addrCLBeacon : "0xcCB53c9429d32594F404d01fbe9E65ED1DCda8D9",
    pKeyPayeer : "0x840bdb63e4e065597a3f5d5e5a3eed7b6b858400f2e262e83065bcec77049194", //BRW#99
    domEIP712Name: "CLHouse",
    domEIP712Version: "0.1.1",
    domEIP712IdChain: "0x539",
};

const cfgGoerli = {
    urlExplorer : "https://goerli.etherscan.io",
    prefixOCBE : "",
    addrApiCLH : "0x7f13cCA000f7Ee9bC05bdB2B0756871aA0483600",
    addrApiCLF : "0x3d2196559a368615BE407b4086EB95D014BcFE8a",
    addrCLFactory : "0x644f05Fb0aaA2554de936357e4085969A329191d",
    addrCLBeacon : "0xD35AEb3feCa809BEf32e0e5437ee08C9E3eeA732",
    pKeyPayeer : "0x840bdb63e4e065597a3f5d5e5a3eed7b6b858400f2e262e83065bcec77049194", //BRW#99
    domEIP712Name: "CLHouse",
    domEIP712Version: "0.1.0",
    domEIP712IdChain: "0x5",
};

const cfgGoerli_Test = {
    urlExplorer : "https://goerli.etherscan.io",
    prefixOCBE : "",
    addrApiCLH : "0x576a3a976147731ed684e8651410c4Ba7FA6c466",
    addrApiCLF : "0x845ec9Be732090F31e2AA655797c265C51C62cD1",
    addrCLFactory : "0x6bB832cB030f127a55E89eA932A358a57a550F7D",
    addrCLBeacon : "0x7a09054f33654FbD22843717b27dB74a81d169EB",
    pKeyPayeer : "0x840bdb63e4e065597a3f5d5e5a3eed7b6b858400f2e262e83065bcec77049194", //BRW#99
    domEIP712Name: "CLHouse",
    domEIP712Version: "0.1.1",
    domEIP712IdChain: "0x5",
};

const cfgMumbai = {
    urlExplorer : "https://mumbai.polygonscan.com",
    prefixOCBE : "mumbai/",
    addrApiCLH : "0x98a106Ed52E735aF0E32191038eB8706b6e2Af7C",
    addrApiCLF : "0x6a7a3345BCd72f1EF7d85451808a0A0189f0978E",
    addrCLFactory : "0x57d9BDC855B28Ec1b74Ac25063a25a56d92B8042",
    addrCLBeacon : "0xD5b7B69fF59FB2c3A0EF3f5D4F6c84c83fAB149A",
    pKeyPayeer : "0x840bdb63e4e065597a3f5d5e5a3eed7b6b858400f2e262e83065bcec77049194", //BRW#99
    domEIP712Name: "CLHouse",
    domEIP712Version: "0.1.0",
    domEIP712IdChain: "0x13881",
};

appcfg = cfgGoerli;
ocBackEnd = true;
testConfig = true
