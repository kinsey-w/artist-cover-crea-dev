import './style.css'

const covers = document.querySelectorAll('.cover');

covers.forEach(cover => {
  cover.addEventListener('click', () => {
    const groups = document.querySelectorAll('.groupe'); // tous les groupes
    groups.forEach(group => {
      group.classList.toggle('paused'); // on met en pause ou on reprend
    });
  });
});

anime.timeline({loop: true})
  .add({
    targets: '.new .word',
    scale: [2,1],
    opacity: [0,1],
    easing: "easeOutCirc",
    duration: 2000,
    delay: (el, i) => 800 * i
  }).add({
    targets: '.new',
    opacity: 0,
    duration: 1000,
    easing: "easeOutExpo",
    delay: 100000
  });
  