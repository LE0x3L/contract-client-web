(function () {
  'use strict'

  feather.replace({ 'aria-hidden': 'true' })

})()

connectWeb3();

$('#eip712form').submit( (event) => {
  event.preventDefault();
  $('#divResValidate').empty()
  signDataV4();
});

$('#eip712result').submit( (event) => {
  event.preventDefault();
  SendSignVote();
});

$("#btnValidate").click( ()=> { ValidateSignVote() } );

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