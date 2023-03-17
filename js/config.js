const abiCLH = "./abis/CLHouse.json";
const abiCLFApi = "./abis/CLFactoryApi.json";
const abiCLANFT = "./abis/CLANFT.json";


const cfgGanache = {
    netName : "Ganache",
    urlGraphQL : "#",
    urlExplorer : "#",
    addrApiCLH : "0xE7eD6747FaC5360f88a2EFC03E00d25789F69291",
    addrApiCLF : "0xe0aA552A10d7EC8760Fc6c246D391E698a82dDf9",
    addrCLFactory : "0xa3B53dDCd2E3fC28e8E130288F2aBD8d5EE37472",
    addrCLHBeacon : "0xed00238F9A0F7b4d93842033cdF56cCB32C781c2",
    addrCLANFT : "0x26f15335BB1C6a4C0B660eDd694a0555A9F1cce3",
    pKeyPayeer : "0x840bdb63e4e065597a3f5d5e5a3eed7b6b858400f2e262e83065bcec77049194", //BRW#99
    domEIP712Name: "CLHouse",
    domEIP712Version: "0.2.0",
    domEIP712IdChain: "0x539"
};

const cfgMumbai_test = {
    netName : "Mumbai TEST",
    urlGraphQL : "https://qa-api.cryptoleague.org/graphql",
    urlExplorer : "https://mumbai.polygonscan.com",
    addrApiCLH : "0x6b41bC24282E4BB8484B287854e75C8792ef7386",
    addrApiCLF : "0xa0ccC5f57812E699929C53B2A5C536Da12CD54e3",
    addrCLFactory : "0x99e89febf009b9f238f585cA2978aa8568bd421f",
    addrCLHBeacon : "0x15928901fb5A990575824148984432E31E41644F",
    addrCLANFT : "0xF5bc30d3D2BDA2199F5141C758621fAA48153E55",
    pKeyPayeer : "0x840bdb63e4e065597a3f5d5e5a3eed7b6b858400f2e262e83065bcec77049194", //BRW#99
    domEIP712Name: "CLHouse",
    domEIP712Version: "0.2.0",
    domEIP712IdChain: "0x13881"
};

const cfgMumbai_dev = {
    netName : "Mumbai DEV",
    urlGraphQL : "https://devel-api.cryptoleague.org/graphql",
    urlExplorer : "https://mumbai.polygonscan.com",
    addrApiCLH : "0x6b41bC24282E4BB8484B287854e75C8792ef7386",
    addrApiCLF : "0xa0ccC5f57812E699929C53B2A5C536Da12CD54e3",
    addrCLFactory : "0x99e89febf009b9f238f585cA2978aa8568bd421f",
    addrCLHBeacon : "0x15928901fb5A990575824148984432E31E41644F",
    addrCLANFT : "0xF5bc30d3D2BDA2199F5141C758621fAA48153E55",
    pKeyPayeer : "0x840bdb63e4e065597a3f5d5e5a3eed7b6b858400f2e262e83065bcec77049194", //BRW#99
    domEIP712Name: "CLHouse",
    domEIP712Version: "0.2.0",
    domEIP712IdChain: "0x13881"
};

const cfgMumbai_qa = {
    netName : "Mumbai QA",
    urlGraphQL : "https://qa-api.cryptoleague.org/graphql",
    urlExplorer : "https://mumbai.polygonscan.com",
    addrApiCLH : "0x0aF7903Ba2Df4359B1BFa4EbfECd81375959136B",
    addrApiCLF : "0x64e165A55E43ebddeC5000D1BE4aE35E17cB7bfD",
    addrCLFactory : "0xE6Dae3458BEC9d70ACB9ca93068349F8491593F7",
    addrCLHBeacon : "0xF6Ff4D17CF8Ac49Ce37aDB077f65FDA5F18c594D",
    addrCLANFT : "0x6603E31400E214619b73af6B8813b96D625ea328",
    pKeyPayeer : "0x840bdb63e4e065597a3f5d5e5a3eed7b6b858400f2e262e83065bcec77049194", //BRW#99
    domEIP712Name: "CLHouse",
    domEIP712Version: "0.2.0",
    domEIP712IdChain: "0x13881"
};

appcfg = cfgGanache;
ocBackEnd = true;
enviroment = "qa"; // local - test - dev - qa - prod
