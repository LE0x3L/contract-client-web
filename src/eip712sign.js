var state = { ethProvider: null,  chainId: null, accounts: null, signer: null };


async function connectWeb3() {
  if (window.ethereum) {
    state.ethProvider = new ethers.providers.Web3Provider(window.ethereum)
    state.chainId = await ethereum.request({ method: 'net_version' })

    // Ganache accout to test
    state.signer = new ethers.Wallet( "6cbed15c793ce57650b9877cf6fa156fbef513c4e6134f022a85b1ffdd59b2a1", state.ethProvider )

    ethereum
    .request({ method: 'eth_requestAccounts' })
    .then( (resolve) => {
      state.accounts = resolve 
      logMsg('Connected to MetaMask: ' + state.accounts )
    })
    .catch((error) => {
      if (error.code === 4001) {
        // EIP-1193 userRejectedRequest error
        logMsg('Please connect to MetaMask.');
      } else {
        logMsg(error);
      }
    });
  } else {
    logMsg("No Metamask detected")
  }
}

function signDataV4() {
  const { chainId, accounts } = state;
  const voter = ethers.utils.getAddress( accounts[0] );
  const verifyingContract = ethers.utils.getAddress( document.getElementById("addrContract").value );
  const propId = document.getElementById("propId").value;
  const support = $('input[name=support]:checked', '#eip712form').val();
  const justification = document.getElementById("justification").value;
  // const justification = String("acepto");

  $('#signR').val( '' );
  $('#signS').val( '' );
  $('#signV').val( '' );

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
    $('#signR').val( r );
    $('#signS').val( s );
    $('#signV').val( v );
  }) 
}

async function SendSignVote() {
  const voter = ethers.utils.getAddress( accounts[0] );
  const propId = +document.getElementById("propId").value;
  const support = !!+$('input[name=support]:checked', '#eip712form').val();
  const justification = document.getElementById("justification").value;
  const signR = document.getElementById("signR").value;
  const signS = document.getElementById("signS").value;
  const signV = document.getElementById("signV").value;

  const contractAddress = ethers.utils.getAddress( document.getElementById("addrContract").value );
  const contractData = await $.getJSON("./abis/CLHouse.json");

  // console.log(contractData);
  
  const daoCLH = new ethers.Contract(contractAddress, contractData.abi, signer );

  $('#divMsgTx').empty()

  // const tokenBalance = await nftContractReadonly.balanceOf(signer.getAddress(),tokenId);

  // console.log( await daoCLH.HOUSE_NAME() );
  console.log( await daoCLH.arrProposals( propId ) );

  const responseTx = await daoCLH.VotePropOffChain( voter, propId, support, justification, signR, signS, signV );

  $('<p>',{
    html: 'Sending vote...'
  }).appendTo('#divMsgTx');

  const resultTx = await responseTx.wait();
  console.log( resultTx );

  $('<p>',{
    html: 'successful'
  }).appendTo('#divMsgTx');

  $('<a>',{
    text: 'See Tx',
    target: "_blank",
    href: 'https://rinkeby.etherscan.io/tx/' + resultTx.transactionHash,
    id: 'linkTx'
  }).appendTo('#divMsgTx');
}
