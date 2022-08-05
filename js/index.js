(function () {
  'use strict'

  feather.replace({ 'aria-hidden': 'true' })

})()

connectWeb3();

$("#lnkMetamask").click( (event) => {
  event.preventDefault();
  connectWeb3();
});

$('#eip712form').submit( (event) => {
  event.preventDefault();
  $('#divResValidate').empty()
  SignVoteEIP712();
});

$('#eip712result').submit( (event) => {
  event.preventDefault();
  SendSignVote();
});


$("#btnValidate").click( ()=> { ValidateSignVote() } );
$("#btnInvAcp").click( ()=> { SignInviEIP712( true ) } );
$("#btnInvRjc").click( ()=> { SignInviEIP712( false ) } );
$("#btnValiSignInvt").click( ()=> { ValiSignInvt() } );
$("#btnSendSignInvt").click( ()=> { SendSignInvt() } );

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