let dictGovModel = {};
dictGovModel[ String( ethers.utils.id( "__GOV_DICTATORSHIP__" ) ) ] = "Dictatorship";
dictGovModel[ String( ethers.utils.id( "__GOV_COMMITTEE__" ) ) ] = "Committee";
dictGovModel[ String( ethers.utils.id( "__GOV_SIMPLE_MAJORITY__" ) ) ] = "Simple Majority";
const proposalType = [ "new User", "remove User", "requestJoin", "changeGovRules", "transferEth", "transferERC20", "swapERC20", "sellERC20", "buyERC20" ]

if( 0 == $("#txtPayeerPKey").val().length )
  $("#txtPayeerPKey").val( appcfg.pKeyPayeer );

/** Send (Sign & Validate) On/Off Chain Invitation acceptance */
async function SendOCInvit( _onChain = false ) {
  BtnLoading( _onChain ? "#btnSendOnChainInvit" : "#btnSendOffChainInvit", "Sendind..." )
  try {
    const OCFunction = "OCInvit"
    console.log("===== " + OCFunction + ( _onChain?" On Chain":" Off Chain" ) + " =====" );
    $( "#iptSign"+OCFunction ).val( "" )
    $( "#iptSign"+OCFunction ).removeClass( "is-invalid" )
    $( "#iptSign"+OCFunction ).removeClass( "is-valid" )
    $( "#iptAccIvnNickname" ).removeClass( "is-invalid" )

    const w3 = await connectWeb3();

    if( 'undefined' === typeof $( 'input[name=iptAcceptOCInvit]:checked' ).val() )
      throw new Error( "Select Yes/No Acceptance" );
    const userAcceptance = !!+$( 'input[name=iptAcceptOCInvit]:checked' ).val()

    if( 0 === $( "#iptAccIvnNickname" ).val().length  ) {
      $( "#iptAccIvnNickname" ).addClass( "is-invalid" );
      throw new Error( "Provide a Nickname" );
    }
    const newNickame = $( "#iptAccIvnNickname" ).val()
    console.log( "newNickame:" , newNickame );

    const houseAddress = await GetCLHAddress();
    console.log( "houseAddress: " , houseAddress );

    const apiCLH = await InstantiateCLHApi( appcfg.addrApiCLH, w3.ethProvider );
    console.log( "apiCLH: " , apiCLH );

    const msgParams = JSON.stringify( { types:
      {
        EIP712Domain:[
          {name:"name",type:"string"},
          {name:"version",type:"string"},
          {name:"chainId",type:"uint256"},
          {name:"verifyingContract",type:"address"}
        ],
        strOCInvit:[
          {name:"acceptance",type:"bool"},
          {name:"nickname",type:"string"}
        ]
      },
      primaryType:"strOCInvit",
      domain:{
        name: appcfg.domEIP712Name,
        version: appcfg.domEIP712Version,
        chainId: appcfg.domEIP712IdChain,
        verifyingContract: houseAddress
      },
      message:{
        acceptance: userAcceptance,
        nickname: newNickame
      }
    } );
    console.log( "msgParams: " , msgParams );

    const eip712Signature = _onChain ? "0x00" : await EIP712Sign( w3.signerWallet, msgParams );
    console.log( 'Signature: ' , eip712Signature );

    const eip712Signer = _onChain ? "0x00" : await apiCLH.SignerOCInvit(
      userAcceptance,
      newNickame,
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

    if( !_onChain && ocBackEnd ) {
      variables = {
        "createOffchainTransactionOwnerId": w3.signerWallet,
        "method": `CLHouse.AcceptRejectInvitation`,
        "input": {
          "__houseAddress": houseAddress,
          "_acceptance": userAcceptance,
          "_signature": eip712Signature
        }
      }
      console.log( "variables:" , variables );
      CreateOffchainTx( variables );
    } else {
      const payeerWallet = await GetPayeer( w3.ethProvider, _onChain );
      console.log( "payeerWallet: " , payeerWallet );
      $("#txtPayeerWallet").val( payeerWallet.address ? payeerWallet.address : payeerWallet._address )

      const daoCLH = await InstantiateCLH( houseAddress, payeerWallet );
      console.log( "daoCLH: ", daoCLH );

      const ethTx = await daoCLH.AcceptRejectInvitation(
        userAcceptance,
        newNickame,
        eip712Signature
      );
      console.log( "ethTx", ethTx );
      logMsg( "Sent, Waiting confirmation... " );
      let linkTx = jQuery('<a>')
      .attr(
        'href',
        appcfg.urlExplorer + '/tx/' + ethTx.hash
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
        appcfg.urlExplorer + '/tx/' + resultTx.transactionHash
      )
      .attr('target',"_blank")
      .text( "View on block explorer" );
      $( "#messages" ).append( linkTx )
    }
  } catch( error ) {
    console.log( error );
    ShowError( error );
  }
  BtnNormal( _onChain ? "#btnSendOnChainInvit" : "#btnSendOffChainInvit" )
}

/** Send (Sign & Validate) On/Off Chain Proposal to add new User */
async function SendOCNewUser( _onChain = false ) {
  BtnLoading( _onChain ? "#btnSendOnChainNewUser" : "#btnSendOffChainNewUser", "Sendind..." )
  try {
    const OCFunction = "OCNewUser"
    console.log("===== " + OCFunction + ( _onChain?" On Chain":" Off Chain" ) + " =====" );
    $( "#iptPropId"+OCFunction ).val( "" )
    $( "#iptSign"+OCFunction ).val( "" )
    $( "#iptSign"+OCFunction ).removeClass( "is-invalid" )
    $( "#iptSign"+OCFunction ).removeClass( "is-valid" )
    $( "#iptNewUsrAddr" ).removeClass( "is-invalid" )
    $( "#iptNewUsrName" ).removeClass( "is-invalid" )
    $( "#iptNewUsrDescrip" ).removeClass( "is-invalid" )
    $( "#iptNewUsrDelay" ).removeClass( "is-invalid" )

    const w3 = await connectWeb3();
    console.log( "w3: " , w3 );

    if( 42 !== $( "#iptNewUsrAddr" ).val().length  ) {
      $( "#iptNewUsrAddr" ).addClass( "is-invalid" );
      throw new Error( "Invalig Address length" );
    }
    const newUserWallet = await ethers.utils.getAddress( $( "#iptNewUsrAddr" ).val() )
    console.log( "newUserWallet:" , newUserWallet );

    if( 0 === $( "#iptNewUsrName" ).val().length  ) {
      $( "#iptNewUsrName" ).addClass( "is-invalid" );
      throw new Error( "Provide an User Name" );
    }
    const newUserName = $( "#iptNewUsrName" ).val()
    console.log( "newUserName:" , newUserName );

    if( 0 === $( "#iptNewUsrDescrip" ).val().length  ) {
      $( "#iptNewUsrDescrip" ).addClass( "is-invalid" );
      throw new Error( "Provide a proposal description" );
    }
    const newPropDescription = $( "#iptNewUsrDescrip" ).val()
    console.log( "newPropDescription:" , newPropDescription );

    if( 'undefined' === typeof $( 'input[name=iptNewUsrIsManager]:checked' ).val() )
      throw new Error( "Select Yes/No Is Manager" );
    const newUserIsManager = !!+$( 'input[name=iptNewUsrIsManager]:checked' ).val()
    console.log( "newUserIsManager:" , newUserIsManager );

    if( 0 === $( "#iptNewUsrDelay" ).val().length || isNaN( $( "#iptNewUsrDelay" ).val() ) ) {
      $( "#iptNewUsrDelay" ).addClass( "is-invalid" );
      throw new Error( "Provide a valid delay Time" );
    }
    const newPropDelayTime = +$( "#iptNewUsrDelay" ).val()
    console.log( "newPropDelayTime:" , newPropDelayTime );

    const houseAddress = await GetCLHAddress();
    console.log( "houseAddress: " , houseAddress );

    const apiCLH = await InstantiateCLHApi( appcfg.addrApiCLH, w3.ethProvider );
    console.log( "apiCLH: " , apiCLH );

    const msgParams = JSON.stringify( { types:
      {
        EIP712Domain:[
          {name:"name",type:"string"},
          {name:"version",type:"string"},
          {name:"chainId",type:"uint256"},
          {name:"verifyingContract",type:"address"}
        ],
        strOCNewUser:[
          {name:"walletAddr",type:"address"},
          {name:"name",type:"string"},
          {name:"description",type:"string"},
          {name:"isManager",type:"bool"},
          {name:"delayTime",type:"uint256"}
        ]
      },
      primaryType:"strOCNewUser",
      domain:{
        name: appcfg.domEIP712Name,
        version: appcfg.domEIP712Version,
        chainId: appcfg.domEIP712IdChain,
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

    const eip712Signature = _onChain ? "0x00" : await EIP712Sign( w3.signerWallet, msgParams );
    console.log( 'Signature: ' , eip712Signature );
    const eip712Signer = _onChain ? "0x00" : await apiCLH.SignerOCInvitUser(
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

    if( !_onChain && ocBackEnd ) {
      variables = {
        "createOffchainTransactionOwnerId": w3.signerWallet,
        "method": `CLHouse.PropInvitUser`,
        "input": {
          "__houseAddress": houseAddress,
          "_walletAddr": newUserWallet,
          "_name": newUserName,
          "_description": newPropDescription,
          "_isManager": newUserIsManager,
          "_delayTime": newPropDelayTime,
          "_signature": eip712Signature
        }
      }
      console.log( "variables:" , variables );
      CreateOffchainTx( variables );
    } else {
      const payeerWallet = await GetPayeer( w3.ethProvider, _onChain );
      console.log( "payeerWallet: " , payeerWallet );
      $("#txtPayeerWallet").val( payeerWallet.address ? payeerWallet.address : payeerWallet._address )
    
      const daoCLH = await InstantiateCLH( houseAddress, payeerWallet );
      console.log( "daoCLH: ", daoCLH );

      const ethTx = await daoCLH.PropInvitUser(
        newUserWallet,
        newUserName,
        newPropDescription,
        newUserIsManager,
        newPropDelayTime,
        eip712Signature
      );
      console.log( "ethTx", ethTx );
      logMsg( "Sent, Waiting confirmation... " );
      let linkTx = jQuery('<a>')
      .attr(
        'href',
        appcfg.urlExplorer + '/tx/' + ethTx.hash
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
        appcfg.urlExplorer + '/tx/' + resultTx.transactionHash
      )
      .attr('target',"_blank")
      .text( "View on block explorer" );
      $( "#messages" ).append( linkTx )

      const propId = resultTx.events[0].args["propId"]
      console.log( "propId:" , propId );
      $( "#iptPropId"+OCFunction ).val( propId )
    }
  } catch( error ) {
    console.log( error );
    ShowError( error );
  }
  BtnNormal( _onChain ? "#btnSendOnChainNewUser" : "#btnSendOffChainNewUser" )
}

/** Send (Sign & Validate) On/Off Chain Proposal to remove a user */
async function SendOCDelUser( _onChain = false ) {
  BtnLoading( _onChain ? "#btnSendOnChainDelUser" : "#btnSendOffChainDelUser", "Sendind..." )
  try {
    const OCFunction = "OCDelUser"
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

    const apiCLH = await InstantiateCLHApi( appcfg.addrApiCLH, w3.ethProvider );
    console.log( "apiCLH: " , apiCLH );

    const msgParams = JSON.stringify( { types:
      {
        EIP712Domain:[
          {name:"name",type:"string"},
          {name:"version",type:"string"},
          {name:"chainId",type:"uint256"},
          {name:"verifyingContract",type:"address"}
        ],
        strOCDelUser:[
          {name:"walletAddr",type:"address"},
          {name:"description",type:"string"},
          {name:"delayTime",type:"uint256"}
        ]
      },
      primaryType:"strOCDelUser",
      domain:{
        name: appcfg.domEIP712Name,
        version: appcfg.domEIP712Version,
        chainId: appcfg.domEIP712IdChain,
        verifyingContract: houseAddress
      },
      message:{
        walletAddr: delUserWallet,
        description: propDescription,
        delayTime: propDelayTime
      }
    } );
    console.log( "msgParams:" , msgParams );

    const eip712Signature = _onChain ? "0x00" : await EIP712Sign( w3.signerWallet, msgParams );
    console.log( 'Signature: ' , eip712Signature );
    const eip712Signer = _onChain ? "0x00" : await apiCLH.SignerOCRemoveUser(
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

    if( !_onChain && ocBackEnd ) {
      variables = {
        "createOffchainTransactionOwnerId": w3.signerWallet,
        "method": `CLHouse.PropRemoveUser`,
        "input": {
          "__houseAddress": houseAddress,
          "_walletAddr": delUserWallet,
          "_description": propDescription,
          "_delayTime": propDelayTime,
          "_signature": eip712Signature
        }
      }
      console.log( "variables:" , variables );
      CreateOffchainTx( variables );
    } else {
      const payeerWallet = await GetPayeer( w3.ethProvider, _onChain );
      console.log( "payeerWallet: " , payeerWallet );
      $("#txtPayeerWallet").val( payeerWallet.address ? payeerWallet.address : payeerWallet._address )
  
      const daoCLH = await InstantiateCLH( houseAddress, payeerWallet );
      console.log( "daoCLH:", daoCLH );

      const ethTx = await daoCLH.PropRemoveUser(
        delUserWallet,
        propDescription,
        propDelayTime,
        eip712Signature
      );
      console.log( "ethTx", ethTx );
      logMsg( "Sent, Waiting confirmation... " );
      let linkTx = appcfg.urlExplorer + '/tx/' + ethTx.hash
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
        appcfg.urlExplorer + '/tx/' + resultTx.transactionHash
      )
      .attr('target',"_blank")
      .text( "View on block explorer" );
      $( "#messages" ).append( linkTx );

      const propId = resultTx.events[0].args["propId"]
      console.log( "propId:" , propId );
      $( "#iptPropId"+OCFunction ).val( propId )
    }
  } catch( error ) {
    console.log( error );
    ShowError( error );
  }
  BtnNormal( _onChain ? "#btnSendOnChainDelUser" : "#btnSendOffChainDelUser" )
}

/** Send (Sign & Validate) On/Off Chain Proposal to Request to Join */
async function SendOCReqJoin( _onChain = false ) {
  BtnLoading( _onChain ? "#btnSendOnChainReqJoin" : "#btnSendOffChainReqJoin", "Sendind..." )
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

    const apiCLH = await InstantiateCLHApi( appcfg.addrApiCLH, w3.ethProvider );
    console.log( "apiCLH: " , apiCLH );

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
        name: appcfg.domEIP712Name,
        version: appcfg.domEIP712Version,
        chainId: appcfg.domEIP712IdChain,
        verifyingContract: houseAddress
      },
      message:{
        name: reqUserName,
        description: propDescription
      }
    } );
    console.log( "msgParams:" , msgParams );

    const eip712Signature = _onChain ? "0x00" : await EIP712Sign( w3.signerWallet, msgParams );
    console.log( 'Signature: ' , eip712Signature );
    const eip712Signer = _onChain ? "0x00" : await apiCLH.SignerOCRequestToJoin(
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

    if( !_onChain && ocBackEnd ) {
      variables = {
        "createOffchainTransactionOwnerId": w3.signerWallet,
        "method": `CLHouse.PropRequestToJoin`,
        "input": {
          "__houseAddress": houseAddress,
          "_name": reqUserName,
          "_description": propDescription,
          "_signature": eip712Signature
        }
      }
      console.log( "variables:" , variables );
      CreateOffchainTx( variables );
    } else {
      const payeerWallet = await GetPayeer( w3.ethProvider, _onChain );
      console.log( "payeerWallet: " , payeerWallet );
      $("#txtPayeerWallet").val( payeerWallet.address ? payeerWallet.address : payeerWallet._address )
  
      const daoCLH = await InstantiateCLH( houseAddress, payeerWallet );
      console.log( "daoCLH:", daoCLH );

      const ethTx = await daoCLH.PropRequestToJoin(
        reqUserName,
        propDescription,
        w3.signerWallet,
        eip712Signature
      );
      console.log( "ethTx", ethTx );
      logMsg( "Sent, Waiting confirmation... " );
      let linkTx = appcfg.urlExplorer + '/tx/' + ethTx.hash
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
        appcfg.urlExplorer + '/tx/' + resultTx.transactionHash
      )
      .attr('target',"_blank")
      .text( "View on block explorer" );
      $( "#messages" ).append( linkTx )

      const propId = resultTx.events[0].args["propId"]
      console.log( "propId:" , propId );
      $( "#iptPropId"+OCFunction ).val( propId )
    }
  } catch( error ) {
    console.log( error );
    ShowError( error );
  }
  BtnNormal( _onChain ? "#btnSendOnChainReqJoin" : "#btnSendOffChainReqJoin" )
}

/**  Send (Sign & Validate) On/Off Chain Vote to Proposal */
async function SendOCVote( _onChain = false ) {
  BtnLoading( _onChain ? "#btnSendOnChainVote" : "#btnSendOffChainVote", "Sendind..." )
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

    const apiCLH = await InstantiateCLHApi( appcfg.addrApiCLH, w3.ethProvider );
    console.log( "apiCLH: " , apiCLH );

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
        name: appcfg.domEIP712Name,
        version: appcfg.domEIP712Version,
        chainId: appcfg.domEIP712IdChain,
        verifyingContract: houseAddress
      },
      message:{
        propId: votePropId,
        support: voteSupport,
        justification: voteJustification
      }
    } );
    console.log( "msgParams:" , msgParams );


    const eip712Signature = _onChain ? "0x00" : await EIP712Sign( w3.signerWallet, msgParams );
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

    if( !_onChain && ocBackEnd ) {
      variables = {
        "createOffchainTransactionOwnerId": w3.signerWallet,
        "method": `CLHouse.VoteProposal`,
        "input": {
          "__houseAddress": houseAddress,
          "_propId": votePropId,
          "_support": voteSupport,
          "_justification": voteJustification,
          "_signature": eip712Signature
        }
      }
      console.log( "variables:" , variables );
      CreateOffchainTx( variables );
    } else {
      const payeerWallet = await GetPayeer( w3.ethProvider, _onChain );
      console.log( "payeerWallet:" , payeerWallet );
      $("#txtPayeerWallet").val( payeerWallet.address ? payeerWallet.address : payeerWallet._address )
  
      const daoCLH = await InstantiateCLH( houseAddress, payeerWallet );
      console.log( "daoCLH:", daoCLH );

      const ethTx = await daoCLH.VoteProposal(
        votePropId,
        voteSupport,
        voteJustification,
        eip712Signature
      );
      console.log( "ethTx:", ethTx );
      logMsg( "Sent, Waiting confirmation... " );
      let linkTx = appcfg.urlExplorer + '/tx/' + ethTx.hash
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
        appcfg.urlExplorer + '/tx/' + resultTx.transactionHash
      )
      .attr('target',"_blank")
      .text( "View on block explorer" );
      $( "#messages" ).append( linkTx )
    }
  } catch( error ) {
    console.log( error );
    ShowError( error );
  }
  BtnNormal( _onChain ? "#btnSendOnChainVote" : "#btnSendOffChainVote" )

}

