
import createStore from 'unistore';
import {dedupFrame} from './src/lib/decorators.js';

const g = createStore({
  mini: false,
  audioSuspended: false,

  orientation: null,

  hidden: false,

  status: '',  // '', paused, gameover

  sceneOrientation: null,
  sceneHasPause: false,

  score: {},
});

export default g;

const startup = (fn) => {
  const call = fn(g);
  call && call();
};

/**
 * Listen for changes in portrait/landscape mode.
 */
startup((global) => {
  const portraitMedia = window.matchMedia('(min-device-width: 1px) and (max-device-width: 600px) and (orientation: portrait)');
  const landscapeMedia = window.matchMedia('(min-device-height: 1px) and (max-device-height: 600px) and (orientation: landscape)');

  const update = () => {
    let orientation = null;
  
    if (portraitMedia.matches) {
      orientation = 'portrait';
    } else if (landscapeMedia.matches) {
      orientation = 'landscape';
    }
  
    global.setState({orientation});
  };

  const d = dedupFrame(update);
  portraitMedia.addEventListener('change', d);
  landscapeMedia.addEventListener('change', d);

  return update;
});

/**
 * Listen for global visibility changes.
 */
startup((global) => {
  const handler = () => {
    global.setState({hidden: document.hidden || false});
  };
  document.addEventListener('visibilitychange', handler);
  return handler;
});

/**
 * Listen for touch or mouse events to determine the input mode.
 */
startup((global) => {
  const pointerMedia = window.matchMedia('(any-pointer: fine)');  // mouse, but also stylus
  const hoverMedia = window.matchMedia('(any-hover: hover)');     // mouse, but also devices with a virtual pointer

  // TODO(samthor): If we see a gamepad, we should advertise it too, but this seems independent
  // from touch vs. mouse.

  const update = () => {
    // If the media queries don't match but we don't have the Touch constructor either, then
    // assume the user is using a mouse.
    const hasMouse = (pointerMedia.matches && hoverMedia.matches) || !window.Touch;
    global.setState({
      inputMode: hasMouse ? 'mouse' : 'touch',
    });
  };

  const d = dedupFrame(update);
  pointerMedia.addEventListener('change', d);
  hoverMedia.addEventListener('change', d);

  return update;
});