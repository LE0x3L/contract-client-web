function logMsg( msg2log ) {
  console.log(msg2log);
  $( "#messages" ).text( msg2log );
}

function ShowError( error ) {
  console.trace();
  if ( undefined != error.error ){
    if ( undefined != error.error.data && undefined != error.error.data.message )
      logMsg( "ERROR... " + error.error.data.message );
    else if ( undefined != error.error.reason )
      logMsg( "ERROR... " + error.error.reason );
    else if ( undefined != error.error.message )
      logMsg( "ERROR... " + error.error.message );
    else
      logMsg( "ERROR... see console" );
  }
  else if( undefined != error.data && undefined != error.data.message )
    logMsg( "ERROR... " + error.data.message );
  else if( undefined != error.message )
    logMsg( "ERROR... " + error.message );
  else
    logMsg( "ERROR... see console" );
}

// https://docs.metamask.io/guide/rpc-api.html
function connectWeb3() {
  return new Promise( async ( resolve, reject ) => {
    try {
      $("#txtSignerWallet").val( "" )

      if ( typeof window.ethereum === 'undefined' )
        throw new Error( "No Metamask detected" );
      logMsg( "Connecting to MetaMask..." );

      const ethProvider = new ethers.providers.Web3Provider( window.ethereum )

      chainId = await ethereum.request( { method: 'net_version' } )
      console.log( "chainId:", chainId )

      if( 5 == chainId && true == testConfig ){
        appcfg = cfgGoerli_Test
        $("#blkChainName").text( "Net: Goerli TEST" )
      }
      else if( 5 == chainId ){
        appcfg = cfgGoerli
        $("#blkChainName").text( "Net: Goerli" )
      }
      else if( 80001 == chainId && true == testConfig ){
        appcfg = cfgMumbai_Test
        $("#blkChainName").text( "Net: Mumbai TEST" )
      }
      else if( 80001 == chainId ){
        appcfg = cfgMumbai
        $("#blkChainName").text( "Net: Mumbai" )
      }
      else {
        appcfg = cfgLocalNet
        $("#blkChainName").text( "Net: " + chainId )
        // await window.ethereum.request({
        //   method: 'wallet_switchEthereumChain',
        //   params: [{ chainId: appcfg.domEIP712IdChain }]
        // });
      }

      const signerWallet = await ethereum.request( { method: 'eth_requestAccounts' } )
      logMsg( "signerWallet: " + signerWallet[0] )
      $("#txtSignerWallet").val( signerWallet[0] )

      let blockTimestamp;
      await ethProvider.getBlockNumber()
      .then( async ( blkNumber ) => {
        console.log( 'getBlockNumber', blkNumber )
        $("#blkChainNumBlk").text( "Block #" + blkNumber )
        let blkChainTimeStamp = await ethProvider.getBlock( blkNumber )
        console.log( "blkChainTimeStamp", blkChainTimeStamp )
        blockTimestamp = blkChainTimeStamp.timestamp
        blkChainTimeStamp = new Date( 1000*blkChainTimeStamp.timestamp ).toUTCString()
        console.log( "blkChainTimeStamp", blkChainTimeStamp )
        $("#blkChainTimeStamp").text( blkChainTimeStamp )
      } )
      .catch( ( error ) => { console.log( 'getBlockNumber FAIL' , error ) } )

      resolve( { 
        "ethProvider" : ethProvider,
        "chainId" : +chainId,
        "signerWallet" : ethers.utils.getAddress( signerWallet[0] ),
        "timestamp": blockTimestamp
      })
    } catch( error ) {
      console.log( error );
      ShowError( error );
      reject( error );
    }
  });
}

function EIP712Sign( _signerWallet, _msgParams, _OCFunction ){
  return new Promise( ( resolve, reject ) => { 
    logMsg( "Signing..." );
    const params = [ _signerWallet, _msgParams ]
    const method = 'eth_signTypedData_v4'
    console.log( 'SIGN REQ ', method, ' params: ', _msgParams );

    ethereum
    .request( {
      method,
      params
    } )
    .then( ( eip712Signature ) => {
      logMsg( "Signature: " + eip712Signature );
      resolve( eip712Signature );
    } )
    .catch( ( error ) => {
      console.log( error );
      reject( { "message": error.message } );
    } );
  });
}

function GetCLHAddress() {
  return new Promise( ( resolve, reject ) => {
    try {
      $( "#txtAddrCLHouse" ).removeClass( "is-invalid" );
      resolve( ethers.utils.getAddress( $( "#txtAddrCLHouse" ).val() ) );
    } catch (error) {
      console.log(error);
      $('html, body').animate({ scrollTop: $("#txtAddrCLHouse").offset().top - 70}, 1500);
      $( "#txtAddrCLHouse" ).addClass( "is-invalid" );
      // logMsg( "ERROR... Invalid CLHouse address" );
      reject( { "message": "Invalid CLHouse address" } );
    }
  });
}

function GetPayeer( _ethProvider, _OnChain = false ) {
  return new Promise( ( resolve, reject ) => {
    try {
      $("#txtPayeerWallet").val( "" )
      $("#txtPayeerPKey").removeClass( "is-invalid" );
      if( _OnChain ) {
        resolve( _ethProvider.getSigner( window.ethereum.selectedAddress  ) );
      } else {
        if( !( $("#txtPayeerPKey").val().length == 66 || $("#txtPayeerPKey").val().length == 64 ) ) {
          $("#txtPayeerPKey").addClass( "is-invalid" );
          $('html, body').animate({ scrollTop: $("#txtPayeerPKey").offset().top - 70}, 1500);
          throw new Error( "Invalid length Private Key" );
        }

        resolve(
          new ethers.Wallet(
            $("#txtPayeerPKey").val(),
            _ethProvider
          )
        );
      }
    } catch ( error ) {
      console.log( error );
      reject( error );
    }
  });
}

