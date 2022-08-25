const addrApiCLH = "0x16eC1E0ad4e8b212cD3cC94152f19a52ec5FAa98"
const eip712Domain = {
  name: "CLHouse",
  version: "0.0.10",
}
// 0x5eebf3DD83E7d3Db3b81f8cBf57675b51c8b790F CLH
// 840bdb63e4e065597a3f5d5e5a3eed7b6b858400f2e262e83065bcec77049194 BRW#99

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
    console.log("===== " + OCFunction + ( _onChain?" On Chain":" Off Chain" ) + " =====" );
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
  } catch( error ) {
    console.log( error );
    ShowError( error );
  }
}

// Send (Sing & Validate) On/Off Chain Proposal to add new member
async function SendOCNewMember( _onChain = false ) {
  try {
    const OCFunction = "OCNewMember"
    console.log("===== " + OCFunction + ( _onChain?" On Chain":" Off Chain" ) + " =====" );
    $( "#iptSign"+OCFunction ).val( "" )
    $( "#iptSign"+OCFunction ).removeClass( "is-invalid" )
    $( "#iptSign"+OCFunction ).removeClass( "is-valid" )
    $( "#iptNewMmrAddr" ).removeClass( "is-invalid" )
    $( "#iptNewMmrName" ).removeClass( "is-invalid" )
    $( "#iptNewMmrDescrip" ).removeClass( "is-invalid" )
    $( "#iptNewMmrDelay" ).removeClass( "is-invalid" )

    const w3 = await connectWeb3();
    console.log( "w3: " , w3 );

    if( 42 !== $( "#iptNewMmrAddr" ).val().length  ) {
      $( "#iptNewMmrAddr" ).addClass( "is-invalid" );
      throw new Error( "Invalig Address length" );
    }
    const newUserWallet = await ethers.utils.getAddress( $( "#iptNewMmrAddr" ).val() )
    console.log( "newUserWallet:" , newUserWallet );

    if( 0 === $( "#iptNewMmrName" ).val().length  ) {
      $( "#iptNewMmrName" ).addClass( "is-invalid" );
      throw new Error( "Provide an User Name" );
    }
    const newUserName = $( "#iptNewMmrName" ).val()
    console.log( "newUserName:" , newUserName );

    if( 0 === $( "#iptNewMmrDescrip" ).val().length  ) {
      $( "#iptNewMmrDescrip" ).addClass( "is-invalid" );
      throw new Error( "Provide a proposal description" );
    }
    const newPropDescription = $( "#iptNewMmrDescrip" ).val()
    console.log( "newPropDescription:" , newPropDescription );

    if( 'undefined' === typeof $( 'input[name=iptNewMmrIsManager]:checked' ).val() )
      throw new Error( "Select Yes/No Is Manager" );
    const newUserIsManager = !!+$( 'input[name=iptNewMmrIsManager]:checked' ).val()
    console.log( "newUserIsManager:" , newUserIsManager );

    if( 0 === $( "#iptNewMmrDelay" ).val().length || isNaN( $( "#iptNewMmrDelay" ).val() ) ) {
      $( "#iptNewMmrDelay" ).addClass( "is-invalid" );
      throw new Error( "Provide a valid delay Time" );
    }
    const newPropDelayTime = +$( "#iptNewMmrDelay" ).val()
    console.log( "newPropDelayTime:" , newPropDelayTime );

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
        strOCNewMember:[
          {name:"walletAddr",type:"address"},
          {name:"name",type:"string"},
          {name:"description",type:"string"},
          {name:"isManager",type:"bool"},
          {name:"delayTime",type:"uint256"}
        ]
      },
      primaryType:"strOCNewMember",
      domain:{
        name: eip712Domain.name,
        version: eip712Domain.version,
        chainId: w3.chainId,
        verifyingContract: houseAddress
      },
      message:{
        walletAddr: newUserWallet,
        name: newUserName,
        description: newPropDescription,
        isManager: newUserIsManager,
        delayTime: newPropDelayTime
      }
    } );
    console.log( "msgParams:" , msgParams );

    const eip712Signature = _onChain ? "0x00" : await EIP712Sing( w3.signerWallet, msgParams );
    console.log( 'Signature: ' , eip712Signature );
    const eip712Signer = _onChain ? "0x00" : await apiCLH.SignerOCNewMember(
      newUserWallet,
      newUserName,
      newPropDescription,
      newUserIsManager,
      newPropDelayTime,
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

    const ethTx = await daoCLH.PropInviteMember(
      newUserWallet,
      newUserName,
      newPropDescription,
      newUserIsManager,
      newPropDelayTime,
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
  } catch( error ) {
    console.log( error );
    ShowError( error );
  }
}

