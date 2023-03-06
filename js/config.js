const abiCLH = "./abis/CLHouse.json";
const abiCLFApi = "./abis/CLFactoryApi.json";


const cfgGanache = {
    netName : "Ganache",
    urlGraphQL : "#",
    urlExplorer : "#",
    addrApiCLH : "0xE7eD6747FaC5360f88a2EFC03E00d25789F69291",
    addrApiCLF : "0xe0aA552A10d7EC8760Fc6c246D391E698a82dDf9",
    addrCLFactory : "0xa3B53dDCd2E3fC28e8E130288F2aBD8d5EE37472",
    addrCLHBeacon : "0xed00238F9A0F7b4d93842033cdF56cCB32C781c2",
    pKeyPayeer : "0x840bdb63e4e065597a3f5d5e5a3eed7b6b858400f2e262e83065bcec77049194", //BRW#99
    domEIP712Name: "CLHouse",
    domEIP712Version: "0.2.0",
    domEIP712IdChain: "0x539"
};

const cfgMumbai_test = {
    netName : "Mumbai TEST",
    urlGraphQL : "https://qa-api.cryptoleague.org/graphql",
    urlExplorer : "https://mumbai.polygonscan.com",
    addrApiCLH : "0x98a106Ed52E735aF0E32191038eB8706b6e2Af7C",
    addrApiCLF : "0x6a7a3345BCd72f1EF7d85451808a0A0189f0978E",
    addrCLFactory : "0x57d9BDC855B28Ec1b74Ac25063a25a56d92B8042",
    addrCLBeacon : "0xD5b7B69fF59FB2c3A0EF3f5D4F6c84c83fAB149A",
    pKeyPayeer : "0x840bdb63e4e065597a3f5d5e5a3eed7b6b858400f2e262e83065bcec77049194", //BRW#99
    domEIP712Name: "CLHouse",
    domEIP712Version: "0.2.0",
    domEIP712IdChain: "0x13881"
};

const cfgMumbai_dev = {
    netName : "Mumbai DEV",
    urlGraphQL : "https://qa-api.cryptoleague.org/graphql",
    urlExplorer : "https://mumbai.polygonscan.com",
    addrApiCLH : "0x2A52BDCF5c029028bf61c3fB20D5a0dFe560EF61",
    addrApiCLF : "0x5153fb835508dAe6B17f9239673843F3a117854e",
    addrCLFactory : "0xD1231F7F23CF49C01382Df7A3774095F6a346b0a",
    addrCLBeacon : "0xcbAF5fF547826e5b8e9226db0C87F6eC30Ddc0a8",
    pKeyPayeer : "0x840bdb63e4e065597a3f5d5e5a3eed7b6b858400f2e262e83065bcec77049194", //BRW#99
    domEIP712Name: "CLHouse",
    domEIP712Version: "0.2.0",
    domEIP712IdChain: "0x13881"
};

appcfg = cfgGanache;
ocBackEnd = false;
enviroment = "dev"; // test - dev - qa - prod
