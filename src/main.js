const covers = document.querySelectorAll('.cover');

covers.forEach(cover => {
  cover.addEventListener('click', () => {
    const groups = document.querySelectorAll('.group'); // tous les groupes
    groups.forEach(group => {
      group.classList.toggle('paused'); // on met en pause ou on reprend
    });
  });
});