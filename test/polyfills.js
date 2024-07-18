const raf = (global.requestAnimationFrame = (cb) => {
  setTimeout(cb, 16.667); // roughly emulating 60fps
});

// TODO (legacied import/no-default-export)
// This failure is legacied in and should be updated. DO NOT COPY.
// eslint-disable-next-line import/no-default-export
export default raf;