async function SendOCBulkVote( _onChain = false ) {
  BtnLoading( _onChain ? "#btnSendOnChainBulkVote" : "#btnSendOffChainBulkVote", "Sendind..." )
  try {
    const OCFunction = "OCBulkVote"
    console.log("===== " + OCFunction + ( _onChain?" On Chain":" Off Chain" ) + " =====" );
    $( "#iptSign"+OCFunction ).val( "" )
    $( "#iptSign"+OCFunction ).removeClass( "is-invalid" )
    $( "#iptSign"+OCFunction ).removeClass( "is-valid" )
    $( "#iptJustOCBulkVote" ).removeClass( "is-invalid" )
    $( "#iptPropIdsOCBulkVote" ).removeClass( "is-invalid" )

    const w3 = await connectWeb3();
    console.log( "w3:" , w3 );

    if( 'undefined' === typeof $( 'input[name=iptSupportOCBulkVote]:checked' ).val() )
      throw new Error( "Select Accept/Reject Vote" );
    const voteSupport = !!+$( 'input[name=iptSupportOCBulkVote]:checked' ).val()
    console.log( "voteSupport:" , voteSupport );

    if( 0 === $( "#iptJustOCBulkVote" ).val().length  ) {
      $( "#iptJustOCBulkVote" ).addClass( "is-invalid" );
      throw new Error( "Provide a Vote justification" );
    }
    const voteJustification = $( "#iptJustOCBulkVote" ).val()
    console.log( "voteJustification:" , voteJustification );


    $( "#iptPropIdsOCBulkVote" ).addClass( "is-invalid" );
    if( 0 === $( "#iptPropIdsOCBulkVote" ).val().length )
      throw new Error( "Provide a valid PropIds" );
    
    let bulkVotePropIds = $( "#iptPropIdsOCBulkVote" ).val().trim().split( " " )
    bulkVotePropIds = bulkVotePropIds.map( ( idp ) => { 
      if( isNaN( idp ) ) 
        throw new Error( "PropIds" )
      else 
        return +idp
    } )
    
    $( "#iptPropIdsOCBulkVote" ).removeClass( "is-invalid" )
    console.log( "bulkVotePropIds: " , bulkVotePropIds );

    const houseAddress = await GetCLHAddress();
    console.log( "houseAddress:" , houseAddress );

    const apiCLH = await InstantiateCLHApi( appcfg.addrApiCLH, w3.ethProvider );
    console.log( "apiCLH: " , apiCLH );

    const msgParams = JSON.stringify( { types:
      {
        EIP712Domain:[
          {name:"name",type:"string"},
          {name:"version",type:"string"},
          {name:"chainId",type:"uint256"},
          {name:"verifyingContract",type:"address"}
        ],
        strOCBulkVote:[
          {name:"propIds",type:"uint256[]"},
          {name:"support",type:"bool"},
          {name:"justification", type:"string"}
        ]
      },
      primaryType:"strOCBulkVote",
      domain:{
        name: appcfg.domEIP712Name,
        version: appcfg.domEIP712Version,
        chainId: appcfg.domEIP712IdChain,
        verifyingContract: houseAddress
      },
      message:{
        propIds: bulkVotePropIds,
        support: voteSupport,
        justification: voteJustification
      }
    } );
    console.log( "msgParams:" , msgParams );

    const eip712Signature = _onChain ? "0x00" : await EIP712Sign( w3.signerWallet, msgParams );
    console.log( 'Signature:' , eip712Signature );
    
    const eip712Signer = _onChain ? "0x00" : await apiCLH.SignerOCBulkVote(
      bulkVotePropIds,
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

    if( !_onChain && ocBackEnd ) {
      variables = {
        "createOffchainTransactionOwnerId": w3.signerWallet,
        "method": `CLHouse.bulkVote`,
        "input": {
          "__houseAddress": houseAddress,
          "_propIds": bulkVotePropIds,
          "_support": voteSupport,
          "_justification": voteJustification,
          "_signature": eip712Signature
        }
      }
      console.log( "variables:" , variables );
      CreateOffchainTx( variables );
    } else {
      const payeerWallet = await GetPayeer( w3.ethProvider, _onChain );
      console.log( "payeerWallet:" , payeerWallet );
      $("#txtPayeerWallet").val( payeerWallet.address ? payeerWallet.address : payeerWallet._address )

      const daoCLH = await InstantiateCLH( houseAddress, payeerWallet );
      console.log( "daoCLH:", daoCLH );

      const ethTx = await daoCLH.bulkVote(
        bulkVotePropIds,
        voteSupport,
        voteJustification,
        eip712Signature
      );
      console.log( "ethTx:", ethTx );
      logMsg( "Sent, Waiting confirmation... " );
      let linkTx = appcfg.urlExplorer + '/tx/' + ethTx.hash
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
        appcfg.urlExplorer + '/tx/' + resultTx.transactionHash
      )
      .attr('target',"_blank")
      .text( "View on block explorer" );
      $( "#messages" ).append( linkTx )
    }
  } catch( error ) {
    console.log( error );
    ShowError( error );
  }
  BtnNormal( _onChain ? "#btnSendOnChainBulkVote" : "#btnSendOffChainBulkVote" )

}