// Send (Sing & Validate) On/Off Chain Proposal to remove a member
async function SendOCDelMember( _onChain = false ) {
  try {
    const OCFunction = "OCDelMember"
    console.log("===== " + OCFunction + ( _onChain?" On Chain":" Off Chain" ) + " =====" );
    $( "#iptSign"+OCFunction ).val( "" )
    $( "#iptSign"+OCFunction ).removeClass( "is-invalid" )
    $( "#iptSign"+OCFunction ).removeClass( "is-valid" )
    $( "#iptDelMmrAddr" ).removeClass( "is-invalid" )
    $( "#iptDelMmrDescrip" ).removeClass( "is-invalid" )
    $( "#iptDelMmrDelay" ).removeClass( "is-invalid" )

    const w3 = await connectWeb3();
    console.log( "w3: " , w3 );

    if( 42 !== $( "#iptDelMmrAddr" ).val().length  ) {
      $( "#iptDelMmrAddr" ).addClass( "is-invalid" );
      throw new Error( "Invalig Address length" );
    }
    const delUserWallet = await ethers.utils.getAddress( $( "#iptDelMmrAddr" ).val() )
    console.log( "delUserWallet:" , delUserWallet );

    if( 0 === $( "#iptDelMmrDescrip" ).val().length  ) {
      $( "#iptDelMmrDescrip" ).addClass( "is-invalid" );
      throw new Error( "Provide a proposal description" );
    }
    const propDescription = $( "#iptDelMmrDescrip" ).val()
    console.log( "propDescription:" , propDescription );

    if( 0 === $( "#iptDelMmrDelay" ).val().length || isNaN( $( "#iptDelMmrDelay" ).val() ) ) {
      $( "#iptDelMmrDelay" ).addClass( "is-invalid" );
      throw new Error( "Provide a valid delay Time" );
    }
    const propDelayTime = +$( "#iptDelMmrDelay" ).val()
    console.log( "propDelayTime:" , propDelayTime );

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
        strOCDelMember:[
          {name:"walletAddr",type:"address"},
          {name:"description",type:"string"},
          {name:"delayTime",type:"uint256"}
        ]
      },
      primaryType:"strOCDelMember",
      domain:{
        name: eip712Domain.name,
        version: eip712Domain.version,
        chainId: w3.chainId,
        verifyingContract: houseAddress
      },
      message:{
        walletAddr: delUserWallet,
        description: propDescription,
        delayTime: propDelayTime
      }
    } );
    console.log( "msgParams:" , msgParams );

    const eip712Signature = _onChain ? "0x00" : await EIP712Sing( w3.signerWallet, msgParams );
    console.log( 'Signature: ' , eip712Signature );
    const eip712Signer = _onChain ? "0x00" : await apiCLH.SignerOCDelMember(
      delUserWallet,
      propDescription,
      propDelayTime,
      houseAddress,
      eip712Signature
    ); 
    console.log( "Signer:" , eip712Signer );

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
    console.log( "daoCLH:", daoCLH );

    const ethTx = await daoCLH.PropRemoveMember(
      delUserWallet,
      propDescription,
      propDelayTime,
      eip712Signature
    );
    console.log( "ethTx", ethTx );
    logMsg( "Sended, Wait confirmation... " );
    let linkTx = 'https://goerli.etherscan.io/tx/' + ethTx.hash
    console.log( "linkTx:" , linkTx );
    linkTx = jQuery('<a>')
    .attr(
      'href',
      linkTx
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
  } catch( error ) {
    console.log( error );
    ShowError( error );
  }
}

// Send (Sing & Validate) On/Off Chain Proposal to Request to Join
async function SendOCReqJoin( _onChain = false ) {
  try {
    const OCFunction = "OCReqJoin"
    console.log("===== " + OCFunction + ( _onChain?" On Chain":" Off Chain" ) + " =====" );
    $( "#iptPropId"+OCFunction ).val( "" )
    $( "#iptSign"+OCFunction ).val( "" )
    $( "#iptSign"+OCFunction ).removeClass( "is-invalid" )
    $( "#iptSign"+OCFunction ).removeClass( "is-valid" )
    $( "#iptReqJoinName" ).removeClass( "is-invalid" )
    $( "#iptReqJoinDescrip" ).removeClass( "is-invalid" )

    const w3 = await connectWeb3();
    console.log( "w3: " , w3 );

    if( 0 === $( "#iptReqJoinName" ).val().length  ) {
      $( "#iptReqJoinName" ).addClass( "is-invalid" );
      throw new Error( "Provide an user Name" );
    }
    const reqUserName = $( "#iptReqJoinName" ).val()
    console.log( "reqUserName:" , reqUserName );

    if( 0 === $( "#iptReqJoinDescrip" ).val().length  ) {
      $( "#iptReqJoinDescrip" ).addClass( "is-invalid" );
      throw new Error( "Provide a proposal description" );
    }
    const propDescription = $( "#iptReqJoinDescrip" ).val()
    console.log( "propDescription:" , propDescription );

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
        strOCRequest:[
          {name:"name",type:"string"},
          {name:"description",type:"string"}
        ]
      },
      primaryType:"strOCRequest",
      domain:{
        name: eip712Domain.name,
        version: eip712Domain.version,
        chainId: w3.chainId,
        verifyingContract: houseAddress
      },
      message:{
        name: reqUserName,
        description: propDescription
      }
    } );
    console.log( "msgParams:" , msgParams );

    const eip712Signature = _onChain ? "0x00" : await EIP712Sing( w3.signerWallet, msgParams );
    console.log( 'Signature: ' , eip712Signature );
    const eip712Signer = _onChain ? "0x00" : await apiCLH.SignerOCRequest(
      reqUserName,
      propDescription,
      houseAddress,
      eip712Signature
    ); 
    console.log( "Signer:" , eip712Signer );

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
    console.log( "daoCLH:", daoCLH );

    const ethTx = await daoCLH.PropRequestToJoin(
      reqUserName,
      propDescription,
      eip712Signature
    );
    console.log( "ethTx", ethTx );
    logMsg( "Sended, Wait confirmation... " );
    let linkTx = 'https://goerli.etherscan.io/tx/' + ethTx.hash
    console.log( "linkTx:" , linkTx );
    linkTx = jQuery('<a>')
    .attr(
      'href',
      linkTx
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

    const propId = resultTx.events[0].args["propId"]
    console.log( "propId:" , propId );
    $( "#iptPropId"+OCFunction ).val( propId )
  } catch( error ) {
    console.log( error );
    ShowError( error );
  }
}