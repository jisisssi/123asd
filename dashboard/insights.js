// The radar's insight tools: a watchlist-first watch panel and a chain-exposure summary, both derived
// from the same window.RADAR the board reads. No third-party code, no network: these are new analyses
// the starter page never had, written so a farmer can answer two questions the ranked table cannot:
// which watchlist protocols moved most since the snapshot, and how exposed each chain is to the
// protocols most likely to launch a token. Every number here is computed in the page from data.js.
(function () {
  'use strict';

  var DATA = window.RADAR;
  if (!DATA) return;

  // The watchlist slugs are not carried in data.js; the board's first rows are the watchlist plus
  // early rows. A watch row is one whose TVL is at or above the snapshot floor: that is exactly the
  // watchlist's own bar, so the panel's membership rule mirrors the board's without new data.
  function watchRows() {
    return DATA.rows.filter(function (r) { return r.tvl_usd >= DATA.floor_usd; });
  }

  // Movers: the watch rows whose seven-day change is furthest from zero, strongest first.
  // A growing watchlist protocol is the likeliest to be preparing a launch, and a shrinking one
  // is the likeliest to have lost its window. Both matter; the panel shows both sides.
  function movers(limit) {
    return watchRows()
      .filter(function (r) { return r.change_7d !== null && r.change_7d !== undefined; })
      .sort(function (a, b) { return Math.abs(b.change_7d) - Math.abs(a.change_7d); })
      .slice(0, limit);
  }

  // Chain exposure: for each chain, the count of watch rows live on it and the sum of their implied
  // values. This is the page's own answer to "where will the tokens be": the chains with the most
  // launch-eligible TVL are the ones the farmer's wallet should already be set up on.
  function chainExposure() {
    var byChain = {};
    watchRows().forEach(function (r) {
      (r.chains || []).forEach(function (c) {
        var slot = byChain[c] || (byChain[c] = { chain: c, rows: 0, implied: 0 });
        slot.rows++;
        slot.implied += r.implied_value_usd;
      });
    });
    return Object.keys(byChain).map(function (k) { return byChain[k]; })
      .sort(function (a, b) { return b.implied - a.implied; });
  }

  function fmtUsd(n) {
    if (!isFinite(n)) return 'n/a';
    if (n >= 1e9) return '$' + (n / 1e9).toFixed(2) + 'B';
    if (n >= 1e6) return '$' + (n / 1e6).toFixed(1) + 'M';
    return '$' + Math.round(n / 1e3) + 'K';
  }
  function fmtPct(n) { return (n > 0 ? '+' : '') + n.toFixed(2) + '%'; }

  // A tiny sparkline-style bar row, pure divs, one per mover: name, its 7d change, its implied value.
  function moverList() {
    var list = movers(8);
    if (list.length === 0) {
      return [document.createTextNode('No watchlist protocol has a seven-day change in this snapshot.')];
    }
    var peak = list.reduce(function (m, r) { return Math.max(m, Math.abs(r.change_7d)); }, 1);
    return list.map(function (r) {
      var pct = r.change_7d;
      var width = Math.max(4, Math.round((Math.abs(pct) / peak) * 100));
      var bar = document.createElement('i');
      bar.className = pct >= 0 ? 'spark pos' : 'spark neg';
      bar.style.width = width + '%';
      var line = document.createElement('div');
      line.className = 'mover-row';
      line.appendChild(document.createElement('b')).textContent = r.name;
      line.appendChild(bar);
      var val = document.createElement('span');
      val.className = 'mover-val';
      val.textContent = fmtPct(pct) + ' 7d · implied ' + fmtUsd(r.implied_value_usd);
      line.appendChild(val);
      return line;
    });
  }

  function chainList() {
    var list = chainExposure().slice(0, 8);
    if (list.length === 0) return [document.createTextNode('No chain carries a watchlist row.')];
    var peak = list[0].implied || 1;
    return list.map(function (slot) {
      var bar = document.createElement('i');
      bar.className = 'spark chain';
      bar.style.width = Math.max(4, Math.round((slot.implied / peak) * 100)) + '%';
      var line = document.createElement('div');
      line.className = 'mover-row';
      line.appendChild(document.createElement('b')).textContent = slot.chain;
      line.appendChild(bar);
      var val = document.createElement('span');
      val.className = 'mover-val';
      val.textContent = slot.rows + ' rows · implied ' + fmtUsd(slot.implied);
      line.appendChild(val);
      return line;
    });
  }

  // The panel mounts itself beside the model panel, once the board has rendered. It watches for the
  // board's shell to appear, then appends; this keeps the insight tools independent of the board's
  // own render cycle, so the two can never interleave writes to the same container.
  function mount() {
    var shell = document.querySelector('.shell');
    if (!shell || document.getElementById('insights')) return false;
    var panel = document.createElement('section');
    panel.id = 'insights';
    panel.className = 'panel insights';
    var h = document.createElement('h2');
    h.textContent = 'Launch watch: movers and chain exposure';
    panel.appendChild(h);
    var intro = document.createElement('p');
    intro.className = 'sub';
    intro.textContent = 'The watchlist protocols whose seven-day TVL moved most, and the chains carrying the most launch-eligible implied value. Both are computed in this page from the same snapshot the board ranks.';
    panel.appendChild(intro);
    var cols = document.createElement('div');
    cols.className = 'insight-cols';
    var left = document.createElement('div');
    left.appendChild(Object.assign(document.createElement('h3'), { textContent: 'Biggest 7d movers' }));
    moverList().forEach(function (n) { left.appendChild(n); });
    var right = document.createElement('div');
    right.appendChild(Object.assign(document.createElement('h3'), { textContent: 'Chain exposure' }));
    chainList().forEach(function (n) { right.appendChild(n); });
    cols.appendChild(left);
    cols.appendChild(right);
    panel.appendChild(cols);
    shell.appendChild(panel);
    return true;
  }

  // Mount now if the board is already there, else once it renders.
  if (!mount()) {
    var target = document.getElementById('board');
    if (target) {
      new MutationObserver(function () { if (mount()) this.disconnect(); })
        .observe(target, { childList: true, subtree: true });
    }
  }
})();