async function SendOCNewCLH( _onChain = false ) {
  BtnLoading( _onChain ? "#btnSendOnChainNewCLH" : "#btnSendOffChainNewCLH", "Sendind..." )
  try {
    const OCFunction = "OCNewCLH"
    console.log("===== " + OCFunction + ( _onChain?" On Chain":" Off Chain" ) + " =====" );
    $( "#iptAddr"+OCFunction ).val( "" )
    $( "#iptSign"+OCFunction ).val( "" )
    $( "#iptSign"+OCFunction ).removeClass( "is-invalid" )
    $( "#iptSign"+OCFunction ).removeClass( "is-valid" )
    $( "#iptNameNewCLH" ).removeClass( "is-invalid" )
    $( "#iptMaxUsersNewCLH" ).removeClass( "is-invalid" )
    $( "#iptWhiteListNFTNewCLH" ).removeClass( "is-invalid" )

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

    if( 'undefined' === typeof $( 'input[name=ipOpenNewCLH]:checked' ).val() )
      throw new Error( "Select Open Yes/No" );
    const newHouseOpen = !!+$( 'input[name=ipOpenNewCLH]:checked' ).val()
    console.log( "newHouseOpen:" , newHouseOpen );



    if( 0 === $( "#iptMaxUsersNewCLH" ).val().length || isNaN( $( "#iptMaxUsersNewCLH" ).val() ) || $( "#iptMaxUsersNewCLH" ).val() <= 0 ) {
      $( "#iptMaxUsersNewCLH" ).addClass( "is-invalid" );
      throw new Error( "Provide a valid Max user number" );
    }
    const newHouseMaxUsers = +$( "#iptMaxUsersNewCLH" ).val()
    console.log( "newHouseMaxUsers:" , newHouseMaxUsers );



    let newHouseNFTWhiteList = ethers.constants.AddressZero
    if( 0 !== $( "#iptWhiteListNFTNewCLH" ).val().length ){
      $( "#iptWhiteListNFTNewCLH" ).addClass( "is-invalid" )
      newHouseNFTWhiteList = await ethers.utils.getAddress( $( "#iptWhiteListNFTNewCLH" ).val() )
      $( "#iptWhiteListNFTNewCLH" ).removeClass( "is-invalid" )
    }
    console.log( "newHouseNFTWhiteList: " , newHouseNFTWhiteList );
    
    const factoryAddress = await ethers.utils.getAddress( appcfg.addrCLFactory );
    console.log( "factoryAddress:" , factoryAddress );

    const apiCLH = await InstantiateCLHApi( appcfg.addrApiCLH, w3.ethProvider );
    console.log( "apiCLH: " , apiCLH );


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
          {name:"houseOpen",type:"bool"},
          {name:"govRuleMaxUsers",type:"uint256"},
          {name:"whiteListNFT",type:"address"},
        ]
      },
      primaryType:"strOCNewCLH",
      domain:{
        name: appcfg.domEIP712Name,
        version: appcfg.domEIP712Version,
        chainId: appcfg.domEIP712IdChain,
        verifyingContract: factoryAddress
      },
      message:{
        houseName: newHouseName,
        housePrivate: newHousePrivate,
        houseOpen: newHouseOpen,
        govRuleMaxUsers: newHouseMaxUsers,
        whiteListNFT: newHouseNFTWhiteList
      }
    } );
    console.log( "msgParams:" , msgParams );

    const eip712Signature = _onChain ? "0x00" : await EIP712Sign( w3.signerWallet, msgParams );
    console.log( 'Signature:' , eip712Signature );
    
    const eip712Signer = _onChain ? "0x00" : await apiCLH.SignerOCNewCLH(
      newHouseName,
      newHousePrivate,
      newHouseOpen,
      newHouseMaxUsers,
      newHouseNFTWhiteList,
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

    if( !_onChain && ocBackEnd ) {
      variables = {
        "createOffchainTransactionOwnerId": w3.signerWallet,
        "method": `CLFactory.CreateCLH`,
        "input": {
          "_houseName": newHouseName,
          "_housePrivate": newHousePrivate,
          "_houseOpen": newHouseOpen,
          "_govRuleMaxUsers": [ newHouseMaxUsers, newHouseMaxManager, newHouseMinPercent ],
          "_ManagerWallets": newHouseWhiteList,
          "_gnosisSafe": newHouseSafe,
          "_signerWallet": w3.signerWallet,
          "_signature": eip712Signature
        }
      }
      console.log( "variables:" , variables );
      CreateOffchainTx( variables );
    } else {
      const payeerWallet = await GetPayeer( w3.ethProvider, _onChain );
      console.log( "payeerWallet:" , payeerWallet );
      $("#txtPayeerWallet").val( payeerWallet.address ? payeerWallet.address : payeerWallet._address )

      const CLFactory = await InstantiateCLF( factoryAddress, payeerWallet );
      console.log( "CLFactory:", CLFactory );

      const ethTx = await CLFactory.CreateCLH(
        newHouseName,
        newHousePrivate,
        newHouseOpen,
        newHouseMaxUsers,
        newHouseNFTWhiteList,
        ( _onChain ) ? ethers.constants.AddressZero : w3.signerWallet,
        eip712Signature
      );
      console.log( "ethTx:", ethTx );
      logMsg( "Sent, Waiting confirmation... " );
      let linkTx = appcfg.urlExplorer + '/tx/' + ethTx.hash
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
        appcfg.urlExplorer + '/tx/' + resultTx.transactionHash
      )
      .attr('target',"_blank")
      .text( "View on block explorer" );
      $( "#messages" ).append( linkTx );

      const AddrNewCLH = resultTx.events[4].args["houseAddr"]
      console.log( "AddrNewCLH:" , AddrNewCLH );
      $( "#iptAddr"+OCFunction ).val( AddrNewCLH );
    }
  } catch( error ) {
    console.log( error );
    ShowError( error );
  }
  BtnNormal( _onChain ? "#btnSendOnChainNewCLH" : "#btnSendOffChainNewCLH" )
}