function InstantiateCLC( _dataFile, _ContractAddress, _signerOrProvider ) {
  return new Promise( async ( resolve, reject ) => {
    try {
      const contractData = await $.getJSON( _dataFile );
      resolve( new ethers.Contract(
        _ContractAddress,
        contractData.abi,
        _signerOrProvider
      ) );
    } catch (error) {
      console.log(error);
      reject( { "message": "Can't instance ApiCLH" } );
    }
  });
}

function InstantiateCLH( _houseAddress, _signer ) {
  return new Promise( async ( resolve, reject ) => {
    try {
      const contractData = await $.getJSON( "./abis/CLHouse.json" );
      resolve( new ethers.Contract(
        _houseAddress,
        contractData.abi,
        _signer
      ) );
    } catch (error) {
      console.log(error);
      reject( { "message": "Can't instance DaoCLH" } );
    }
  });
}

function InstantiateCLHApi( _ApiAddress, _ethProvider ) {
  return new Promise( async ( resolve, reject ) => {
    try {
      const contractData = await $.getJSON( "./abis/CLHouseApi.json" );
      resolve( new ethers.Contract(
        _ApiAddress,
        contractData.abi,
        _ethProvider
      ) );
    } catch (error) {
      console.log(error);
      reject( { "message": "Can't instance ApiCLH" } );
    }
  });
}

function InstantiateCLF( _factoryAddress, _signer ) {
  return new Promise( async ( resolve, reject ) => {
    try {
      const contractData = await $.getJSON( "./abis/CLFactory.json" );
      resolve( new ethers.Contract(
        _factoryAddress,
        contractData.abi,
        _signer
      ) );
    } catch (error) {
      console.log(error);
      reject( { "message": "Can't instance CLF" } );
    }
  });
}

function InstantiateCLB( _Address, _signer ) {
  return new Promise( async ( resolve, reject ) => {
    try {
      const contractData = await $.getJSON( "./abis/CLBeacon.json" );
      resolve( new ethers.Contract(
        _Address,
        contractData.abi,
        _signer
      ) );
    } catch (error) {
      console.log(error);
      reject( { "message": "Can't instance CLB" } );
    }
  });
}

function BtnLoading( idBtn, txtBtn="Loading..." ) {
  let btnOldTxt = $( idBtn ).text()
  $( idBtn ).attr( 'oldText', btnOldTxt )
  $( idBtn ).attr( 'disabled', true )
  let spinHtml = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> '
  $( idBtn ).html( spinHtml + txtBtn )
}

function BtnNormal( idBtn ) {
  let btnOldTxt = $( idBtn ).attr( 'oldText' )
  $( idBtn ).attr( 'disabled', false )
  $( idBtn ).html( btnOldTxt )
}

function CreateOffchainTx( variables ){
  $.ajax({
    url: "https://devel-api.cryptoleague.org/graphql",
    contentType: "application/json",
    type: "POST",
    data: JSON.stringify({
      query: `mutation CreateOffchainTransaction($createOffchainTransactionOwnerId: String!, $method: String!, $input: JSON!) {
        createOffchainTransaction(ownerId: $createOffchainTransactionOwnerId, method: $method, input: $input) {
          id
          ownerId
          status
          info
          result
          createdAt
          updatedAt
        }
      }`,
      variables: variables
    }),
    success: GetOffchainTxInfo
  })
}

function GetOffchainTxInfo( result ) {
  console.log( result )
  let idTxOC = result.data.createOffchainTransaction ? result.data.createOffchainTransaction.id : result.data.getOffchainTransaction.id
  console.log( "id", idTxOC )
  $.ajax({
    url: "https://devel-api.cryptoleague.org/graphql",
    contentType: "application/json",
    type:'POST',
    data: JSON.stringify({
        query:`{getOffchainTransaction(transactionId: "${idTxOC}") {id info ownerId result status updatedAt createdAt} }`
    }),
    success: checkStatusOCTx
  });
}

function checkStatusOCTx( result ) {
  console.log( result )
  let statusOCTx = result.data.getOffchainTransaction.status
  // console.log( "statusOCTx", statusOCTx )
  logMsg( statusOCTx )
  if( statusOCTx == "CREATED" )
    GetOffchainTxInfo( result )
  else if( statusOCTx == "ERROR")
    logMsg( "ERROR: " + result.data.getOffchainTransaction.result.details )
  else if( statusOCTx == "PROCESSING" ) {
    // logMsg( "Sent, Waiting confirmation... " )
    linkTx = jQuery('<a>')
    .attr(
      'href',
      appcfg.urlExplorer + '/tx/' + result.data.getOffchainTransaction.result.transactionHash
    )
    .attr('target',"_blank")
    .text( "View on block explorer" );
    $( "#messages" ).append( linkTx )

    GetOffchainTxInfo( result )
  }
  else if( statusOCTx == "SUCCESS" ) {
    logMsg( "Successful!!!... " )
    linkTx = jQuery('<a>')
    .attr(
      'href',
      appcfg.urlExplorer + '/tx/' + result.data.getOffchainTransaction.result.transactionHash
    )
    .attr('target',"_blank")
    .text( "View on block explorer" );
    $( "#messages" ).append( linkTx )
  }
}