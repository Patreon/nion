const raf = (global.requestAnimationFrame = cb => {
    setTimeout(cb, 16.667) // roughly emulating 60fps
})

export default raf