async function ShowCLHouseProperties() {
  BtnLoading( "#btnGetInfoCLH" )
  try {
    $("[id^=clhPrp]").val( "" );
    $("#clhPrpSafeAddress").html("");

    const w3 = await connectWeb3();
    console.log( "w3:" , w3 );

    const houseAddress = await GetCLHAddress();
    console.log( "houseAddress:" , houseAddress );

    const daoCLH = await InstantiateCLH( houseAddress, w3.ethProvider );
    console.log( "daoCLH: " , daoCLH );

    const propertiesCLH = await daoCLH.HouseProperties(); 
    console.log( "propertiesCLH:" , propertiesCLH );

    $("#clhPrpName").val( propertiesCLH[0] );
    $("#clhPrpPrivate").val( propertiesCLH[1][0]?"Yes":"No" );
    $("#clhPrpOpen").val( propertiesCLH[1][1]?"Yes":"No" );
    $("#clhPrpUsers").val( propertiesCLH[2][0] );
    $("#clhPrpManagers").val( propertiesCLH[2][1] );
    $("#clhPrpMembers").val( propertiesCLH[2][0]-propertiesCLH[2][1] );
    $("#clhPrpGovModel").val( dictGovModel[ propertiesCLH[4] ] );
    $("#clhPrpGovMaxUsers").val( propertiesCLH[2][3] );
    $("#clhPrpGovMaxManagers").val( propertiesCLH[2][4] );
    $("#clhPrpGovMinApproval").val( propertiesCLH[2][2] );
    $("#clhPrpWhiteListNFT").val( propertiesCLH[3][5] );
  } catch( error ) {
    console.log( error );
    ShowError( error );    
  }
  BtnNormal( "#btnGetInfoCLH" );
}

