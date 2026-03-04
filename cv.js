/* cv.js — Signature image upload for bio-data */
(function () {
  var fileInput  = document.getElementById('sig-file-input');
  var uploadArea = document.getElementById('sig-upload-area');
  var imgWrap    = document.getElementById('sig-img-wrap');
  var sigImg     = document.getElementById('sig-img');

  if (!fileInput || !uploadArea || !imgWrap || !sigImg) return;

  /* Click on the dashed placeholder → open file picker */
  uploadArea.addEventListener('click', function () {
    fileInput.click();
  });

  /* Drag-over highlight */
  uploadArea.addEventListener('dragover', function (e) {
    e.preventDefault();
    uploadArea.style.borderColor = '#15803d';
    uploadArea.style.background  = '#f0fdf4';
  });
  uploadArea.addEventListener('dragleave', function () {
    uploadArea.style.borderColor = '';
    uploadArea.style.background  = '';
  });

  /* Drop handler */
  uploadArea.addEventListener('drop', function (e) {
    e.preventDefault();
    var file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) loadImage(file);
  });

  /* Input change */
  fileInput.addEventListener('change', function () {
    if (fileInput.files[0]) loadImage(fileInput.files[0]);
  });

  function loadImage(file) {
    var reader = new FileReader();
    reader.onload = function (e) {
      sigImg.src       = e.target.result;
      uploadArea.style.display = 'none';
      imgWrap.style.display    = 'flex';
    };
    reader.readAsDataURL(file);
  }

  /* Click loaded image to re-upload */
  imgWrap.addEventListener('click', function () { fileInput.click(); });
  imgWrap.style.cursor = 'pointer';
  imgWrap.title        = 'Click to change signature image';
})();
