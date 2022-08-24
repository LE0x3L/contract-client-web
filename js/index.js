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

$("#btnSignOCVote").click( SVSOCVote );
// $("#btnValidOCVote").click( ValidOCVote );
// $("#btnSendOCVote").click( SendOCVote );

$("#btnSendOnChainInvit").click( () => { SendOCInvit( true ) } );
$("#btnSendOffChainInvit").click( () => { SendOCInvit( false ) } );

$("#btnSignOCNewMember").click( SignOCNewMember );
$("#btnValidOCNewMember").click( ValidOCNewMember );

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