async function ShowCLHouseUserList() {
  BtnLoading( "#btnGetUserListCLH" )
  try {
    $( "tbody", "#tblusrList").html( "" )

    const w3 = await connectWeb3();
    console.log( "w3:" , w3 );

    const houseAddress = await GetCLHAddress();
    console.log( "houseAddress:" , houseAddress );

    const daoCLH = await InstantiateCLH( houseAddress, w3.ethProvider );
    console.log( "daoCLH: " , daoCLH );

    const apiCLH = await InstantiateCLHApi( appcfg.addrApiCLH, w3.ethProvider );
    console.log( "apiCLH: " , apiCLH );

    const usersListCLH = await apiCLH.GetHouseUserList( houseAddress ); 
    console.log( "usersListCLH:" , usersListCLH );

    let tblusr = $( "tbody", "#tblusrList")

    for( var i = 0 ; i < usersListCLH.length ; i++ ) {
      let tbltr = $( '<tr>' )
      .append(
        $('<th>').attr( "scope", "col" ).text( usersListCLH[ i ].nickname )
      )
      .append(
        $('<td>').text( await daoCLH.arrUsers( usersListCLH[ i ].userID.toNumber() ) )
      )
      .append(
        $('<td>').text( usersListCLH[ i ].isManager?"Manager":"User" )
      )

      tblusr.append( tbltr )
    }
  } catch( error ) {
    console.log( error );
    ShowError( error );
  }
  BtnNormal( "#btnGetUserListCLH" );
}

/** Get and show Proposal list in the house */
async function ShowCLHouseProposalList() {
  BtnLoading( "#btnGetProposalListCLH" )
  try {
    $( "tbody", "#tblprpList").html( "" )

    const w3 = await connectWeb3();
    console.log( "w3:" , w3 );

    const houseAddress = await GetCLHAddress();
    console.log( "houseAddress:" , houseAddress );

    const daoCLH = await InstantiateCLH( houseAddress, w3.ethProvider );
    console.log( "daoCLH:", daoCLH );

    const proposalListCLH = await daoCLH.GetProposalList( ); 
    console.log( "proposalListCLH:" , proposalListCLH );

    let tblprp = $( "tbody", "#tblprpList")

    for( var i = 0 ; i < proposalListCLH.length ; i++ ) {
      let dateTime = new Date( 1000*proposalListCLH[ i ].deadline )

      let tbltr = $( '<tr>' )
      .append( $('<th>').attr( "scope", "col" ).text( i ) )
      .append( $('<td>').text( proposalListCLH[ i ].proponent ) )
      .append( $('<td>').text( proposalType[ proposalListCLH[ i ].typeProposal ] ) )
      .append( $('<td>').text( proposalListCLH[ i ].description ) )
      .append( $('<td>').text( proposalListCLH[ i ].numVotes ) )
      .append( $('<td>').text( proposalListCLH[ i ].numVotes - proposalListCLH[ i ].againstVotes ) )
      .append( $('<td>').text( proposalListCLH[ i ].againstVotes ) )
      .append( $('<td>').text( proposalListCLH[ i ].executed?"Yes":"No" ) )
      .append( $('<td>').text( dateTime.toUTCString() ) )
      
      tblprp.append( tbltr )
    }
  } catch( error ) {
    console.log( error );
    ShowError( error );    
  }
  BtnNormal( "#btnGetProposalListCLH" );
}

/** Get and show House list in the house */
async function ShowCLFCLHList() {
  BtnLoading( "#btnGetCLFCLHList" )
  try {
    $( "tbody", "#tblclfclhList").html( "" )

    const w3 = await connectWeb3();
    console.log( "w3:" , w3 );

    const factoryAddress = await ethers.utils.getAddress( appcfg.addrCLFactory );;
    console.log( "factoryAddress:" , factoryAddress );

    const payeerWallet = await GetPayeer( w3.ethProvider );
    console.log( "payeerWallet:" , payeerWallet );

    const CLFAPI = await InstantiateCLC( abiCLFApi, appcfg.addrApiCLF, w3.ethProvider );
    console.log( "CLFAPI:", CLFAPI );

    const clhList = await CLFAPI.GetHousesList( factoryAddress );
    console.log( "clhList:", clhList );

    let tblprp = $( "tbody", "#tblclfclhList")

    for( var i = 0 ; i < clhList.length ; i++ ) {
      let tbltr = $( '<tr>' )
      .append( $('<th>').attr( "scope", "col" ).text( i ) )
      .append( $('<td>').text( clhList[ i ] ) )
      
      tblprp.append( tbltr )
    }
  } catch( error ) {
    console.log( error );
    ShowError( error );    
  }
  BtnNormal( "#btnGetCLFCLHList" );
}

/** Get and show Invitation list in the house */
async function ShowCLHouseInvitationList() {
  BtnLoading( "#btnGetInvitationListCLH" )
  try {
    $( "tbody", "#tblinvList").html( "" )

    const w3 = await connectWeb3();
    console.log( "w3:" , w3 );

    const houseAddress = await GetCLHAddress();
    console.log( "houseAddress:" , houseAddress );

    const daoCLH = await InstantiateCLH( houseAddress, w3.ethProvider );
    console.log( "daoCLH:", daoCLH );

    const arrProposal = await daoCLH.GetProposalList();
    console.log( "arrProposal:" , arrProposal );

    const arrDataNewUser = await daoCLH.GetArrDataPropUser();
    console.log( "arrDataNewUser:" , arrDataNewUser );

    let tblprp = $( "tbody", "#tblinvList")

    for( var i = 0 ; i < arrDataNewUser.length ; i++ ) {
      let propId = await daoCLH.mapInvitationUser( arrDataNewUser[ i ].walletAddr );
      console.log( "propId:" , propId );

      if( 0 != propId ) {
        let dateTime = new Date( 1000*arrProposal[ propId ].deadline )
        
        let tbltr = $( '<tr>' )
        .append( $('<th>').attr( "scope", "col" ).text( propId ) )
        .append( $('<td>').text( arrDataNewUser[ i ].name ) )
        .append( $('<td>').text( arrDataNewUser[ i ].walletAddr ) )
        .append( $('<td>').text( arrDataNewUser[ i ].isManager?"Manager":"User" ) )
        .append( $('<td>').text( w3.timestamp > +arrProposal[ propId ].deadline?"Yes":"No" ) )
        .append( $('<td>').text( dateTime.toUTCString() ) );
        
        tblprp.append( tbltr )
      }
    }
  } catch( error ) {
    console.log( error );
    ShowError( error );    
  }
  BtnNormal( "#btnGetInvitationListCLH" );
}

