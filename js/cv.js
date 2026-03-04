document.addEventListener("DOMContentLoaded", function () {
  const dateElement = document.getElementById("liveDate");

  if (dateElement) {
    const today = new Date().toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });

    dateElement.innerText = today;
  }
});