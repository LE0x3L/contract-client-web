(async function () {
  'use strict'

  feather.replace({ 'aria-hidden': 'true' })

  const w3 = await connectWeb3();
  console.log( w3 );
})()


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

$("#btnGetInfoCLH").click( ShowCLHouseProperties );
$("#btnGetUserListCLH").click( ShowCLHouseUserList );
$("#btnGetProposalListCLH").click( ShowCLHouseProposalList );
$("#btnGetCLFCLHList").click( ShowCLFCLHList );
$("#btnGetInvitationListCLH").click( ShowCLHouseInvitationList );
$("#btnSendOnChainTxETH").click( safeSendETH );