async function safeSendETH() {
  $( "#iptToOCTxETH" ).removeClass( "is-invalid" )
  $( "#iptValueOCTxETH" ).removeClass( "is-invalid" )

  if( 42 !== $( "#iptToOCTxETH" ).val().length  ) {
    $( "#iptToOCTxETH" ).addClass( "is-invalid" );
    throw new Error( "Invalig Address length" );
  }
  const toWallet = await ethers.utils.getAddress( $( "#iptToOCTxETH" ).val() )
  console.log( "toWallet:" , toWallet );

  $( "#iptValueOCTxETH" ).val()
  if( 0 === $( "#iptValueOCTxETH" ).val().length ||
    isNaN( $( "#iptValueOCTxETH" ).val() ) ||
    +$( "#iptValueOCTxETH" ).val() < 100
  ) {
    $( "#iptValueOCTxETH" ).addClass( "is-invalid" );
    throw new Error( "Provide a valid value" );
  }
  const value2Tx = $( "#iptValueOCTxETH" ).val()

  const w3 = await connectWeb3();
  console.log( "w3:" , w3 );

  const houseAddress = await GetCLHAddress();
  console.log( "houseAddress:" , houseAddress );

  const daoCLH = await InstantiateCLH( houseAddress, w3.ethProvider );
  console.log( "daoCLH: " , daoCLH );

  const CLHSAFE = await daoCLH.CLHSAFE();
  console.log( "CLHSAFE:" , CLHSAFE );

  const payeerWallet = await GetPayeer( w3.ethProvider, true );
  console.log( "payeerWallet:" , payeerWallet );

  await gnosis.safeTx(
    CLHSAFE,
    toWallet,
    value2Tx,
    payeerWallet
  );
}

async function ShowCLBeaconProperties() {
  BtnLoading( "#btnGetInfoCLB" )
  try {
    $("[id^=clbPrp]").val( "" );
    $("#clbPrpImplementation").html("");

    const w3 = await connectWeb3();
    console.log( "w3:" , w3 );

    const CLBCLH = await InstantiateCLB( appcfg.addrCLHBeacon, w3.ethProvider );
    console.log( "CLBCLH: " , CLBCLH );

    const CLBAdmin = await CLBCLH.owner(); 
    console.log( "CLBAdmin:" , CLBAdmin );

    const CLBImplementation = await CLBCLH.implementation(); 
    console.log( "CLBImplementation:" , CLBImplementation );

    $("#clbPrpAdmin").val( CLBAdmin );
    $("#clbPrpImplementation").html( `<a target="_blank" href="https://goerli.etherscan.io/address/${CLBImplementation}#code">${CLBImplementation}</a>` );
  } catch( error ) {
    console.log( error );
    ShowError( error );    
  }
  BtnNormal( "#btnGetInfoCLB" );
}

async function SetNewCLBeacon() {
  BtnLoading( "#btnUpBeaconTo" )
  try {
    const newImplementation = await ethers.utils.getAddress( $( "#iptUpBeaconTo" ).val() );
    console.log( "newImplementation:" , newImplementation );
    
    const w3 = await connectWeb3();
    console.log( "w3:" , w3 );

    const payeerWallet = await GetPayeer( w3.ethProvider, true );
    console.log( "payeerWallet:", payeerWallet );
    $("#txtPayeerWallet").val( payeerWallet.address ? payeerWallet.address : payeerWallet._address )
    
    const CLBCLH = await InstantiateCLB( appcfg.addrCLHBeacon, payeerWallet );
    console.log( "CLBCLH:", CLBCLH );

    const ethTx = await CLBCLH.upgradeTo( newImplementation );
    console.log( "ethTx:", ethTx );
    logMsg( "Sent, Waiting confirmation... " );
    let linkTx = appcfg.urlExplorer + '/tx/' + ethTx.hash
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
      appcfg.urlExplorer + '/tx/' + resultTx.transactionHash
    )
    .attr('target',"_blank")
    .text( "View on block explorer" );
    $( "#messages" ).append( linkTx );
  } catch( error ) {
    console.log( error );
    ShowError( error );
  }
  BtnNormal( "#btnUpBeaconTo" );
}

