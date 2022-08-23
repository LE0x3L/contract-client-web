function logMsg( msg2log ) {
  console.log(msg2log);
  $( "#messages" ).text( msg2log );
  console.trace();
}

function ShowError( error ) {
  if ( undefined != error.error ){
    if ( undefined != error.error.reason )
      logMsg( "ERROR... " + error.error.reason );
    else if ( undefined != error.error.message )
      logMsg( "ERROR... " + error.error.message );
    else
      logMsg( "ERROR... see console" );
  }
  else if( undefined != error.message )
    logMsg( "ERROR... " + error.message );
  else
    logMsg( "ERROR... see console" );
}

function EIP712Sing( msgParams, OCFunction ){
  return new Promise( ( resolve, reject ) => { 
    logMsg( "Signing "+OCFunction+"..." );

    $( "#iptSign"+OCFunction ).val( "" )
    $( "#iptSign"+OCFunction ).removeClass( "is-invalid" )
    $( "#iptSign"+OCFunction ).removeClass( "is-valid" )

    const params = [ appVar.signerWallet, msgParams ]
    const method = 'eth_signTypedData_v4'
    console.log( 'SIGN REQ ', method, ' params: ', msgParams );

    ethereum
    .request( {
      method,
      params
    } )
    .then( ( eip712Signature ) => {
      console.log( 'Signature: ' + eip712Signature );
      $( "#iptSign"+OCFunction ).val( eip712Signature );
      resolve( eip712Signature );
    } )
    .catch( ( error ) => {
      console.log( error );
      // logMsg( "ERROR... " + error.message );
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


function InstantiateOCCLH( houseAddress ) {
  return new Promise( async ( resolve, reject ) => {
    try {
      const contractData = await $.getJSON( "./abis/CLHouse.json" );
      resolve( new ethers.Contract(
        houseAddress,
        contractData.abi,
        appVar.payeerWallet
      ) );
    } catch (error) {
      console.log(error);
      reject( { "message": "Can't instance DaoCLH" } );
    }
  });
}

