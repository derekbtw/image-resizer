var $alert = $('#alert')
$alert.hide()

document.getElementById("file").onchange = function() {
  var reader = new FileReader()

  reader.onload = function(e) {
    // get loaded data and render thumbnail
    document.getElementById("image").src = e.target.result
  }

  // read the image file as a data url
  var file = this.files[0]
  if (file.type !== 'image/jpeg' && file.type !== 'image/png') {
    $alert.text('Please choose an image file.').show()
    return
  }

  $alert.hide()
  reader.readAsDataURL(file)
}