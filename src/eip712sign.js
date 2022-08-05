var appVar = {
  addrApiCLH: "0xBc3E3f9D718f5fDd020FC556f49060c82189E0bB",
  ethProvider: null,
  chainId: null,
  accounts: null,
  signer: null,
  acceptance: null
};


async function connectWeb3() {
  if (window.ethereum) {
    logMsg("Connecting...");
    appVar.ethProvider = new ethers.providers.Web3Provider(window.ethereum)
    appVar.chainId = await ethereum.request({ method: 'net_version' })

    // Ganache account to test
    appVar.signer = new ethers.Wallet( "6cbed15c793ce57650b9877cf6fa156fbef513c4e6134f022a85b1ffdd59b2a1", appVar.ethProvider )

    ethereum
    .request({ method: 'eth_requestAccounts' })
    .then( (resolve) => {
      appVar.accounts = resolve 
      logMsg('Connected Account: ' + appVar.accounts );
    })
    .catch((error) => {
      if (error.code === 4001) {
        // EIP-1193 userRejectedRequest error
        logMsg('Please connect to MetaMask.');
      } else {
        logMsg("ERROR: "+error.message);
      }
    });
  } else {
    logMsg("No Metamask detected");
  }
}

function SignVoteEIP712() {
  const { chainId, accounts } = appVar;
  const voter = ethers.utils.getAddress( accounts[0] );
  const verifyingContract = ethers.utils.getAddress( document.getElementById("addrContract").value );
  const propId = document.getElementById("propId").value;
  const support = $('input[name=support]:checked', '#eip712form').val();
  const justification = document.getElementById("justification").value;
  // const justification = String("acepto");

  $("form#eip712result :input").val("")
  $("form#eip712result :input").removeClass("is-invalid")
  $("form#eip712result :input").removeClass("is-valid")

  const msgParams = JSON.stringify({types:
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
    domain:{name:"CLHouse",version:"0.0.10",chainId:chainId,verifyingContract:verifyingContract},
    message:{
      voter: voter,
      propId: +propId,
      support: !!+support,
      justification: justification
    }
  })

  const from = voter;

  const params = [from, msgParams]
  console.dir(params)
  const method = 'eth_signTypedData_v4'
  console.log('CLICKED, SENDING PERSONAL SIGN REQ ', method, ' from', from, msgParams)

  web3 = new Web3(window.ethereum);

  web3.currentProvider.sendAsync({
    method,
    params,
    from,
  }, async function (err, result) {
    if (err) return console.dir(err)
    if (result.error) {
      alert(result.error.message)
    }
    if (result.error) return console.error('ERROR', result)

    console.log('TYPED SIGNED:' + JSON.stringify(result.result))

    //getting r s v from a signature
    const signature = result.result.substring(2);
    const r = "0x" + signature.substring(0, 64);
    const s = "0x" + signature.substring(64, 128);
    const v = parseInt(signature.substring(128, 130), 16);
    console.log("r:", r);
    console.log("s:", s);
    console.log("v:", v);
    $('#eip712Signature').val( result.result );
    $('#signR').val( r );
    $('#signS').val( s );
    $('#signV').val( v );
  }) 
}

async function SendSignVote() {
  logMsg("Sending ...");
  const voter = ethers.utils.getAddress( appVar.accounts[0] );
  const propId = +document.getElementById("propId").value;
  const support = !!+$('input[name=support]:checked', '#eip712form').val();
  const justification = document.getElementById("justification").value;
  const signR = document.getElementById("signR").value;
  const signS = document.getElementById("signS").value;
  const signV = document.getElementById("signV").value;

  const houseAddr = ethers.utils.getAddress( document.getElementById("addrContract").value );
  const contractData = await $.getJSON("./abis/CLHouse.json");

  // console.log(contractData);
  
  const daoCLH = new ethers.Contract( houseAddr, contractData.abi, appVar.signer );

  try {
    console.log( await daoCLH.arrProposals( propId ) );
  } catch (err) {
      logMsg("ERROR ... "+err.error.reason);
      // return
  }

  let responseTx;
  try {
    responseTx = await daoCLH.VotePropOffChain( voter, propId, support, justification, signR, signS, signV );
  } catch (err) {
      logMsg("ERROR ... "+err.error.reason);
      return
  }

  console.log( responseTx )
  logMsg("Wait confirmation ... https://goerli.etherscan.io/tx/"+responseTx.hash);

  const resultTx = await responseTx.wait();
  console.log( resultTx );
  logMsg("Successful!!! ... https://goerli.etherscan.io/tx/" + resultTx.transactionHash );
}

