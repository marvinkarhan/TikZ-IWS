const textarea = document.getElementById('tikz-code');
const output = document.getElementById('output-container');

function update() {
  const s = document.createElement('script');
  s.setAttribute('type', 'text/tikz');
  s.textContent = `${textarea.value}`;
  output.innerHTML = '';
  output.appendChild(s);
  process_tikz(s);
}

function debounce(fn, delay = 300) {
  let timeoutID;
  return (...args) => {
    if (timeoutID) clearTimeout(timeoutID);
    timeoutID = setTimeout(() => fn(...args), delay);
  };
}

textarea.addEventListener('keyup', () => {
  debounce(() => update())();
});
