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

      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: appcfg.domEIP712IdChain }]
      });

      chainId = await ethereum.request( { method: 'net_version' } )
      console.log( "chainId:", chainId )

      const signerWallet = await ethereum.request( { method: 'eth_requestAccounts' } )
      logMsg( "signerWallet: " + signerWallet[0] )
      $("#txtSignerWallet").val( signerWallet[0] )

      let blockTimestamp;
      await ethProvider.getBlockNumber()
      .then( async ( resolve ) => { 
        console.log( 'getBlockNumber', resolve )
        let lstTimeStamp = await ethProvider.getBlock( resolve ) 
        console.log( "lstTimeStamp", lstTimeStamp )
        blockTimestamp = lstTimeStamp.timestamp
        lstTimeStamp = new Date( 1000*lstTimeStamp.timestamp ).toUTCString()
        console.log( "lstTimeStamp", lstTimeStamp )
        $("#lstTimeStamp").text( lstTimeStamp )
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
      const contractData = await $.getJSON( "./abis/ApiCLHouse.json" );
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