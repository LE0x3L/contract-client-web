var appVar = {
  addrApiCLH: "0x16eC1E0ad4e8b212cD3cC94152f19a52ec5FAa98",
  domainName: "CLHouse",
  domainVersion: "0.0.10",
  payeerPKey: null,
  ethProvider: null,
  chainId: null,
  signerWallet: null,
  payeerWallet: null,
  metamaskWallet: null,
  apiCLH: null
};

// 0x5eebf3DD83E7d3Db3b81f8cBf57675b51c8b790F

async function connectWeb3() {
  // https://docs.metamask.io/guide/rpc-api.html
  $("#txtPayeerPKey").removeClass( "is-invalid" );
  $("#txtSignerWallet").val( "" )
  $("#txtPayeerWallet").val( "" )

  if( $("#txtPayeerPKey").val().length == 66 || $("#txtPayeerPKey").val().length == 64 )
    appVar.payeerPKey=$("#txtPayeerPKey").val();
  else {
    logMsg( "ERROR... Invalid length Private Key" );
    $("#txtPayeerPKey").addClass( "is-invalid" );
    $('html, body').animate({ scrollTop: $("#txtPayeerPKey").offset().top - 70}, 1500);
    return
  }

  if ( window.ethereum ) {
    logMsg( "Connecting to MetaMask..." );

    appVar.chainId = await ethereum.request( { method: 'net_version' } )
    // appVar.chainId = 1337
    
    if( appVar.chainId != 5 ) {
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: "0x5" }]
        });      
        appVar.chainId = await ethereum.request( { method: 'net_version' } )
      } catch( error ) {
        logMsg( "ERROR... Invalid Network" );
        console.log(error);
        return
      }
    }

    appVar.ethProvider = new ethers.providers.Web3Provider( window.ethereum )

    try {
      appVar.payeerWallet = new ethers.Wallet( appVar.payeerPKey, appVar.ethProvider )
      $("#txtPayeerWallet").val( appVar.payeerWallet.address )
      logMsg( 'Payeer wallet: ' + appVar.payeerWallet.address );
    } catch( error ) {
      logMsg( "ERROR... Invalid Payeer Private Key" );
      console.log(error);
      return
    }

    try {
      const contractData = await $.getJSON( "./abis/ApiCLHouse.json" );
      // console.log(contractData);
      appVar.apiCLH = new ethers.Contract( appVar.addrApiCLH, contractData.abi, appVar.ethProvider );
    } catch( error ){
      logMsg( "ERROR... Can't instance ApiCLH" );
      console.log(error);
      return
    }

    ethereum
    .request( { method: 'eth_requestAccounts' } )
    .then( ( resolve ) => {
      appVar.signerWallet = ethers.utils.getAddress( resolve[0] )
      appVar.metamaskWallet = appVar.ethProvider.getSigner( resolve[0] )
      console.log( appVar.signerWallet );
      $("#txtSignerWallet").val( appVar.signerWallet )
      logMsg( 'Signer wallet: ' + appVar.signerWallet );
    } )
    .catch( ( error ) => {
      console.log( error );
      if ( error.code === 4001 )
        logMsg( 'ERROR... Please, select an account to connect with your MetaMask.' );
      else if ( error.code === -32002 )
        logMsg( 'ERROR... Please unlock your MetaMask.' );
      else
        logMsg( "ERROR... " + error.message );
    } );
  } else {
    logMsg( "ERROR... No Metamask detected" );
  }
}

// Sing, Validate and Send Off Chain Vote
async function SVSOCVote() {
  try {
    const propId = +$( "#iptPropIdOCVote" ).val();
    const support = !!+$( 'input[name=iptSupportOCVote]:checked' ).val();
    const justification = $( "#txtJustOCVote" ).val();

    const houseAddress = await GetCLHAddress();

    const msgParams = JSON.stringify( { types:
      {
        EIP712Domain:[
          {name:"name",type:"string"},
          {name:"version",type:"string"},
          {name:"chainId",type:"uint256"},
          {name:"verifyingContract",type:"address"}
        ],
        strOCVote:[
          {name:"propId",type:"uint256"},
          {name:"support",type:"bool"},
          {name:"justification", type:"string"}
        ]
      },
      primaryType:"strOCVote",
      domain:{
        name: appVar.domainName,
        version: appVar.domainVersion,
        chainId: appVar.chainId,
        verifyingContract: houseAddress
      },
      message:{
        propId: propId,
        support: support,
        justification: justification
      }
    } );

    const eip712Signature =  await EIP712Sing( msgParams, "OCVote" );

    const eip712Signer = await appVar.apiCLH.SignerOCVote(
      propId,
      support,
      justification,
      houseAddress,
      eip712Signature
    );
    console.log( "Signer: " + eip712Signer )

    if ( eip712Signer != appVar.signerWallet ) {
      $( "#iptSignOCVote" ).addClass( "is-invalid" );
      logMsg( "Error... The signature is invalid" )
      return
    }

    $( "#iptSignOCVote" ).addClass( "is-valid" );

    const daoCLH = await InstantiateOCCLH( houseAddress );

    // Validate the propId
    const proposal = await daoCLH.arrProposals( propId );
    console.log( proposal );

    const ethTx = await daoCLH.VotePropOffChain(
      propId,
      support,
      justification,
      eip712Signature
    );

    console.log( ethTx );
    logMsg( "Wait confirmation... https://goerli.etherscan.io/tx/" + ethTx.hash);
    
    const resultTx = await ethTx.wait();
    console.log( resultTx );
    logMsg( "Successful!!!... https://goerli.etherscan.io/tx/" + resultTx.transactionHash );
  } catch( error ) {
    console.log( error );
    ShowError( error );
  }
}

