var acc = document.getElementsByClassName("transcript-trigger");
var i;

for (i = 0; i < acc.length; i++) {
  acc[i].addEventListener("click", function () {
    /* Toggle between adding and removing the "active" class,
    to highlight the button that controls the panel */
    this.classList.toggle("is-active");

    /* Toggle between hiding and showing the active panel */
      var panel = this.nextElementSibling;
      panel.classList.toggle("is-visible");
  });
}
