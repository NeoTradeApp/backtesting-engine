// const debounceWithBurst = (fn ,delay) => {
//   let timer;
//   let lastCall = 0;
//   let payload = [];

//   return (arr) => {
//     timer && clearTimeout(timer);
//     const now = Date.now();
//     payload.push(...arr);

//     if (now - lastCall >= delay) {
//       lastCall = now;
//       fn(payload);
//       payload = [];
//     } else {
//       timer = setTimeout(() => {
//         fn(payload);
//         payload = [];
//       }, delay);
//     }
//   };
// };

const debounceWithBurst = (fn ,delay) => {
  let timer;
  let lastCall = 0;
  let payload;

  return (payloadFn) => {
    timer && clearTimeout(timer);
    const now = Date.now();
    payload = payloadFn(payload);

    if (now - lastCall >= delay) {
      lastCall = now;
      fn(payload);
      payload = null;
    } else {
      timer = setTimeout(() => {
        fn(payload);
        payload = null;
      }, delay);
    }
  };
};

module.exports = { debounceWithBurst };