async function ValidateSignVote() {
  // $('#divMsgTx').empty()
  $("form#eip712result :input").removeClass("is-invalid")
  $("form#eip712result :input").removeClass("is-valid")

  const voter = ethers.utils.getAddress( appVar.accounts[0] );
  const propId = +document.getElementById("propId").value;
  const support = !!+$('input[name=support]:checked', '#eip712form').val();
  const justification = document.getElementById("justification").value;
  const eip712Signature = document.getElementById("eip712Signature").value;
  const houseAddr = ethers.utils.getAddress( document.getElementById("addrContract").value );
  const contractData = await $.getJSON("./abis/ApiCLHouse.json");
  // console.log(contractData);
  
  const apiCLH = new ethers.Contract( appVar.addrApiCLH, contractData.abi, appVar.ethProvider );

  const resVal = await apiCLH.ValidateSingOffChainVote( houseAddr, voter, propId, support, justification, eip712Signature)
  console.log(resVal);

  if ( resVal )
    $("form#eip712result :input").addClass("is-valid")
  else
    $("form#eip712result :input").addClass("is-invalid")
}

function SignInviEIP712( _acceptance ) {
  logMsg("signing...");
  const { chainId, accounts } = appVar;
  const signerWallet = ethers.utils.getAddress( accounts[0] );
  const verifyingContract = ethers.utils.getAddress( document.getElementById("adrCLHinv").value );

  appVar.acceptance = _acceptance;

  $("#signInvit").val("")
  $("#signInvit").removeClass("is-invalid")
  $("#signInvit").removeClass("is-valid")

  const msgParams = JSON.stringify({types:
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
    domain:{name:"CLHouse",version:"0.0.10",chainId:chainId,verifyingContract:verifyingContract},
    message:{
      signerWallet: signerWallet,
      acceptance: !!_acceptance
    }
  })

  const from = signerWallet;

  const params = [ from, msgParams ]
  console.dir( params )
  const method = 'eth_signTypedData_v4'
  console.log('CLICKED, SENDING PERSONAL SIGN REQ ', method, ' from', from, msgParams)

  appVar.ethProvider.send( method, params )
  .then( (resolve) => {
    logMsg('SIGNED: ' + resolve );
    $('#signInvit').val( resolve );
  })
  .catch((error) => {
    logMsg("ERROR: " + error.message );
  });
}

async function ValiSignInvt() {
  // $('#divMsgTx').empty()
  $("#signInvit").removeClass("is-invalid")
  $("#signInvit").removeClass("is-valid")

  const signerWallet = ethers.utils.getAddress( appVar.accounts[0] );
  const acceptance = !!appVar.acceptance
  const signInvit = document.getElementById("signInvit").value;
  const houseAddr = ethers.utils.getAddress( document.getElementById("adrCLHinv").value );
  const contractData = await $.getJSON("./abis/ApiCLHouse.json");
  // console.log(contractData);
  
  const apiCLH = new ethers.Contract( appVar.addrApiCLH, contractData.abi, appVar.ethProvider );

  const resVal = await apiCLH.ValiSignInvt( houseAddr, signerWallet, acceptance, signInvit )
  console.log(resVal);

  if ( resVal )
    $("#signInvit").addClass("is-valid")
  else
    $("#signInvit").addClass("is-invalid")
}

async function SendSignInvt() {
  logMsg("Sending ...");
  const signerWallet = ethers.utils.getAddress( appVar.accounts[0] );
  const acceptance = !!appVar.acceptance
  const signInvit = document.getElementById("signInvit").value;
  const houseAddr = ethers.utils.getAddress( document.getElementById("adrCLHinv").value );
  const contractData = await $.getJSON("./abis/CLHouse.json"); 
  const daoCLH = new ethers.Contract( houseAddr, contractData.abi, appVar.signer );

  let responseTx;

  try {
    responseTx = await daoCLH.AcceptRejectInvitation( acceptance, signerWallet, signInvit );
  } catch (err) {
      logMsg("ERROR ... "+err.error.reason);
      return
      // console.log(err); // prints ethers error message containing the json rpc response as it is (along with error stacks from node if sent)
  }

  console.log( responseTx )
  logMsg("Wait confirmation ... https://goerli.etherscan.io/tx/"+responseTx.hash);

  const resultTx = await responseTx.wait();
  console.log( resultTx );
  logMsg("Successful!!! ... Tx : " + resultTx.transactionHash );
}