async function CreateLock( _onChain = false ) {
  BtnLoading( _onChain ? "#btnNewLockOnChain" : "#btnNewLockOffChain", "Sendind..." )
  try {
    $("[id^=iptLockNew]").removeClass( "is-invalid" );
    $( "#iptLockNewAddress" ).val( "" )

    if( 0 === $( "#iptLockNewName" ).val().length  ) {
      $( "#iptLockNewName" ).addClass( "is-invalid" );
      throw new Error( "Provide a Lock name" );
    }
    const newLockName = $( "#iptLockNewName" ).val();
    console.log( "newLockName:" , newLockName );

    if( 0 === $( "#iptLockNewDuration" ).val().length || 
      isNaN( $( "#iptLockNewDuration" ).val() ) ||
      +$( "#iptLockNewDuration" ).val() <= 0
    ) {
      $( "#iptLockNewDuration" ).addClass( "is-invalid" );
      throw new Error( "Provide a valid membership duration" );
    }
    const newLockDuration = +$( "#iptLockNewDuration" ).val() * 60 * 60 * 24; /** days in seconds */
    console.log( "newLockDuration:" , newLockDuration );

    if( 0 === $( "#iptLockNewQuantity" ).val().length || 
      isNaN( $( "#iptLockNewQuantity" ).val() ) ||
      parseInt( $( "#iptLockNewQuantity" ).val() ) < 1
    ) {
      $( "#iptLockNewQuantity" ).addClass( "is-invalid" );
      throw new Error( "Provide a valid membership quantity" );
    }
    const newLockQuantity = parseInt( $( "#iptLockNewQuantity" ).val() )
    console.log( "newLockQuantity:" , newLockQuantity );
    
    if( 0 === $( "#iptLockNewPrice" ).val().length || 
      isNaN( $( "#iptLockNewPrice" ).val() ) ||
      +$( "#iptLockNewPrice" ).val() < 0.01
    ) {
      $( "#iptLockNewPrice" ).addClass( "is-invalid" );
      throw new Error( "Provide a valid membership price ( >= 0.01 ETH)" );
    }
    const newLockPrice = ethers.utils.parseUnits( $( "#iptLockNewPrice" ).val(), 18)
    console.log( "newLockPrice:" , newLockPrice );

    const houseAddress = await GetCLHAddress();
    console.log( "houseAddress:", houseAddress );

    const w3 = await connectWeb3();
    console.log( "w3:" , w3 );

    const apiCLH = await InstantiateCLHApi( appcfg.addrApiCLH, w3.ethProvider );
    console.log( "apiCLH: " , apiCLH );

    const msgParams = JSON.stringify( { types:
      {
        EIP712Domain:[
          {name:"name",type:"string"},
          {name:"version",type:"string"},
          {name:"chainId",type:"uint256"},
          {name:"verifyingContract",type:"address"}
        ],
        strOCNewLock:[
          {name:"expirationDuration",type:"uint256"},
          {name:"keyPrice",type:"uint256"},
          {name:"maxNumberOfKeys",type:"uint256"},
          {name:"lockName", type:"string"}
        ]
      },
      primaryType:"strOCNewLock",
      domain:{
        name: appcfg.domEIP712Name,
        version: appcfg.domEIP712Version,
        chainId: appcfg.domEIP712IdChain,
        verifyingContract: houseAddress
      },
      message:{
        expirationDuration: newLockDuration,
        keyPrice: newLockPrice.toString(),
        maxNumberOfKeys: newLockQuantity,
        lockName: newLockName
      }
    } );
    console.log( "msgParams:" , msgParams );

    const eip712Signature = _onChain ? "0x00" : await EIP712Sign( w3.signerWallet, msgParams );
    console.log( 'Signature:' , eip712Signature );

    const eip712Signer = _onChain ? "0x00" : await apiCLH.SignerOCNewLock(
      newLockDuration,
      newLockPrice,
      newLockQuantity,
      newLockName,
      houseAddress,
      eip712Signature
    );
    console.log( "Signer:" , eip712Signer );

    if ( !_onChain ) {
      $( "#iptLockNewSignature" ).val( eip712Signature );
      if( eip712Signer != w3.signerWallet ){
        $( "#iptLockNewSignature" ).addClass( "is-invalid" );
        logMsg( "Error... The signature can't be verified" )
        return
      }
      else
      $( "#iptLockNewSignature" ).addClass( "is-valid" );
    }

    const payeerWallet = await GetPayeer( w3.ethProvider, _onChain );
    console.log( "payeerWallet:", payeerWallet );
    $("#txtPayeerWallet").val( payeerWallet.address ? payeerWallet.address : payeerWallet._address )
    
    const daoCLH = await InstantiateCLH( houseAddress, payeerWallet );
    console.log( "daoCLH:", daoCLH );
    
    const ethTx = await daoCLH.CreateLock(
      newLockDuration, /** days in seconds */
      newLockPrice,
      newLockQuantity,
      newLockName,
      eip712Signature
    );
    console.log( "ethTx:", ethTx );

    logMsg( "Sent, Waiting confirmation... " );
    let linkTx = appcfg.urlExplorer + '/tx/' + ethTx.hash
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
      appcfg.urlExplorer + '/tx/' + resultTx.transactionHash
    )
    .attr('target',"_blank")
    .text( "View on block explorer" );
    $( "#messages" ).append( linkTx );

    const newLockAddress = resultTx.events[ 7 ].args[ "newLockAddress" ]
    console.log( "newLockAddress:", newLockAddress );
    $( "#iptLockNewAddress" ).val( newLockAddress )
  } catch( error ) {
    console.log( error );
    ShowError( error );    
  }
  BtnNormal( _onChain ? "#btnNewLockOnChain" : "#btnNewLockOffChain" )
}

async function SetWhiteListNFT( _onChain = true ) {
  BtnLoading( _onChain ? "#btnSetWhiteListNFTOnChain" : "#btnSetWhiteListNFTOffChain", "Sendind..." )
  try {
    const newCollection = await ethers.utils.getAddress( $( "#iptNewWhiteListNFT" ).val() );
    console.log( "newCollection:" , newCollection );

    const houseAddress = await GetCLHAddress();
    console.log( "houseAddress:", houseAddress );
    
    const w3 = await connectWeb3();
    console.log( "w3:", w3 );

    const payeerWallet = await GetPayeer( w3.ethProvider, true );
    console.log( "payeerWallet:", payeerWallet );
    $("#txtPayeerWallet").val( payeerWallet.address ? payeerWallet.address : payeerWallet._address )
    
    const daoCLH = await InstantiateCLH( houseAddress, payeerWallet );
    console.log( "daoCLH:", daoCLH );

    const ethTx = await daoCLH.SetWhitelistCollection( newCollection );
    console.log( "ethTx:", ethTx );

    logMsg( "Sent, Waiting confirmation... " );
    let linkTx = appcfg.urlExplorer + '/tx/' + ethTx.hash
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
      appcfg.urlExplorer + '/tx/' + resultTx.transactionHash
    )
    .attr('target',"_blank")
    .text( "View on block explorer" );
    $( "#messages" ).append( linkTx );
  } catch( error ) {
    console.log( error );
    ShowError( error );
  }
  BtnNormal( _onChain ? "#btnSetWhiteListNFTOnChain" : "#btnSetWhiteListNFTOffChain" )
}

async function ShowPropertiesLCK() {
  BtnLoading( "#btnGetInfoLCK" )
  try {
    $("[id^=iptLckPrp]").val( "" );
    $("[id^=iptLckUpg]").val( "" );

    const aLCK = await ethers.utils.getAddress( $( "#iptLockAddress" ).val() );
    console.log( "aLCK:" , aLCK );

    const w3 = await connectWeb3();
    console.log( "w3:" , w3 );

    const iLCK = await InstantiateCLC( "./abis/PublicLockV11.json", aLCK, w3.ethProvider );
    console.log( "iLCK:", iLCK );

    $("#iptLckPrpName").val( await iLCK.name() );
    $("#iptLckPrpSymbol").val( await iLCK.symbol() );
    $("#iptLckPrpDuration").val( (await iLCK.expirationDuration())/3600/24 );
    $("#iptLckPrpQuantity").val( await iLCK.maxNumberOfKeys() );
    $("#iptLckPrpPrice").val( (await iLCK.keyPrice())/1000000000000000000 );
  } catch( error ) {
    console.log( error );
    ShowError( error );    
  }
  BtnNormal( "#btnGetInfoLCK" );
}

async function SetNewLckName() {
  BtnLoading( "#btnUpgLckName", "Updating..." )
  try {
    $("[id^=iptLckUpg]").removeClass( "is-invalid" );

    const aLCK = await ethers.utils.getAddress( $( "#iptLockAddress" ).val() );
    console.log( "aLCK:" , aLCK );

    if( 0 === $( "#iptLckUpgName" ).val().length  ) {
      $( "#iptLckUpgName" ).addClass( "is-invalid" );
      throw new Error( "Provide a Lock name" );
    }
    const newLckName = $( "#iptLckUpgName" ).val();
    console.log( "newLckName:" , newLckName );

    const w3 = await connectWeb3();
    console.log( "w3:" , w3 );

    const payeerWallet = await GetPayeer( w3.ethProvider, true );
    console.log( "payeerWallet:", payeerWallet );
    $("#txtPayeerWallet").val( payeerWallet.address ? payeerWallet.address : payeerWallet._address )
    
    const iLCK = await InstantiateCLC( "./abis/PublicLockV11.json", aLCK, payeerWallet );
    console.log( "iLCK:", iLCK );

    const ethTx = await iLCK.updateLockName( newLckName );

    console.log( "ethTx:", ethTx );
    logMsg( "Sent, Waiting confirmation... " );
    let linkTx = appcfg.urlExplorer + '/tx/' + ethTx.hash
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
      appcfg.urlExplorer + '/tx/' + resultTx.transactionHash
    )
    .attr('target',"_blank")
    .text( "View on block explorer" );
    $( "#messages" ).append( linkTx );
    ShowPropertiesLCK();
  } catch( error ) {
    console.log( error );
    ShowError( error );
  }
  BtnNormal( "#btnUpgLckName" );
}

