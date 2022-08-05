var appVar = {
  addrApiCLH: "0xBc3E3f9D718f5fDd020FC556f49060c82189E0bB",
  domainName: "CLHouse",
  domainVersion: "0.0.10",
  ethProvider: null,
  chainId: null,
  signerWallet: null,
  payeerWallet: null,
  acceptance: null
};


async function connectWeb3() {
  if ( window.ethereum ) {
    logMsg( "Connecting to MetaMask..." );
    appVar.ethProvider = new ethers.providers.Web3Provider( window.ethereum )
    appVar.chainId = await ethereum.request( { method: 'net_version' } )

    // Ganache account to test
    appVar.payeerWallet = new ethers.Wallet( "6cbed15c793ce57650b9877cf6fa156fbef513c4e6134f022a85b1ffdd59b2a1", appVar.ethProvider )

    ethereum
    .request( { method: 'eth_requestAccounts' } )
    .then( ( resolve ) => {
      appVar.signerWallet = ethers.utils.getAddress( resolve[0] )
      logMsg( 'Signer wallet: ' + appVar.signerWallet );
    } )
    .catch( ( error ) => {
      console.log( error );
      if ( error.code === 4001 )
        logMsg( 'Please connect to MetaMask.' );
      else
        logMsg( "ERROR... " + error.message );
    } );
  } else {
    logMsg( "No Metamask detected" );
  }
}

