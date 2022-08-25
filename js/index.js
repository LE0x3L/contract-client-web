(async function () {
  'use strict'

  feather.replace({ 'aria-hidden': 'true' })

  const w3 = await connectWeb3();
  console.log( w3 )

})()


$("#lnkMetamask").click( (event) => {
  event.preventDefault();
  connectWeb3();
});

$("#btnSendOnChainInvit").click( () => { SendOCInvit( true ) } );
$("#btnSendOffChainInvit").click( () => { SendOCInvit( false ) } );

$("#btnSendOnChainNewMember").click( () => { SendOCNewMember( true ) } );
$("#btnSendOffChainNewMember").click( () => { SendOCNewMember( false ) } );

$("#btnSendOnChainDelMember").click( () => { SendOCDelMember( true ) } );
$("#btnSendOffChainDelMember").click( () => { SendOCDelMember( false ) } );

$("#btnSendOnChainReqJoin").click( () => { SendOCReqJoin( true ) } );
$("#btnSendOffChainReqJoin").click( () => { SendOCReqJoin( false ) } );

// $("#btnSignOCVote").click( SVSOCVote );
// $("#btnValidOCVote").click( ValidOCVote );
// $("#btnSendOCVote").click( SendOCVote );

// $("#btnSignOCNewMember").click( SignOCNewMember );
// $("#btnValidOCNewMember").click( ValidOCNewMember );

// console.log( await connectWeb3() )
// connectWeb3();

// $("#btnValidate").click( ()=> {        
//   $.ajax({
//       url: "/notes/" + id,
//       type: "get", //Change this to post or put
//       dataType: "json",
//       contentType: "application/json",
//       success: function(data) {
//           $($("#updateForm")[0].update_id).val(data.id);
//           $($("#updateForm")[0].updatetitle).val(data.title);
//           $($("#updateForm")[0].updatedescription).val(data.description)
//       },
//   });
// }); 