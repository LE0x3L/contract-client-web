var appVar = {
  addrApiCLH: "0x4CD0618b8a80716d4d459F606648E208bb8A946A",
  domainName: "CLHouse",
  domainVersion: "0.0.10",
  payeerPKey: null,
  ethProvider: null,
  chainId: null,
  signerWallet: null,
  payeerWallet: null,
  acceptance: null,
  addrCLH: null,
  apiCLH: null
};


async function connectWeb3() {
  if( $("#txtPayeerPKey").val().length == 66 || $("#txtPayeerPKey").val().length == 64 )
    appVar.payeerPKey=$("#txtPayeerPKey").val()
  else {
    logMsg( "ERROR... Invalid length Private Key" );
    return
  }

  if ( window.ethereum ) {
    logMsg( "Connecting to MetaMask..." );

    appVar.chainId = await ethereum.request( { method: 'net_version' } )
    
    // if( appVar.chainId != 5 ) {
    //   try {
    //     await window.ethereum.request({
    //       method: 'wallet_switchEthereumChain',
    //       params: [{ chainId: "0x5" }]
    //     });      
    //     appVar.chainId = await ethereum.request( { method: 'net_version' } )
    //   } catch( error ) {
    //     logMsg( "ERROR... Invalid Network" );
    //     console.log(error);
    //     return
    //   }
    // }

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

function SignOCVote() {
  logMsg( "Signing OCVote..." );
  const propId = $( "#iptPropIdOCVote" ).val();
  const support = $( 'input[name=iptSupportOCVote]:checked' ).val();
  const justification = $( "#txtJustOCVote" ).val();

  try {
    appVar.addrCLH = ethers.utils.getAddress( $( "#txtAddrCLHouse" ).val() );
  } catch (error) {
    console.log(error);
    logMsg( "ERROR... Invalid CLHouse address" );
    return
  }

  $( "#iptSignOCVote" ).val( "" )
  $( "#iptSignOCVote" ).removeClass( "is-invalid" )
  $( "#iptSignOCVote" ).removeClass( "is-valid" )

  const msgParams = JSON.stringify( {types:
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
      verifyingContract: appVar.addrCLH
    },
    message:{
      propId: +propId,
      support: !!+support,
      justification: justification
    }
  } )

  const params = [ appVar.signerWallet, msgParams ]
  const method = 'eth_signTypedData_v4'
  console.log( 'SIGN REQ ', method, ' params', params)

  ethereum
  .request( {
    method,
    params
  } )
  .then( ( resolve ) => {
    logMsg( 'SIGNED: ' + resolve );
    $( '#iptSignOCVote' ).val( resolve );
    //getting r s v from a signature
    // const signature = resolve.substring(2);
    // const r = "0x" + signature.substring(0, 64);
    // const s = "0x" + signature.substring(64, 128);
    // const v = parseInt(signature.substring(128, 130), 16);
    // console.log( "r:", r);
    // console.log( "s:", s);
    // console.log( "v:", v);
    // $( '#signR' ).val( r );
    // $( '#signS' ).val( s );
    // $( '#signV' ).val( v );
  } )
  .catch( ( error ) => {
    console.log( error );
    logMsg( "ERROR... " + error.message );
  } );
}

async function ValidOCVote() {
  logMsg( "Validating OCVote..." );

  $( "#iptSignOCVote" ).removeClass( "is-invalid" );
  $( "#iptSignOCVote" ).removeClass( "is-valid" );

  const propId = $( "#iptPropIdOCVote" ).val();
  const support = $( 'input[name=iptSupportOCVote]:checked' ).val();
  const justification = $( "#txtJustOCVote" ).val();
  const eip712Signature = $( "#iptSignOCVote" ).val();

  appVar.apiCLH.ValidOCVote(
    appVar.addrCLH,
    propId,
    support,
    justification,
    eip712Signature,
    appVar.signerWallet
  )
  .then( async ( resolve ) => {
    console.log( resolve );
    if ( resolve ){
      $( "#iptSignOCVote" ).addClass( "is-valid" );
      logMsg( "Validating... Is valid!!" );
    }
    else{
      $( "#iptSignOCVote" ).addClass( "is-invalid" );
      logMsg( "Validating... Is invalid!!" );
    }
  } )
  .catch( ( error ) => {
    console.log( error );
    logMsg( "ERROR... " + error.error.reason );
    return
  } );
}

async function SendOCVote() {
  logMsg( "Sending OCVote..." );
  const propId = $( "#iptPropIdOCVote" ).val();
  const support = $( 'input[name=iptSupportOCVote]:checked' ).val();
  const justification = $( "#txtJustOCVote" ).val();
  const eip712Signature = $( "#iptSignOCVote" ).val();

  const contractData = await $.getJSON( "./abis/CLHouse.json" );

  // console.log(contractData);
  
  const daoCLH = new ethers.Contract( appVar.addrCLH, contractData.abi, appVar.payeerWallet );

  // Validate the propId
  await daoCLH
  .arrProposals( propId )
  .then( ( resolve ) => {
    console.log( resolve );
  } )
  .catch( async ( error ) => {
    console.log( error );
    logMsg( "ERROR... " + error.error.message );
    // return
  } );

  await daoCLH
  .VotePropOffChain(
    propId,
    support,
    justification,
    eip712Signature
  )
  .then( async ( resolve ) => {
    console.log( resolve );
    logMsg( "Wait confirmation... https://goerli.etherscan.io/tx/"+resolve.hash);

    const resultTx = await resolve.wait();
    console.log( resultTx );
    logMsg( "Successful!!!... https://goerli.etherscan.io/tx/" + resultTx.transactionHash );
  } )
  .catch( ( error ) => {
    console.log( error );
    logMsg( "ERROR... " + error.error.reason );
    return
  } );
}

function SignOCInvit( _acceptance ) {
  logMsg( "Signing OCInvit..." );
  
  appVar.acceptance = _acceptance;

  try {
    appVar.addrCLH = ethers.utils.getAddress( $( "#txtAddrCLHouse" ).val() );
  } catch (error) {
    console.log(error);
    logMsg( "ERROR... Invalid CLHouse address" );
    return
  }

  $( "#iptSignOCInvit" ).val( "" )
  $( "#iptSignOCInvit" ).removeClass( "is-invalid" )
  $( "#iptSignOCInvit" ).removeClass( "is-valid" )

  const msgParams = JSON.stringify( {types:
    {
      EIP712Domain:[
        {name:"name",type:"string"},
        {name:"version",type:"string"},
        {name:"chainId",type:"uint256"},
        {name:"verifyingContract",type:"address"}
      ],
      strOCInvitation:[
        {name:"acceptance",type:"bool"}
      ]
    },
    primaryType:"strOCInvitation",
    domain:{
      name: appVar.domainName,
      version: appVar.domainVersion,
      chainId: appVar.chainId,
      verifyingContract: appVar.addrCLH
    },
    message:{
      acceptance: !!_acceptance
    }
  } );

  const params = [ appVar.signerWallet, msgParams ]
  const method = 'eth_signTypedData_v4'
  console.log( 'SIGN REQ ', method, ' params: ', msgParams)

  // appVar.ethProvider.send( method, params ) // ethersJS version
  ethereum
  .request( {
    method,
    params
  } )
  .then( ( resolve ) => {
    logMsg( 'SIGNED: ' + resolve );
    $( '#iptSignOCInvit' ).val( resolve );
  } )
  .catch( ( error ) => {
    console.log( error );
    logMsg( "ERROR... " + error.message );
  } );
}

async function ValidOCInvit() {
  logMsg( "Validating..." );

  $( "#iptSignOCInvit" ).removeClass( "is-invalid" )
  $( "#iptSignOCInvit" ).removeClass( "is-valid" )

  const acceptance = !!appVar.acceptance
  const eip712Signature = $( "#iptSignOCInvit" ).val();

  appVar.apiCLH.ValiSignInvt( appVar.addrCLH, acceptance, eip712Signature, appVar.signerWallet )
  .then( async ( resolve ) => {
    console.log( resolve );
    if ( resolve ){
      logMsg( "Validating... Is valid!!" );
      $( "#iptSignOCInvit" ).addClass( "is-valid" );
    }
    else
      $( "#iptSignOCInvit" ).addClass( "is-invalid" );
  } )
  .catch( ( error ) => {
    console.log( error );
    logMsg( "ERROR... " + error.error.reason );
    return
  } );
}

async function SendOCInvit() {
  logMsg( "Sending ..." );
  const acceptance = !!appVar.acceptance
  const eip712Signature = $( "#iptSignOCInvit" ).val();
  const contractData = await $.getJSON( "./abis/CLHouse.json" ); 
  const daoCLH = new ethers.Contract( appVar.addrCLH, contractData.abi, appVar.payeerWallet );

  daoCLH.AcceptRejectInvitation( acceptance, eip712Signature )
  .then( async ( resolve ) => {
    console.log( resolve );
    logMsg( "Wait confirmation... https://goerli.etherscan.io/tx/" + resolve.hash);

    const resultTx = await resolve.wait();
    console.log( resultTx );
    logMsg( "Successful!!!... https://goerli.etherscan.io/tx/" + resultTx.transactionHash );
  } )
  .catch( ( error ) => {
    console.log( error );
    logMsg( "ERROR... " + error.error.reason );
    return
  } );
}