function SignVoteEIP712() {
  logMsg( "Signing..." );
  const verifyingContract = ethers.utils.getAddress( document.getElementById( "addrContract" ).value );
  const propId = document.getElementById( "propId" ).value;
  const support = $( 'input[name=support]:checked', '#eip712form' ).val();
  const justification = document.getElementById( "justification" ).value;

  $( "form#eip712result :input" ).val( "" )
  $( "form#eip712result :input" ).removeClass( "is-invalid" )
  $( "form#eip712result :input" ).removeClass( "is-valid" )

  const msgParams = JSON.stringify( {types:
    {
      EIP712Domain:[
        {name:"name",type:"string"},
        {name:"version",type:"string"},
        {name:"chainId",type:"uint256"},
        {name:"verifyingContract",type:"address"}
      ],
      strOffChainVote:[
        {name:"voter",type:"address"},
        {name:"propId",type:"uint256"},
        {name:"support",type:"bool"},
        {name:"justification", type:"string"}
      ]
    },
    primaryType:"strOffChainVote",
    domain:{
      name: appVar.domainName,
      version: appVar.domainVersion,
      chainId: appVar.chainId,
      verifyingContract: verifyingContract
    },
    message:{
      voter: appVar.signerWallet,
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
    //getting r s v from a signature
    const signature = resolve.substring(2);
    const r = "0x" + signature.substring(0, 64);
    const s = "0x" + signature.substring(64, 128);
    const v = parseInt(signature.substring(128, 130), 16);
    console.log( "r:", r);
    console.log( "s:", s);
    console.log( "v:", v);
    $( '#eip712Signature' ).val( resolve );
    $( '#signR' ).val( r );
    $( '#signS' ).val( s );
    $( '#signV' ).val( v );
  } )
  .catch( ( error ) => {
    console.log( error );
    logMsg( "ERROR... " + error.message );
  } );
}

async function SendSignVote() {
  logMsg( "Sending ..." );
  const propId = +document.getElementById( "propId" ).value;
  const support = !!+$( 'input[name=support]:checked', '#eip712form' ).val();
  const justification = document.getElementById( "justification" ).value;
  const signR = document.getElementById( "signR" ).value;
  const signS = document.getElementById( "signS" ).value;
  const signV = document.getElementById( "signV" ).value;

  const houseAddr = ethers.utils.getAddress( document.getElementById( "addrContract" ).value );
  const contractData = await $.getJSON( "./abis/CLHouse.json" );

  // console.log(contractData);
  
  const daoCLH = new ethers.Contract( houseAddr, contractData.abi, appVar.payeerWallet );

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
    appVar.signerWallet,
    propId,
    support,
    justification,
    signR,
    signS,
    signV
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

async function ValidateSignVote() {
  logMsg( "Validating..." );

  $( "form#eip712result :input" ).removeClass( "is-invalid" )
  $( "form#eip712result :input" ).removeClass( "is-valid" )

  const propId = +document.getElementById( "propId" ).value;
  const support = !!+$( 'input[name=support]:checked', '#eip712form' ).val();
  const justification = document.getElementById( "justification" ).value;
  const eip712Signature = document.getElementById( "eip712Signature" ).value;
  const houseAddr = ethers.utils.getAddress( document.getElementById( "addrContract" ).value );
  const contractData = await $.getJSON( "./abis/ApiCLHouse.json" );
  // console.log(contractData);
  
  const apiCLH = new ethers.Contract( appVar.addrApiCLH, contractData.abi, appVar.ethProvider );

  apiCLH.ValidateSingOffChainVote(
    houseAddr,
    appVar.signerWallet,
    propId,
    support,
    justification,
    eip712Signature
  )
  .then( async ( resolve ) => {
    console.log( resolve );
    if ( resolve ){
      logMsg( "Validating... Is valid!!" );
      $( "form#eip712result :input" ).addClass( "is-valid" );
    }
    else
      $( "form#eip712result :input" ).addClass( "is-invalid" );
  } )
  .catch( ( error ) => {
    console.log( error );
    logMsg( "ERROR... " + error.error.reason );
    return
  } );
}

function SignInviEIP712( _acceptance ) {
  logMsg( "Signing..." );
  const verifyingContract = ethers.utils.getAddress( document.getElementById( "adrCLHinv" ).value );
  appVar.acceptance = _acceptance;

  $( "#signInvit" ).val( "" )
  $( "#signInvit" ).removeClass( "is-invalid" )
  $( "#signInvit" ).removeClass( "is-valid" )

  const msgParams = JSON.stringify( {types:
    {
      EIP712Domain:[
        {name:"name",type:"string"},
        {name:"version",type:"string"},
        {name:"chainId",type:"uint256"},
        {name:"verifyingContract",type:"address"}
      ],
      strOffChainInvitation:[
        {name:"signerWallet",type:"address"},
        {name:"acceptance",type:"bool"}
      ]
    },
    primaryType:"strOffChainInvitation",
    domain:{
      name: appVar.domainName,
      version: appVar.domainVersion,
      chainId: appVar.chainId,
      verifyingContract: verifyingContract
    },
    message:{
      signerWallet: appVar.signerWallet,
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
    $( '#signInvit' ).val( resolve );
  } )
  .catch( ( error ) => {
    console.log( error );
    logMsg( "ERROR... " + error.message );
  } );
}

async function ValiSignInvt() {
  logMsg( "Validating..." );

  $( "#signInvit" ).removeClass( "is-invalid" )
  $( "#signInvit" ).removeClass( "is-valid" )

  const acceptance = !!appVar.acceptance
  const signInvit = document.getElementById( "signInvit" ).value;
  const houseAddr = ethers.utils.getAddress( document.getElementById( "adrCLHinv" ).value );
  const contractData = await $.getJSON( "./abis/ApiCLHouse.json" );
  // console.log(contractData);
  
  const apiCLH = new ethers.Contract( appVar.addrApiCLH, contractData.abi, appVar.ethProvider );

  apiCLH.ValiSignInvt( houseAddr, appVar.signerWallet, acceptance, signInvit )
  .then( async ( resolve ) => {
    console.log( resolve );
    if ( resolve ){
      logMsg( "Validating... Is valid!!" );
      $( "#signInvit" ).addClass( "is-valid" );
    }
    else
      $( "#signInvit" ).addClass( "is-invalid" );
  } )
  .catch( ( error ) => {
    console.log( error );
    logMsg( "ERROR... " + error.error.reason );
    return
  } );
}

async function SendSignInvt() {
  logMsg( "Sending ..." );
  const acceptance = !!appVar.acceptance
  const signInvit = document.getElementById( "signInvit" ).value;
  const houseAddr = ethers.utils.getAddress( document.getElementById( "adrCLHinv" ).value );
  const contractData = await $.getJSON( "./abis/CLHouse.json" ); 
  const daoCLH = new ethers.Contract( houseAddr, contractData.abi, appVar.payeerWallet );

  daoCLH.AcceptRejectInvitation( acceptance, appVar.signerWallet, signInvit )
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