async function SetNewLckSymbol() {
  BtnLoading( "#btnUpgLckSymbol", "Updating..." )
  try {
    $("[id^=iptLckUpg]").removeClass( "is-invalid" );

    const aLCK = await ethers.utils.getAddress( $( "#iptLockAddress" ).val() );
    console.log( "aLCK:" , aLCK );

    if( 0 === $( "#iptLckUpgSymbol" ).val().length  ) {
      $( "#iptLckUpgSymbol" ).addClass( "is-invalid" );
      throw new Error( "Provide a Lock Symbol" );
    }
    const newLckSymbol = $( "#iptLckUpgSymbol" ).val();
    console.log( "newLckSymbol:" , newLckSymbol );

    const w3 = await connectWeb3();
    console.log( "w3:" , w3 );

    const payeerWallet = await GetPayeer( w3.ethProvider, true );
    console.log( "payeerWallet:", payeerWallet );
    $("#txtPayeerWallet").val( payeerWallet.address ? payeerWallet.address : payeerWallet._address )
    
    const iLCK = await InstantiateCLC( "./abis/PublicLockV11.json", aLCK, payeerWallet );
    console.log( "iLCK:", iLCK );

    const ethTx = await iLCK.updateLockSymbol( newLckSymbol );

    console.log( "ethTx:", ethTx );
    logMsg( "Sent, Waiting confirmation... " );
    let linkTx = appcfg.urlExplorer + '/tx/' + ethTx.hash
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
      appcfg.urlExplorer + '/tx/' + resultTx.transactionHash
    )
    .attr('target',"_blank")
    .text( "View on block explorer" );
    $( "#messages" ).append( linkTx );
    ShowPropertiesLCK();
  } catch( error ) {
    console.log( error );
    ShowError( error );
  }
  BtnNormal( "#btnUpgLckSymbol" );
}

async function SetNewLckDuration() {
  BtnLoading( "#btnUpgLckDuration", "Updating..." )
  try {
    $("[id^=iptLckUpg]").removeClass( "is-invalid" );

    const aLCK = await ethers.utils.getAddress( $( "#iptLockAddress" ).val() );
    console.log( "aLCK:" , aLCK );

    if( 0 === $( "#iptLckUpgDuration" ).val().length || 
      isNaN( $( "#iptLckUpgDuration" ).val() ) ||
      +$( "#iptLckUpgDuration" ).val() <= 0
    ) {
      $( "#iptLckUpgDuration" ).addClass( "is-invalid" );
      throw new Error( "Provide a valid membership duration" );
    }
    const newLckDuration = +$( "#iptLckUpgDuration" ).val()
    console.log( "newLckDuration:" , newLckDuration );

    const w3 = await connectWeb3();
    console.log( "w3:" , w3 );

    const payeerWallet = await GetPayeer( w3.ethProvider, true );
    console.log( "payeerWallet:", payeerWallet );
    $("#txtPayeerWallet").val( payeerWallet.address ? payeerWallet.address : payeerWallet._address )
    
    const iLCK = await InstantiateCLC( "./abis/PublicLockV11.json", aLCK, payeerWallet );
    console.log( "iLCK:", iLCK );

    const ethTx = await iLCK.setExpirationDuration( newLckDuration * 60 * 60 * 24 );

    console.log( "ethTx:", ethTx );
    logMsg( "Sent, Waiting confirmation... " );
    let linkTx = appcfg.urlExplorer + '/tx/' + ethTx.hash
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
      appcfg.urlExplorer + '/tx/' + resultTx.transactionHash
    )
    .attr('target',"_blank")
    .text( "View on block explorer" );
    $( "#messages" ).append( linkTx );
    ShowPropertiesLCK();
  } catch( error ) {
    console.log( error );
    ShowError( error );
  }
  BtnNormal( "#btnUpgLckDuration" );
}

async function SetNewLckQuantity() {
  BtnLoading( "#btnUpgLckQuantity", "Updating..." )
  try {
    $("[id^=iptLckUpg]").removeClass( "is-invalid" );

    const aLCK = await ethers.utils.getAddress( $( "#iptLockAddress" ).val() );
    console.log( "aLCK:" , aLCK );

    if( 0 === $( "#iptLckUpgQuantity" ).val().length || 
      isNaN( $( "#iptLckUpgQuantity" ).val() ) ||
      parseInt( $( "#iptLckUpgQuantity" ).val() ) < 1
    ) {
      $( "#iptLckUpgQuantity" ).addClass( "is-invalid" );
      throw new Error( "Provide a valid membership quantity" );
    }
    const newLckQuantity = parseInt( $( "#iptLckUpgQuantity" ).val() )
    console.log( "newLckQuantity:" , newLckQuantity );

    const w3 = await connectWeb3();
    console.log( "w3:" , w3 );

    const payeerWallet = await GetPayeer( w3.ethProvider, true );
    console.log( "payeerWallet:", payeerWallet );
    $("#txtPayeerWallet").val( payeerWallet.address ? payeerWallet.address : payeerWallet._address )
    
    const iLCK = await InstantiateCLC( "./abis/PublicLockV11.json", aLCK, payeerWallet );
    console.log( "iLCK:", iLCK );

    const ethTx = await iLCK.setMaxNumberOfKeys( newLckQuantity );

    console.log( "ethTx:", ethTx );
    logMsg( "Sent, Waiting confirmation... " );
    let linkTx = appcfg.urlExplorer + '/tx/' + ethTx.hash
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
      appcfg.urlExplorer + '/tx/' + resultTx.transactionHash
    )
    .attr('target',"_blank")
    .text( "View on block explorer" );
    $( "#messages" ).append( linkTx );
    ShowPropertiesLCK();
  } catch( error ) {
    console.log( error );
    ShowError( error );
  }
  BtnNormal( "#btnUpgLckQuantity" );
}

async function SetNewLckPrice() {
  BtnLoading( "#btnUpgLckPrice", "Updating..." )
  try {
    $("[id^=iptLckUpg]").removeClass( "is-invalid" );

    const aLCK = await ethers.utils.getAddress( $( "#iptLockAddress" ).val() );
    console.log( "aLCK:" , aLCK );

    if( 0 === $( "#iptLckUpgPrice" ).val().length || 
      isNaN( $( "#iptLckUpgPrice" ).val() ) ||
      +$( "#iptLckUpgPrice" ).val() < 0.01
    ) {
      $( "#iptLckUpgPrice" ).addClass( "is-invalid" );
      throw new Error( "Provide a valid membership price ( >= 0.01 ETH)" );
    }
    const newLckPrice = ethers.utils.parseUnits( $( "#iptLckUpgPrice" ).val(), 18)
    console.log( "newLckPrice:" , newLckPrice );

    const w3 = await connectWeb3();
    console.log( "w3:" , w3 );

    const payeerWallet = await GetPayeer( w3.ethProvider, true );
    console.log( "payeerWallet:", payeerWallet );
    $("#txtPayeerWallet").val( payeerWallet.address ? payeerWallet.address : payeerWallet._address )
    
    const iLCK = await InstantiateCLC( "./abis/PublicLockV11.json", aLCK, payeerWallet );
    console.log( "iLCK:", iLCK );

    const ethTx = await iLCK.updateKeyPricing( newLckPrice, ethers.constants.AddressZero );

    console.log( "ethTx:", ethTx );
    logMsg( "Sent, Waiting confirmation... " );
    let linkTx = appcfg.urlExplorer + '/tx/' + ethTx.hash
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
      appcfg.urlExplorer + '/tx/' + resultTx.transactionHash
    )
    .attr('target',"_blank")
    .text( "View on block explorer" );
    $( "#messages" ).append( linkTx );
    ShowPropertiesLCK();
  } catch( error ) {
    console.log( error );
    ShowError( error );
  }
  BtnNormal( "#btnUpgLckPrice" );
}