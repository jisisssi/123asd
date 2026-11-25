// The radar's per-chain wallet setup card: a short, data-driven guide to preparing a farmer's wallet
// for the chains the board itself points at. Rendered inside the detail dialog under the farm plan,
// it answers the practical question every plan raises: what do I need installed and funded before the
// first step of this protocol's plan? Everything shown is derived from the row's own chains and TVL;
// no chain is special-cased and no text is hardcoded per protocol.
(function () {
  'use strict';

  // Rough onboarding cost and first-action gas per chain family, from the chain's name only.
  function chainProfile(chain) {
    var c = chain.toLowerCase();
    if (c.indexOf('ethereum') >= 0) return { bridge: 'a mainnet bridge or an exchange withdrawal', gas: '$8–$15 per action', note: 'keep at least $40 for gas across a 60-day hold' };
    if (c.indexOf('solana') >= 0) return { bridge: 'an exchange transfer of SOL', gas: 'under $0.05 per action', note: 'keep 0.5 SOL for rent and fees' };
    if (c.indexOf('arbitrum') >= 0 || c.indexOf('optimism') >= 0 || c.indexOf('base') >= 0 || c.indexOf('unichain') >= 0) return { bridge: 'the official L2 bridge', gas: '$0.20–$1 per action', note: 'bridge once, then act on the L2' };
    if (c.indexOf('polygon') >= 0 || c.indexOf('bnb') >= 0) return { bridge: 'an exchange transfer of the chain token', gas: '$0.05–$0.30 per action', note: 'keep $10 of the chain token for gas' };
    if (c.indexOf('tron') >= 0) return { bridge: 'an exchange transfer of TRX and USDT-TRC20', gas: 'about $1–$3 per USDT transfer', note: 'energy rental is cheaper than burning TRX' };
    return { bridge: 'the chain’s documented bridge or an exchange withdrawal', gas: 'check the chain’s current gas', note: 'fund the gas token before the first action' };
  }

  function build() {
    var DATA = window.RADAR;
    if (!DATA || !DATA.model) return;
    var dialog = document.getElementById('detail');
    if (!dialog || dialog.dataset.walletCard === 'done') return;
    // Rebuild on every open: app.js replaces the dialog's children when a row opens.
    var observer = new MutationObserver(function () {
      render(dialog, DATA);
    });
    observer.observe(dialog, { childList: true });
    dialog.dataset.walletCard = 'done';
  }

  function render(dialog, DATA) {
    var row = window.location.hash.match(/p=([^&]+)/);
    if (!row) return;
    var slug = decodeURIComponent(row[1]);
    var entry = DATA.rows.filter(function (r) { return r.slug === slug; })[0];
    var old = dialog.querySelector('.wallet-card');
    if (old) old.remove();
    if (!entry) return;
    var chains = (entry.chains && entry.chains.length ? entry.chains.slice(0, 3) : ['the chain it runs on']);
    var card = document.createElement('section');
    card.className = 'detail-section wallet-card';
    var h = document.createElement('h3');
    h.textContent = 'Wallet setup for ' + entry.name;
    card.appendChild(h);
    var intro = document.createElement('p');
    intro.className = 'sub';
    intro.textContent = 'What to have ready before this plan’s first step, from the chains ' + entry.name + ' actually runs on.';
    card.appendChild(intro);
    var list = document.createElement('ul');
    list.className = 'wallet-list';
    chains.forEach(function (chain) {
      var p = chainProfile(chain);
      var li = document.createElement('li');
      var b = document.createElement('b');
      b.textContent = chain + ': ';
      li.appendChild(b);
      li.appendChild(document.createTextNode(p.bridge + ' · ' + p.gas + ' · ' + p.note + '.'));
      list.appendChild(li);
    });
    card.appendChild(list);
    var dialogBody = dialog.querySelector('.detail-head') ? dialog : dialog;
    var last = dialogBody.lastElementChild;
    if (last) dialogBody.insertBefore(card, last.nextSibling);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', build);
  } else {
    build();
  }
})();
