/* ══════════════════════════════════════════════════════
   Rizbi Islam Bio-Data — cv.js
   ══════════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* Print button */
  var btnPrint = document.getElementById('btn-print');
  if (btnPrint) {
    btnPrint.addEventListener('click', function () { window.print(); });
  }

  /* Auto-set today's date */
  var dateEl = document.getElementById('sig-date-display');
  if (dateEl) {
    var now = new Date();
    dateEl.textContent =
      String(now.getDate()).padStart(2,'0') + ' / ' +
      String(now.getMonth()+1).padStart(2,'0') + ' / ' +
      now.getFullYear();
  }

  /* Photo fallback */
  var photo    = document.getElementById('bio-photo');
  var fallback = document.getElementById('bio-photo-fallback');
  if (photo && fallback) {
    photo.addEventListener('error', function () {
      photo.style.display = 'none';
      fallback.style.display = 'flex';
    });
  }
})();
