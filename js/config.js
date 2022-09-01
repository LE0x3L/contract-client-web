const localNet = true;

const devcfg = {
    addrApiCLH : "0x57d9BDC855B28Ec1b74Ac25063a25a56d92B8042",
    addrCLFactory : "0x0D3229B81a91aca3d0f6c13eE92F2e6Af7b8a76c",
    defaultCLH : "0x74dBdc7949f6Ea106dE87112CCF270fef97B6a43",
    pKeyPayeer : "0x840bdb63e4e065597a3f5d5e5a3eed7b6b858400f2e262e83065bcec77049194", //BRW#99
    clDomainEIP712 : {
      name: "CLHouse",
      version: "0.0.10",
    }
};

const prdcfg = {
    addrApiCLH : "0x57d9BDC855B28Ec1b74Ac25063a25a56d92B8042",
    addrCLFactory : "0x0D3229B81a91aca3d0f6c13eE92F2e6Af7b8a76c",
    defaultCLH : "0x74dBdc7949f6Ea106dE87112CCF270fef97B6a43",
    pKeyPayeer : "0x840bdb63e4e065597a3f5d5e5a3eed7b6b858400f2e262e83065bcec77049194", //BRW#99
    clDomainEIP712 : {
      name: "CLHouse",
      version: "0.0.10",
    }
};

const clcfg = localNet ? devcfg : prdcfg;
