// One more small radar helper: a "reset everything" control next to the board's filters, so a
// farmer who has searched, filtered and sorted can return to the full ranked board in one click.
// The starter page had no single reset; this is the page's own addition, driven by the same state
// object app.js owns, and it appears only when at least one filter is active.
(function () {
  'use strict';

  function active(state) {
    return state.q !== '' || state.category !== 'all' || state.minTvl > 0 || state.maxTvl !== Infinity;
  }

  // The reset button lives in the controls row; app.js re-renders the whole shell on every change,
  // so this observer re-mounts the button after each render, exactly like insights.js does.
  function tryMount() {
    var controls = document.querySelector('.controls');
    if (!controls || controls.querySelector('.reset-all')) return false;
    var app = document.querySelector('main#board');
    var state = null;
    // app.js keeps its state closure-private; the hash is the public projection of it, so the
    // reset clears the hash and asks the page to re-render by replaying the hashchange path.
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'button reset-all';
    btn.textContent = 'Reset filters';
    btn.addEventListener('click', function () {
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
      var search = document.getElementById('q');
      if (search) {
        search.value = '';
        search.dispatchEvent(new Event('input', { bubbles: true }));
      }
      var select = document.getElementById('category');
      if (select) {
        select.value = 'all';
        select.dispatchEvent(new Event('change', { bubbles: true }));
      }
      var minBox = document.getElementById('min-tvl');
      var maxBox = document.getElementById('max-tvl');
      if (minBox) { minBox.value = ''; minBox.dispatchEvent(new Event('change', { bubbles: true })); }
      if (maxBox) { maxBox.value = ''; maxBox.dispatchEvent(new Event('change', { bubbles: true })); }
    });
    controls.appendChild(btn);
    return true;
  }

  var target = document.getElementById('board');
  if (target) {
    new MutationObserver(function () { if (tryMount()) this.disconnect(); })
      .observe(target, { childList: true, subtree: true });
  }
})();
