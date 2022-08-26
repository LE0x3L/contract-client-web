const addrApiCLH = "0x16eC1E0ad4e8b212cD3cC94152f19a52ec5FAa98"
const addrCLFactory = "0x8B7e0862AA2821ACA9ebBAdb1226eA07Ed89c1B0"
const eip712Domain = {
  name: "CLHouse",
  version: "0.0.10",
}
// 0x5eebf3DD83E7d3Db3b81f8cBf57675b51c8b790F CLH
// 840bdb63e4e065597a3f5d5e5a3eed7b6b858400f2e262e83065bcec77049194 BRW#99

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
    $( "#iptPropId"+OCFunction ).val( "" )
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

    const propId = resultTx.events[0].args["propId"]
    console.log( "propId:" , propId );
    $( "#iptPropId"+OCFunction ).val( propId )
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
    $( "#iptPropId"+OCFunction ).val( "" )
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
    $( "#messages" ).append( linkTx );

    const propId = resultTx.events[0].args["propId"]
    console.log( "propId:" , propId );
    $( "#iptPropId"+OCFunction ).val( propId )
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

// Send (Sing & Validate) On/Off Chain Vote to Proposal
async function SendOCVote( _onChain = false ) {
  try {
    const OCFunction = "OCVote"
    console.log("===== " + OCFunction + ( _onChain?" On Chain":" Off Chain" ) + " =====" );
    $( "#iptSign"+OCFunction ).val( "" )
    $( "#iptSign"+OCFunction ).removeClass( "is-invalid" )
    $( "#iptSign"+OCFunction ).removeClass( "is-valid" )
    $( "#txtJustOCVote" ).removeClass( "is-invalid" )
    $( "#iptPropIdOCVote" ).removeClass( "is-invalid" )

    const w3 = await connectWeb3();
    console.log( "w3:" , w3 );

    if( 'undefined' === typeof $( 'input[name=iptSupportOCVote]:checked' ).val() )
      throw new Error( "Select Accept/Reject Vote" );
    const voteSupport = !!+$( 'input[name=iptSupportOCVote]:checked' ).val()
    console.log( "voteSupport:" , voteSupport );

    if( 0 === $( "#txtJustOCVote" ).val().length  ) {
      $( "#txtJustOCVote" ).addClass( "is-invalid" );
      throw new Error( "Provide a Vote justification" );
    }
    const voteJustification = $( "#txtJustOCVote" ).val()
    console.log( "voteJustification:" , voteJustification );

    if( 0 === $( "#iptPropIdOCVote" ).val().length || isNaN( $( "#iptPropIdOCVote" ).val() ) ) {
      $( "#iptPropIdOCVote" ).addClass( "is-invalid" );
      throw new Error( "Provide a valid PropId" );
    }
    const votePropId = +$( "#iptPropIdOCVote" ).val()
    console.log( "votePropId:" , votePropId );

    const houseAddress = await GetCLHAddress();
    console.log( "houseAddress:" , houseAddress );

    const apiCLH = await InstantiateCLHApi( addrApiCLH, w3.ethProvider );
    console.log( "apiCLH: " , apiCLH );

    const payeerWallet = await GetPayeer( w3.ethProvider, _onChain );
    console.log( "payeerWallet:" , payeerWallet );
    $("#txtPayeerWallet").val( payeerWallet.address ? payeerWallet.address : payeerWallet._address )

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
        chainId: w3.chainId,
        verifyingContract: houseAddress
      },
      message:{
        propId: votePropId,
        support: voteSupport,
        justification: voteJustification
      }
    } );
    console.log( "msgParams:" , msgParams );


    const eip712Signature = _onChain ? "0x00" : await EIP712Sing( w3.signerWallet, msgParams );
    console.log( 'Signature:' , eip712Signature );
    const eip712Signer = _onChain ? "0x00" : await apiCLH.SignerOCVote(
      votePropId,
      voteSupport,
      voteJustification,
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

    const ethTx = await daoCLH.VoteProposal(
      votePropId,
      voteSupport,
      voteJustification,
      eip712Signature
    );
    console.log( "ethTx:", ethTx );
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

// Send (Sing & Validate) On/Off Chain Vote to Proposal
async function SendOCNewCLH( _onChain = false ) {
  try {
    const OCFunction = "OCNewCLH"
    console.log("===== " + OCFunction + ( _onChain?" On Chain":" Off Chain" ) + " =====" );
    $( "#iptAddr"+OCFunction ).val( "" )
    $( "#iptSign"+OCFunction ).val( "" )
    $( "#iptSign"+OCFunction ).removeClass( "is-invalid" )
    $( "#iptSign"+OCFunction ).removeClass( "is-valid" )
    $( "#iptNameNewCLH" ).removeClass( "is-invalid" )
    $( "#sltGovNewCLH" ).removeClass( "is-invalid" )
    $( "#iptMaxManagerNewCLH" ).removeClass( "is-invalid" )
    $( "#iptMaxMembersNewCLH" ).removeClass( "is-invalid" )
    $( "#iptApprovPercentNewCLH" ).removeClass( "is-invalid" )
    $( "#txtWhiteListNewCLH" ).removeClass( "is-invalid" )

    const w3 = await connectWeb3();
    console.log( "w3:" , w3 );

    if( 0 === $( "#iptNameNewCLH" ).val().length  ) {
      $( "#iptNameNewCLH" ).addClass( "is-invalid" );
      throw new Error( "Provide a House name" );
    }
    const newHouseName = $( "#iptNameNewCLH" ).val();
    console.log( "newHouseName:" , newHouseName );

    if( 'undefined' === typeof $( 'input[name=ipPrivateNewCLH]:checked' ).val() )
      throw new Error( "Select Private Yes/No" );
    const newHousePrivate = !!+$( 'input[name=ipPrivateNewCLH]:checked' ).val()
    console.log( "newHousePrivate:" , newHousePrivate );

    if( "0" === $('#sltGovNewCLH').find(":selected").val() ) {
      $( "#sltGovNewCLH" ).addClass( "is-invalid" );
      throw new Error( "Select a Governance type" );
    }
    console.log( "selectGov:" , $( "#sltGovNewCLH" ).val() );
    const newHouseGov = ethers.utils.id( $( "#sltGovNewCLH" ).val() )
    console.log( "newHouseGov:" , newHouseGov );

    if( 0 === $( "#iptMaxManagerNewCLH" ).val().length || isNaN( $( "#iptMaxManagerNewCLH" ).val() ) ) {
      $( "#iptMaxManagerNewCLH" ).addClass( "is-invalid" );
      throw new Error( "Provide a valid Max Manager number" );
    }
    const newHouseMaxManager = +$( "#iptMaxManagerNewCLH" ).val()
    console.log( "newHouseMaxManager:" , newHouseMaxManager );

    if( 0 === $( "#iptMaxMembersNewCLH" ).val().length || isNaN( $( "#iptMaxMembersNewCLH" ).val() ) ) {
      $( "#iptMaxMembersNewCLH" ).addClass( "is-invalid" );
      throw new Error( "Provide a valid Max member number" );
    }
    const newHouseMaxMembers = +$( "#iptMaxMembersNewCLH" ).val()
    console.log( "newHouseMaxMembers:" , newHouseMaxMembers );

    if( 0 === $( "#iptApprovPercentNewCLH" ).val().length || 
      isNaN( $( "#iptApprovPercentNewCLH" ).val() ) ||
      +$( "#iptApprovPercentNewCLH" ).val() > 100
    ) {
      $( "#iptApprovPercentNewCLH" ).addClass( "is-invalid" );
      throw new Error( "Provide a valid min Quorum Percentaje" );
    }
    const newHouseMinPercent = +$( "#iptApprovPercentNewCLH" ).val()
    console.log( "newHouseMinPercent:" , newHouseMinPercent );

    let newHouseWhiteList = [ ethers.constants.AddressZero ]
    if( 0 !== $( "#txtWhiteListNewCLH" ).val().length ){
      $( "#txtWhiteListNewCLH" ).addClass( "is-invalid" )
      newHouseWhiteList = $( "#txtWhiteListNewCLH" ).val().split( "\n" )
      newHouseWhiteList = newHouseWhiteList.map( ( v ) => { return ethers.utils.getAddress( v ) } )
      $( "#txtWhiteListNewCLH" ).removeClass( "is-invalid" )
    }
    console.log( "newHouseWhiteList: " , newHouseWhiteList );
    
    const factoryAddress = await ethers.utils.getAddress( addrCLFactory );;
    console.log( "factoryAddress:" , factoryAddress );

    const apiCLH = await InstantiateCLHApi( addrApiCLH, w3.ethProvider );
    console.log( "apiCLH: " , apiCLH );

    const payeerWallet = await GetPayeer( w3.ethProvider, _onChain );
    console.log( "payeerWallet:" , payeerWallet );
    $("#txtPayeerWallet").val( payeerWallet.address ? payeerWallet.address : payeerWallet._address )

    const msgParams = JSON.stringify( { types:
      {
        EIP712Domain:[
          {name:"name",type:"string"},
          {name:"version",type:"string"},
          {name:"chainId",type:"uint256"},
          {name:"verifyingContract",type:"address"}
        ],
        strOCNewCLH:[
          {name:"houseName", type:"string"},
          {name:"housePrivate",type:"bool"},
          {name:"gov",type:"bytes32"},
          {name:"govRuleMaxManagerMembers",type:"uint8"},
          {name:"govRuleMaxActiveMembers",type:"uint8"},
          {name:"govRuleApprovPercentage",type:"uint8"},
          {name:"whiteListWallets",type:"address"}
        ]
      },
      primaryType:"strOCNewCLH",
      domain:{
        name: eip712Domain.name,
        version: eip712Domain.version,
        chainId: w3.chainId,
        verifyingContract: factoryAddress
      },
      message:{
        houseName: newHouseName,
        housePrivate: newHousePrivate,
        gov: newHouseGov,
        govRuleMaxManagerMembers: newHouseMaxManager,
        govRuleMaxActiveMembers: newHouseMaxMembers,
        govRuleApprovPercentage: newHouseMinPercent,
        whiteListWallets: newHouseWhiteList[0]
      }
    } );
    console.log( "msgParams:" , msgParams );

    const eip712Signature = _onChain ? "0x00" : await EIP712Sing( w3.signerWallet, msgParams );
    console.log( 'Signature:' , eip712Signature );
    const eip712Signer = _onChain ? "0x00" : await apiCLH.SignerOCNewCLH(
      newHouseName,
      newHousePrivate,
      newHouseGov,
      newHouseMaxManager,
      newHouseMaxMembers,
      newHouseMinPercent,
      newHouseWhiteList[0],
      factoryAddress,
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

    const CLFactory = await InstantiateCLF( factoryAddress, payeerWallet );
    console.log( "CLFactory:", CLFactory );

    const ethTx = await CLFactory.CreateCLH(
      newHouseName,
      newHousePrivate,
      newHouseGov,
      [ newHouseMaxManager, newHouseMaxMembers, newHouseMinPercent ],
      newHouseWhiteList,
      ( _onChain ) ? ethers.constants.AddressZero : w3.signerWallet,
      eip712Signature
    );
    console.log( "ethTx:", ethTx );
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
    $( "#messages" ).append( linkTx );

    const AddrNewCLH = resultTx.events[3].args["houseAddr"]
    console.log( "AddrNewCLH:" , AddrNewCLH );
    $( "#iptAddr"+OCFunction ).val( AddrNewCLH );
  } catch( error ) {
    console.log( error );
    ShowError( error );
  }
}