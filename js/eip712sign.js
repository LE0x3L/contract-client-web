var appVar = {
  payeerPKey: null,
  ethProvider: null,
  chainId: null,
  signerWallet: null,
  payeerWallet: null,
  metamaskWallet: null,
  apiCLH: null
};

const addrApiCLH = "0x16eC1E0ad4e8b212cD3cC94152f19a52ec5FAa98"
const eip712Domain = {
  name: "CLHouse",
  version: "0.0.10",
}
// 0x5eebf3DD83E7d3Db3b81f8cBf57675b51c8b790F
// 840bdb63e4e065597a3f5d5e5a3eed7b6b858400f2e262e83065bcec77049194




  // if ( window.ethereum ) {
  //   logMsg( "Connecting to MetaMask..." );
    
  //   appVar.ethProvider = new ethers.providers.Web3Provider( window.ethereum )

  //   ethereum
  //   .request( { method: 'eth_requestAccounts' } )
  //   .then( ( resolve ) => {
  //     appVar.signerWallet = ethers.utils.getAddress( resolve[0] )
  //     appVar.metamaskWallet = appVar.ethProvider.getSigner( resolve[0] )
  //     console.log( appVar.signerWallet );
  //     $("#txtSignerWallet").val( appVar.signerWallet )
  //     logMsg( 'Signer wallet: ' + appVar.signerWallet );
  //   } )
  //   .catch( ( error ) => {
  //     console.log( error );
  //     if ( error.code === 4001 )
  //       logMsg( 'ERROR... Please, select an account to connect with your MetaMask.' );
  //     else if ( error.code === -32002 )
  //       logMsg( 'ERROR... Please unlock your MetaMask.' );
  //     else
  //       logMsg( "ERROR... " + error.message );

  //     return
  //   } );

  //   appVar.chainId = await ethereum.request( { method: 'net_version' } )
  //   // // appVar.chainId = 1337
    
  //   if( appVar.chainId != 5 ) {
  //     try {
  //       await window.ethereum.request({
  //         method: 'wallet_switchEthereumChain',
  //         params: [{ chainId: "0x5" }]
  //       });      
  //       appVar.chainId = await ethereum.request( { method: 'net_version' } )
  //     } catch( error ) {
  //       logMsg( "ERROR... Invalid Network" );
  //       console.log(error);
  //       return
  //     }
  //   }

  // } else {
  //   logMsg( "ERROR... No Metamask detected" );
  // }


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
        name: eip712Domain.name,
        version: eip712Domain.version,
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

    const eip712Signer = await apiCLH.SignerOCVote(
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

    const daoCLH = await InstantiateCLH( houseAddress, appVar.payeerWallet );

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

// Send (Sing & Validate) On/Off Chain Invitation acceptance
async function SendOCInvit( _onChain = false ) {
  try {
    const OCFunction = "OCInvit"
    $( "#iptSign"+OCFunction ).val( "" )
    $( "#iptSign"+OCFunction ).removeClass( "is-invalid" )
    $( "#iptSign"+OCFunction ).removeClass( "is-valid" )
    const w3 = await connectWeb3();

    if( 'undefined' === typeof $( 'input[name=iptAcceptOCInvit]:checked' ).val() )
      throw new Error( "Select Yes/No Acceptance" );
    const userAcceptance = !!+$( 'input[name=iptAcceptOCInvit]:checked' ).val()

    const houseAddress = await GetCLHAddress();
    console.log( "houseAddress: " , houseAddress );

    const apiCLH = await InstantiateCLHApi( addrApiCLH, w3.ethProvider );
    console.log( "apiCLH: " , apiCLH );

    const payeerWallet = await GetPayeer( w3.ethProvider, _onChain );
    console.log( "payeerWallet: " , payeerWallet );
    $("#txtPayeerWallet").val( payeerWallet.address ? payeerWallet.address : payeerWallet._address )

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
        name: eip712Domain.name,
        version: eip712Domain.version,
        chainId: w3.chainId,
        verifyingContract: houseAddress
      },
      message:{
        acceptance: userAcceptance
      }
    } );
    console.log( "msgParams: " , msgParams );

    const eip712Signature = _onChain ? "0x00" : await EIP712Sing( w3.signerWallet, msgParams );
    console.log( 'Signature: ' , eip712Signature );

    const eip712Signer = _onChain ? "0x00" : await apiCLH.SignerOCInvit(
      userAcceptance,
      houseAddress,
      eip712Signature
    ); 
    console.log( "Signer: " , eip712Signer );

    if ( !_onChain ) {
      $( "#iptSign"+OCFunction ).val( eip712Signature );
      if( eip712Signer != w3.signerWallet ){
        $( "#iptSign"+OCFunction ).addClass( "is-invalid" );
        logMsg( "Error... The signature can't be verified" )
        return
      }
      else
        $( "#iptSign"+OCFunction ).addClass( "is-valid" );
    }

    const daoCLH = await InstantiateCLH( houseAddress, payeerWallet );
    console.log( "daoCLH: ", daoCLH );

    const ethTx = await daoCLH.AcceptRejectInvitation(
      userAcceptance,
      eip712Signature
    );
    console.log( "ethTx", ethTx );
    logMsg( "Sended, Wait confirmation... " );
    let linkTx = jQuery('<a>')
    .attr(
      'href',
      'https://goerli.etherscan.io/tx/' + ethTx.hash
    )
    .attr('target',"_blank")
    .text( ethTx.hash );
    $( "#messages" ).append( linkTx )
    
    const resultTx = await ethTx.wait();
    console.log( "resultTx", resultTx );
    logMsg( "Successful!!!... " )
    linkTx = jQuery('<a>')
    .attr(
      'href',
      'https://goerli.etherscan.io/tx/' + resultTx.transactionHash
    )
    .attr('target',"_blank")
    .text( "View on block explorer" );
    $( "#messages" ).append( linkTx )
    // https://goerli.etherscan.io/tx/" + resultTx.transactionHash );
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
      name: eip712Domain.name,
      version: eip712Domain.version,
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

  apiCLH.ValidOCNewMember(
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