// Sing, Validate and Send Off Chain Invitation acceptance
async function SVSOCInvit( _acceptance ) {
  try {
    const houseAddress = await GetCLHAddress();

    const msgParams = JSON.stringify( { types:
      {
        EIP712Domain:[
          {name:"name",type:"string"},
          {name:"version",type:"string"},
          {name:"chainId",type:"uint256"},
          {name:"verifyingContract",type:"address"}
        ],
        strOCInvit:[
          {name:"acceptance",type:"bool"}
        ]
      },
      primaryType:"strOCInvit",
      domain:{
        name: appVar.domainName,
        version: appVar.domainVersion,
        chainId: appVar.chainId,
        verifyingContract: houseAddress
      },
      message:{
        acceptance: !!_acceptance
      }
    } );

    const eip712Signature =  await EIP712Sing( msgParams, "OCInvit" );

    const eip712Signer = await appVar.apiCLH.SignerOCInvit(
      _acceptance,
      houseAddress,
      eip712Signature
    ); 
    console.log( "Signer: " + eip712Signer )

    if ( eip712Signer != appVar.signerWallet ){
      $( "#iptSignOCInvit" ).addClass( "is-invalid" );
      logMsg( "Error... The signature is invalid" )
      return
    }
      
    $( "#iptSignOCInvit" ).addClass( "is-valid" );

    const daoCLH = await InstantiateOCCLH( houseAddress );
    const ethTx = await daoCLH.AcceptRejectInvitation( _acceptance, eip712Signature )
    console.log( ethTx );
    logMsg( "Wait confirmation... https://goerli.etherscan.io/tx/" + ethTx.hash);
    
    const resultTx = await ethTx.wait();
    console.log( resultTx );
    logMsg( "Successful!!!... https://goerli.etherscan.io/tx/" + resultTx.transactionHash );
  } catch( error ) {
    console.log( error );
    ShowError( error );
  }
}

function SignOCNewMember() {
  try {
    appVar.addrCLH = ethers.utils.getAddress( $( "#txtAddrCLHouse" ).val() );
  } catch (error) {
    console.log(error);
    logMsg( "ERROR... Invalid CLHouse address" );
    return
  }

  const msgParams = JSON.stringify( {types:
    {
      EIP712Domain:[
        {name:"name",type:"string"},
        {name:"version",type:"string"},
        {name:"chainId",type:"uint256"},
        {name:"verifyingContract",type:"address"}
      ],
      strOCNewMember:[
        {name:"_walletAddr",type:"address"},
        {name:"_name",type:"string"},
        {name:"_description",type:"string"},
        {name:"_isManager",type:"bool"},
        {name:"_delayTime",type:"uint256"}
      ]
    },
    primaryType:"strOCNewMember",
    domain:{
      name: appVar.domainName,
      version: appVar.domainVersion,
      chainId: appVar.chainId,
      verifyingContract: appVar.addrCLH
    },
    message:{
      _walletAddr: ethers.utils.getAddress( $("#iptNewMmrAddr").val() ),
      _name: $("#iptNewMmrName").val(),
      _description: $("#iptNewMmrDescrip").val(),
      _isManager: !!+$( 'input[name=iptNewMmrIsManager]:checked' ).val(),
      _delayTime: +$("#iptNewMmrDelay").val()
    }
  } );

  EIP712Sing( msgParams, "OCNewMember" );
}

function ValidOCNewMember() {
  logMsg( "Validating Signature..." );

  $( "#iptSignOCNewMember" ).removeClass( "is-invalid" )
  $( "#iptSignOCNewMember" ).removeClass( "is-valid" )

  const eip712Signature = $( "#iptSignOCNewMember" ).val();

  appVar.apiCLH.ValidOCNewMember(
    appVar.addrCLH,
    ethers.utils.getAddress( $("#iptNewMmrAddr").val() ),
    $("#iptNewMmrName").val(),
    $("#iptNewMmrDescrip").val(),
    !!+$( 'input[name=iptNewMmrIsManager]:checked' ).val(),
    +$("#iptNewMmrDelay").val(),
    eip712Signature,
    appVar.signerWallet
  )
  .then( ( resolve ) => {
    console.log( resolve );
    if ( resolve ){
      logMsg( "Validating Signature... Is valid!!" );
      $( "#iptSignOCNewMember" ).addClass( "is-valid" );
    }
    else
      $( "#iptSignOCNewMember" ).addClass( "is-invalid" );
  } )
  .catch( ( error ) => {
    console.log( error );
    logMsg( "ERROR... " + error.error.reason );
    return
  } );
}