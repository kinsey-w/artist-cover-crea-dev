
import './style.css'

document.addEventListener('DOMContentLoaded', () => {
	const carousel = document.getElementById('carousel')
	if (!carousel) return

	const slidesContainer = carousel.querySelector('.slides')
	const slides = Array.from(carousel.querySelectorAll('.slide'))
	const prevBtn = carousel.querySelector('.control.prev')
	const nextBtn = carousel.querySelector('.control.next')
	const dotsContainer = carousel.querySelector('.dots')

	const total = slides.length
	let current = 0
	let interval = null

	// Build dots
	slides.forEach((_, i) => {
		const btn = document.createElement('button')
		btn.dataset.index = i
		if (i === 0) btn.classList.add('active')
		dotsContainer.appendChild(btn)
	})

	function update() {
		slidesContainer.style.transform = `translateX(-${current * 100}%)`
		const dots = dotsContainer.querySelectorAll('button')
		dots.forEach(d => d.classList.toggle('active', Number(d.dataset.index) === current))
	}

	function next() { current = (current + 1) % total; update() }
	function prev() { current = (current - 1 + total) % total; update() }

	nextBtn.addEventListener('click', () => { next(); resetAuto() })
	prevBtn.addEventListener('click', () => { prev(); resetAuto() })

	dotsContainer.addEventListener('click', (e) => {
		if (e.target.tagName !== 'BUTTON') return
		current = Number(e.target.dataset.index)
		update()
		resetAuto()
	})

	function startAuto() { interval = setInterval(next, 4000) }
	function stopAuto() { clearInterval(interval) }
	function resetAuto() { stopAuto(); startAuto() }

	carousel.addEventListener('mouseenter', stopAuto)
	carousel.addEventListener('mouseleave', resetAuto)

	document.addEventListener('keydown', (e) => {
		if (e.key === 'ArrowLeft') { prev(); resetAuto() }
		if (e.key === 'ArrowRight') { next(); resetAuto() }
	})

	update()
	startAuto()
})


