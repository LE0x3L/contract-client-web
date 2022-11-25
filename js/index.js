(async function () {
  'use strict'

  feather.replace({ 'aria-hidden': 'true' })

  const w3 = await connectWeb3();
  console.log( w3 );
})()

ethereum.on( 'networkChanged', connectWeb3 );
ethereum.on( 'accountsChanged', connectWeb3 );

$("#lnkMetamask").click( (event) => {
  event.preventDefault();
  connectWeb3();
});

$("#btnSendOnChainNewCLH").click( () => { SendOCNewCLH( true ) } );
$("#btnSendOffChainNewCLH").click( () => { SendOCNewCLH( false ) } );

$("#btnSendOnChainInvit").click( () => { SendOCInvit( true ) } );
$("#btnSendOffChainInvit").click( () => { SendOCInvit( false ) } );

$("#btnSendOnChainNewUser").click( () => { SendOCNewUser( true ) } );
$("#btnSendOffChainNewUser").click( () => { SendOCNewUser( false ) } );

$("#btnSendOnChainDelUser").click( () => { SendOCDelUser( true ) } );
$("#btnSendOffChainDelUser").click( () => { SendOCDelUser( false ) } );

$("#btnSendOnChainReqJoin").click( () => { SendOCReqJoin( true ) } );
$("#btnSendOffChainReqJoin").click( () => { SendOCReqJoin( false ) } );

$("#btnSendOnChainVote").click( () => { SendOCVote( true ) } );
$("#btnSendOffChainVote").click( () => { SendOCVote( false ) } );

$("#btnSendOnChainBulkVote").click( () => { SendOCBulkVote( true ) } );

$("#btnGetInfoCLH").click( ShowCLHouseProperties );
$("#btnGetUserListCLH").click( ShowCLHouseUserList );
$("#btnGetProposalListCLH").click( ShowCLHouseProposalList );
$("#btnGetCLFCLHList").click( ShowCLFCLHList );
$("#btnGetInvitationListCLH").click( ShowCLHouseInvitationList );
$("#btnSendOnChainTxETH").click( safeSendETH );
$("#btnGetInfoCLB").click( ShowCLBeaconProperties );
$("#btnUpBeaconTo").click( SetNewCLBeacon );
