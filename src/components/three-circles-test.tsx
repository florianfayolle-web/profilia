"use client";

import { useEffect, useRef } from "react";

// Standalone test ("Agir, influencer, accepter"): everything runs in the
// browser and nothing is stored, so it stays free and account-free.
// The original vanilla script is mounted into a ref'd host element; the
// styles are scoped under .pf-card.
const STYLES = `.pf-card { --pf-ink: #1E1B3A; --pf-muted: #5E5A7D; --pf-line: #E7E3F6; --pf-g: #5B21B6; --pf-b: #BE185D; --pf-o: #B45309; --pf-y: #FFD54A; --pf-violet: #7C3AED; font-family: inherit; color: var(--pf-ink); line-height: 1.5; }
.pf-card * { box-sizing: border-box; }

  .pf-card {
    max-width: 640px; margin: 0 auto; background: #fff; border-radius: 28px;
    padding: 28px 22px 26px; box-shadow: 0 18px 50px rgba(30, 10, 80, .28);
  }
  @media (min-width: 640px) { .pf-card { padding: 38px 40px 34px; } }
  h1, h2, h3 { margin: 0; line-height: 1.2; }
  .pf-card h1 { font-size: clamp(28px, 6vw, 38px); font-weight: 700; }
  .pf-card h2 { font-size: clamp(20px, 4.6vw, 25px); font-weight: 700; }
  .pf-card h3 { font-size: 17px; font-weight: 700; }
  .pf-card [tabindex="-1"]:focus { outline: none; }
  .pf-card p { margin: 0; }
  .pf-center { text-align: center; }
  .pf-lead { color: var(--pf-muted); font-size: 16.5px; margin-top: 12px; }
  .pf-mini { display: block; margin: 0 auto 18px; width: 150px; height: 150px; }
  .pf-points { list-style: none; padding: 0; margin: 20px 0 0; display: grid; gap: 8px; }
  .pf-points li { display: flex; align-items: center; gap: 10px; font-weight: 500; font-size: 15.5px; }
  .pf-dot { width: 14px; height: 14px; border-radius: 50%; flex: none; }
  .pf-dot.g { background: linear-gradient(135deg, #9D6BFF, #4A1FB8); } .pf-dot.b { background: linear-gradient(135deg, #FF8AC4, #E0267F); } .pf-dot.o { background: linear-gradient(135deg, #FFD36B, #FF9F1C); }
  .pf-btn {
    font: inherit; font-weight: 700; font-size: 17px; cursor: pointer; border: 0;
    border-radius: 999px; padding: 15px 28px; background: var(--pf-y); color: var(--pf-ink);
    transition: transform .15s ease, box-shadow .15s ease;
  }
  .pf-btn:hover { transform: translateY(-1px); box-shadow: 0 8px 20px rgba(255, 213, 74, .5); }
  .pf-btn.block { display: block; width: 100%; margin-top: 26px; }
  .pf-btn.ghost { background: #F3EEFF; color: var(--pf-ink); }
  .pf-btn.ghost:hover { box-shadow: 0 8px 20px rgba(142, 45, 226, .18); }
  .pf-btn:focus-visible, .pf-opt:focus-visible, .pf-link:focus-visible {
    outline: 3px solid var(--pf-violet); outline-offset: 3px;
  }
  .pf-note { font-size: 13px; color: var(--pf-muted); margin-top: 14px; text-align: center; }
  .pf-progress-top { display: flex; justify-content: space-between; align-items: center; font-size: 14px; font-weight: 600; color: var(--pf-muted); }
  .pf-bar { height: 10px; border-radius: 999px; background: var(--pf-line); overflow: hidden; margin: 10px 0 24px; }
  .pf-bar > span { display: block; height: 100%; width: 0; border-radius: 999px; background: linear-gradient(90deg, #8E2DE2, #FF5E9C); transition: width .35s ease; }
  .pf-chip { display: inline-block; font-size: 13.5px; font-weight: 600; padding: 5px 13px; border-radius: 999px; margin-bottom: 12px; }
  .th-travail, .th-maison, .th-famille, .th-actu { background: #F1E8FF; color: #5B21B6; }
  .pf-hint { font-size: 14px; color: var(--pf-muted); margin-top: 10px; }
  .pf-opts { display: grid; gap: 12px; margin-top: 22px; }
  .pf-opt {
    font: inherit; font-size: 16.5px; font-weight: 500; text-align: left; cursor: pointer; color: var(--pf-ink);
    background: #fff; border: 2px solid var(--pf-line); border-radius: 18px; padding: 15px 18px;
    transition: border-color .15s ease, background .15s ease, transform .15s ease;
  }
  .pf-opt:hover { border-color: #B58CF0; background: #FAF7FF; }
  .pf-opt.sel { border-color: var(--pf-violet); background: #F1E8FF; }
  .pf-link { font: inherit; font-size: 14.5px; background: none; border: 0; color: var(--pf-muted); cursor: pointer; text-decoration: underline; padding: 6px 0; margin-top: 18px; }
  .pf-link[disabled] { visibility: hidden; }

  /* Résultat */
  .pf-kicker-intro { margin: 0 0 8px; }
  .pf-subtitle { font-size: 19px; font-weight: 600; color: var(--pf-violet); margin-top: 8px; }
  .pf-kicker { font-size: 13px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; color: var(--pf-violet); }
  .pf-circles { display: block; width: 250px; max-width: 76%; height: auto; margin: 20px auto 24px; overflow: visible; }
  .pf-circles .pf-c { transform-origin: 130px 130px; transform: scale(.12); opacity: 0; transition: transform .9s cubic-bezier(.2,.8,.2,1), opacity .5s ease; }
  .pf-circles .pf-c.c2 { transition-delay: .12s; } .pf-circles .pf-c.c1 { transition-delay: .24s; }
  .pf-circles.on .pf-c { transform: scale(1); opacity: 1; }
  .pf-circles text { font-family: inherit; font-weight: 700; font-size: 19px; text-anchor: middle; dominant-baseline: central; }
  .pf-rows { display: grid; gap: 14px; }
  .pf-row { display: flex; align-items: flex-start; gap: 12px; }
  .pf-row-dot { width: 18px; height: 18px; border-radius: 50%; flex: none; margin-top: 3px; }
  .pf-row-pct { align-self: center; }
  .pf-row-txt { flex: 1; min-width: 0; }
  .pf-row-title { font-weight: 700; font-size: 15.5px; }
  .pf-row-pct { font-weight: 700; font-size: 20px; }
  .pf-row-sub { font-size: 13.5px; color: var(--pf-muted); }
  .pf-profile { margin-top: 26px; padding: 20px; border-radius: 22px; background: #F7F2FF; }
  .pf-profile p { margin-top: 8px; font-size: 15.5px; }
  .pf-tips { margin: 14px 0 0; padding: 0; list-style: none; display: grid; gap: 10px; }
  .pf-tips li { display: flex; gap: 10px; font-size: 15px; }
  .pf-tips li::before { content: ""; flex: none; width: 10px; height: 10px; border-radius: 50%; background: var(--pf-violet); margin-top: 8px; }
  .pf-quote { margin-top: 22px; padding: 18px 20px; border-radius: 22px; background: linear-gradient(135deg, #FFF4D1, #FFE3EF); font-weight: 600; font-size: 15.5px; }
  .pf-quote small { display: block; font-weight: 500; color: var(--pf-muted); margin-top: 8px; font-size: 13.5px; }
  .pf-actions { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 24px; }
  .pf-actions .pf-btn { flex: 1 1 200px; font-size: 16px; padding: 14px 20px; }
  .pf-disclaimer { font-size: 12.5px; color: var(--pf-muted); margin-top: 18px; text-align: center; }
  .pf-sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
  @media (prefers-reduced-motion: reduce) {
    .pf-card * { transition: none !important; }
  }
`;

export function ThreeCirclesTest() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const host = ref.current;
    if (!host) return;
    const run = new Function("host", `"use strict";
  "use strict";

  var THEMES = {
    travail: "💼 Au travail", maison: "🏠 À la maison", famille: "👪 En famille", actu: "📰 Dans l'actu"
  };

  var QUESTIONS = [
    { th: "travail", q: "Lundi, 9 h 02. Ton manager t'écrit : « Tu as 5 minutes ? », sans un mot de plus. Ta première pensée :",
      a: [
        { c: 1, t: "« Je finis ce que j'avais commencé, on verra bien à l'appel. »" },
        { c: 2, t: "« Je lui réponds tout de suite pour savoir de quoi il s'agit. »" },
        { c: 3, t: "« Je cherche des indices dans son ton, l'heure, ses mots. »" },
        { c: 1, t: "« Je repasse mes dossiers pour être sûr(e) d'avoir fait ce qu'il fallait. »" } ] },
    { th: "maison", q: "Tu proposes à ton ou ta partenaire de parler de l'avenir. Réponse : « Pas ce soir. » Une heure plus tard, tu penses surtout à…",
      a: [
        { c: 1, t: "ce dont j'ai moi-même besoin pour avancer, avec ou sans cette discussion." },
        { c: 2, t: "la façon de remettre le sujet sur la table dans les prochains jours." },
        { c: 3, t: "ce que cache vraiment ce « pas ce soir »." },
        { c: 3, t: "ce que l'autre ressent sans oser le dire." } ] },
    { th: "famille", q: "Ta sœur t'annonce qu'elle quitte son CDI pour se lancer, sans vrai plan. Elle te demande ton avis. Ta première pensée :",
      a: [
        { c: 1, t: "« Moi, qu'est-ce que je ferais à sa place ? Et qu'est-ce que ça dit de mes envies ? »" },
        { c: 2, t: "« Je lui pose des questions pour l'aider à y voir plus clair. »" },
        { c: 3, t: "« Je vois déjà tout ce qui peut mal tourner. »" },
        { c: 2, t: "« Je lui propose de l'aider concrètement sur ce qui peut l'être. »" } ] },
    { th: "actu", q: "Une alerte info s'affiche sur ton téléphone : une nouvelle crise. Ton réflexe le plus naturel :",
      a: [
        { c: 1, t: "« Je referme et je reviens à ce que j'avais prévu aujourd'hui. »" },
        { c: 2, t: "« J'en parle à quelqu'un pour ne pas rester seul(e) avec ça. »" },
        { c: 3, t: "« Je lis tout ce que je trouve : j'ai besoin de savoir jusqu'où ça peut aller. »" },
        { c: 1, t: "« Je cherche ce que je peux faire à mon échelle, même petit. »" } ] },
    { th: "travail", q: "En réunion, on annonce que la promotion que tu visais revient à un collègue. Tu gardes le sourire. En sortant, tu penses surtout à…",
      a: [
        { c: 1, t: "ce que je veux vraiment pour la suite de mon parcours, ici ou ailleurs." },
        { c: 2, t: "la discussion que je vais demander à ma hiérarchie, avec des questions précises." },
        { c: 3, t: "ce qui a vraiment fait pencher la décision, et qui a pesé dans la balance." },
        { c: 2, t: "la façon de garder une relation simple et sincère avec mon collègue." } ] },
    { th: "maison", q: "Troisième soir de suite : la vaisselle du dîner attend dans l'évier. Tu rentres, fatigué(e). Ta première pensée :",
      a: [
        { c: 1, t: "« Je la fais maintenant, vite fait, pour ne plus y penser. »" },
        { c: 2, t: "« Ce week-end, on pose ça à plat et on se met d'accord sur un vrai système. »" },
        { c: 3, t: "« Pourquoi ça retombe toujours sur moi ? Ça ne change jamais. »" },
        { c: 3, t: "« Il ou elle ne se rend sans doute pas compte de ce que ça représente. »" } ] },
    { th: "famille", q: "Un de tes parents attend des résultats médicaux, réponse dans 48 heures. D'ici là, ton énergie va surtout vers…",
      a: [
        { c: 1, t: "ma propre routine : manger, dormir, tenir le coup." },
        { c: 2, t: "lui : l'appeler, passer, rester près de lui." },
        { c: 3, t: "les scénarios possibles, pour être prêt(e) à tout." },
        { c: 1, t: "ce que j'ai à faire de mon côté pour être disponible le moment venu." } ] },
    { th: "actu", q: "Une réforme annoncée à la télévision va peser sur ton budget. Autour de toi, les débats s'enflamment. Tu penses surtout à…",
      a: [
        { c: 1, t: "ce que je peux ajuster dans mes dépenses dès ce mois-ci." },
        { c: 2, t: "la manière d'en discuter avec mes proches et d'agir à plusieurs." },
        { c: 3, t: "ce que le gouvernement va décider ensuite, et ce que ça donnera dans un an." },
        { c: 2, t: "la façon de peser, même un peu : signer, voter, soutenir un collectif." } ] },
    { th: "travail", q: "Tu as passé trois semaines sur un projet. Au bilan, personne n'en dit un mot. Ta première pensée :",
      a: [
        { c: 1, t: "« Je sais ce que j'y ai mis, et ce que j'en retire pour la suite. »" },
        { c: 2, t: "« J'en reparlerai moi-même la semaine prochaine, sans attendre qu'on me le demande. »" },
        { c: 3, t: "« Est-ce qu'ils s'en sont seulement rendu compte, ou est-ce qu'ils s'en moquent ? »" },
        { c: 3, t: "« Je repense à qui a pris la parole, et à qui a été remercié. »" } ] },
    { th: "famille", q: "Un souvenir remonte ce soir : une phrase blessante dite à un parent il y a des années. Tu te demandes surtout…",
      a: [
        { c: 1, t: "comment je veux me comporter avec lui à partir de maintenant." },
        { c: 2, t: "si je devrais lui en parler ou lui écrire pour réparer ça." },
        { c: 3, t: "ce que j'aurais dû répondre ce jour-là, et ce qu'il en a gardé." },
        { c: 2, t: "quelle occasion simple saisir pour renouer : un café, un coup de fil." } ] }
  ];

  var CIRCLES = {
    1: { name: "Cercle 1 · J'agis", sub: "Tes choix, tes efforts, ta façon de réagir", color: "#5B21B6", grad: "linear-gradient(90deg, #9D6BFF, #4A1FB8)" },
    2: { name: "Cercle 2 · J'essaie d'influencer", sub: "Dialoguer, écouter, proposer, aider", color: "#BE185D", grad: "linear-gradient(90deg, #FF8AC4, #E0267F)" },
    3: { name: "Cercle 3 · Ce qui m'échappe", sub: "Les autres, le passé, les imprévus", color: "#B45309", grad: "linear-gradient(90deg, #FFD36B, #FF9F1C)" }
  };

  var PROFILES = {
    equilibre: {
      title: "Ton énergie va là où elle compte",
      text: "Tu investis surtout dans ce qui dépend de toi, tu influences quand c'est utile et tu t'épuises peu sur l'inchangeable. C'est l'esprit des 3 cercles : responsabilité, action et acceptation.",
      tips: [
        "Continue à décider consciemment de ce qui mérite ton énergie.",
        "Garde de la place pour les autres : se concentrer sur soi ne veut pas dire devenir égoïste.",
        "Le cercle 1 n'exige pas la perfection : tu peux aussi accepter tes propres limites."
      ]
    },
    echappe: {
      title: "Ton énergie s'échappe vers ce qui ne dépend pas de toi",
      text: "Une grande part de ton énergie part dans les pensées des autres, le passé ou les imprévus. C'est très humain, mais c'est là que l'effort rapporte le moins.",
      tips: [
        "Avant de t'agiter, demande-toi : qu'est-ce que je peux faire, moi, maintenant ?",
        "Choisis aujourd'hui une petite action du cercle 1 : un choix, un effort, une décision.",
        "Tu peux ressentir de la tristesse ou de la frustration sans t'épuiser à changer l'inchangeable. Accepter n'est pas abandonner.",
        "Si ces pensées t'envahissent au quotidien, en parler à un proche ou à un professionnel peut aider."
      ]
    },
    influence: {
      title: "Tu mets beaucoup d'énergie à influencer",
      text: "Dialoguer, expliquer, convaincre, aider : c'est une vraie force dans les relations, à condition de se rappeler que le résultat ne dépend pas que de toi.",
      tips: [
        "Fixe-toi une limite : une tentative sincère, puis tu observes.",
        "Reviens au cercle 1 : qu'est-ce que je choisis, moi, quelle que soit sa réponse ?",
        "Si l'autre ne veut pas entendre, prendre de la distance n'est pas abandonner : c'est reconnaître les limites de ton pouvoir d'action."
      ]
    },
    recentre: {
      title: "Tu es très centré(e) sur toi",
      text: "Tu investis presque toute ton énergie dans tes propres choix et efforts. C'est une base solide, mais n'oublie pas le cercle 2 : dialoguer, écouter, proposer, aider.",
      tips: [
        "Se concentrer sur soi ne signifie pas devenir égoïste ni ne plus se préoccuper des autres.",
        "Essaie une petite action d'influence : poser une demande, exprimer une limite, proposer une solution.",
        "Tu n'as pas à tout maîtriser en toi non plus : tu peux accepter tes propres limites."
      ]
    },
    chemin: {
      title: "Ton énergie se partage entre les trois cercles",
      text: "Aucun cercle ne domine vraiment. Bonne nouvelle : tu peux la rééquilibrer pas à pas, en commençant par repérer où elle file.",
      tips: [
        "Repère les moments où ton énergie part vers le cercle 3.",
        "Fais du cercle 1 ton premier réflexe : mes choix, mes réactions, mes efforts.",
        "Garde le cercle 2 pour quand cela a du sens : dialoguer, proposer, aider."
      ]
    }
  };

  var root = host;
  var state = { i: 0, answers: [], chosen: [], orders: [] };

  function shuffle(arr) {
    var a = arr.slice(), j, t, k;
    for (k = a.length - 1; k > 0; k--) {
      j = Math.floor(Math.random() * (k + 1));
      t = a[k]; a[k] = a[j]; a[j] = t;
    }
    return a;
  }

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text !== undefined) n.textContent = text;
    return n;
  }

  function clear() { while (root.firstChild) root.removeChild(root.firstChild); }

  function focusHeading(h) { h.setAttribute("tabindex", "-1"); h.focus({ preventScroll: true }); }

  function scrollTop() {
    var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    host.scrollIntoView({ block: "start", behavior: reduce ? "auto" : "smooth" });
  }

  /* ---------- Intro ---------- */
  function showIntro() {
    clear();
    var wrap = el("div", "pf-center");
    wrap.innerHTML =
      '<svg class="pf-mini" viewBox="0 0 160 160" role="img" aria-label="Trois cercles concentriques">' +
      '<defs>' +
      '<linearGradient id="pfo" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFD36B"/><stop offset="1" stop-color="#FF9F1C"/></linearGradient>' +
      '<linearGradient id="pfb" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FF8AC4"/><stop offset="1" stop-color="#E0267F"/></linearGradient>' +
      '<linearGradient id="pfg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#9D6BFF"/><stop offset="1" stop-color="#4A1FB8"/></linearGradient>' +
      '</defs>' +
      '<circle cx="80" cy="80" r="76" fill="url(#pfo)"/>' +
      '<circle cx="80" cy="80" r="52" fill="url(#pfb)"/>' +
      '<circle cx="80" cy="80" r="28" fill="url(#pfg)"/>' +
      '<circle cx="80" cy="80" r="76" fill="none" stroke="#fff" stroke-width="3"/>' +
      '<circle cx="80" cy="80" r="52" fill="none" stroke="#fff" stroke-width="3"/>' +
      '<circle cx="80" cy="80" r="28" fill="none" stroke="#fff" stroke-width="3"/></svg>';
    wrap.appendChild(el("p", "pf-kicker pf-kicker-intro", "Test gratuit"));
    var h = el("h1", "", "Agir, influencer, accepter");
    wrap.appendChild(h);
    wrap.appendChild(el("p", "pf-subtitle", "Où est-ce que je me situe ?"));
    wrap.appendChild(el("p", "pf-lead", "Dix scènes du quotidien : au travail, à la maison, en famille, dans l'actu. Pour chacune, choisis la pensée qui te ressemble le plus. À la fin, tu verras comment ton énergie se répartit entre les trois cercles."));
    var ul = el("ul", "pf-points");
    ul.style.maxWidth = "420px"; ul.style.margin = "22px auto 0"; ul.style.textAlign = "left";
    [["g", "Ce que je contrôle"], ["b", "Ce que je peux influencer"], ["o", "Ce qui m'échappe"]].forEach(function (x) {
      var li = el("li");
      li.appendChild(el("span", "pf-dot " + x[0]));
      li.appendChild(el("span", "", x[1]));
      ul.appendChild(li);
    });
    wrap.appendChild(ul);
    var b = el("button", "pf-btn block", "Commencer");
    b.type = "button";
    b.addEventListener("click", startTest);
    wrap.appendChild(b);
    wrap.appendChild(el("p", "pf-note", "Sans bonne ni mauvaise réponse. Tes réponses ne sont pas enregistrées."));
    root.appendChild(wrap);
  }

  function startTest() {
    state.i = 0;
    state.answers = [];
    state.chosen = [];
    state.orders = QUESTIONS.map(function (q) { return shuffle([0, 1, 2, 3]); });
    showQuestion();
    scrollTop();
  }

  /* ---------- Questions ---------- */
  function showQuestion() {
    clear();
    var n = QUESTIONS.length, q = QUESTIONS[state.i];

    var top = el("div", "pf-progress-top");
    top.appendChild(el("span", "", "Scène " + (state.i + 1) + " sur " + n));
    top.appendChild(el("span", "", Math.round((state.i / n) * 100) + " %"));
    root.appendChild(top);

    var bar = el("div", "pf-bar");
    bar.setAttribute("role", "progressbar");
    bar.setAttribute("aria-valuemin", "0");
    bar.setAttribute("aria-valuemax", String(n));
    bar.setAttribute("aria-valuenow", String(state.i));
    bar.setAttribute("aria-label", "Progression du test");
    var fill = el("span");
    bar.appendChild(fill);
    root.appendChild(bar);
    setTimeout(function () { fill.style.width = (state.i / n) * 100 + "%"; }, 20);

    root.appendChild(el("span", "pf-chip th-" + q.th, THEMES[q.th]));

    var h = el("h2", "", q.q);
    h.id = "pf-q";
    root.appendChild(h);
    if (state.i === 0) {
      root.appendChild(el("p", "pf-hint", "Réponds à l'instinct. Ni bonne ni mauvaise réponse : choisis ce qui te ressemble, pas ce qui serait idéal."));
    }

    var group = el("div", "pf-opts");
    group.setAttribute("role", "group");
    group.setAttribute("aria-labelledby", "pf-q");
    state.orders[state.i].forEach(function (idx) {
      var opt = q.a[idx];
      var b = el("button", "pf-opt", opt.t);
      b.type = "button";
      if (state.chosen[state.i] === idx) { b.className += " sel"; b.setAttribute("aria-pressed", "true"); }
      b.addEventListener("click", function () { choose(opt.c, idx, b, group); });
      group.appendChild(b);
    });
    root.appendChild(group);

    var back = el("button", "pf-link", "← Scène précédente");
    back.type = "button";
    if (state.i === 0) back.disabled = true;
    back.addEventListener("click", function () { state.i--; showQuestion(); });
    root.appendChild(back);

    focusHeading(h);
  }

  var locked = false;
  function choose(c, idx, btn, group) {
    if (locked) return;
    locked = true;
    state.answers[state.i] = c;
    state.chosen[state.i] = idx;
    Array.prototype.forEach.call(group.children, function (x) { x.classList.remove("sel"); });
    btn.classList.add("sel");
    setTimeout(function () {
      locked = false;
      if (state.i < QUESTIONS.length - 1) { state.i++; showQuestion(); }
      else { showResult(); scrollTop(); }
    }, 260);
  }

  /* ---------- Résultat ---------- */
  function compute() {
    var counts = { 1: 0, 2: 0, 3: 0 };
    state.answers.forEach(function (c) { counts[c]++; });
    var total = state.answers.length;
    var p = {
      1: Math.round(counts[1] / total * 100),
      2: Math.round(counts[2] / total * 100),
      3: Math.round(counts[3] / total * 100)
    };
    return p;
  }

  function pickProfile(p) {
    if (p[3] >= 40) return "echappe";
    if (p[2] >= 50) return "influence";
    if (p[1] >= 70 && p[2] <= 10) return "recentre";
    if (p[1] >= 40 && p[3] <= 30) return "equilibre";
    return "chemin";
  }

  /* Trois cercles concentriques dont la SURFACE est proportionnelle à la part de chaque cercle */
  function buildCircles(p) {
    var NS = "http://www.w3.org/2000/svg", C = 130, R = 122;
    var r2 = R * Math.sqrt((p[1] + p[2]) / 100);
    var r1 = R * Math.sqrt(p[1] / 100);
    var svg = document.createElementNS(NS, "svg");
    svg.setAttribute("viewBox", "0 0 260 260");
    svg.setAttribute("class", "pf-circles");
    svg.setAttribute("role", "img");
    svg.setAttribute("aria-label", "Tes cercles d'énergie : " + p[1] + " % cercle 1, " + p[2] + " % cercle 2, " + p[3] + " % cercle 3");
    var h = '<defs>' +
      '<linearGradient id="pf-g3" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFD36B"/><stop offset="1" stop-color="#FF9F1C"/></linearGradient>' +
      '<linearGradient id="pf-g2" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FF8AC4"/><stop offset="1" stop-color="#E0267F"/></linearGradient>' +
      '<linearGradient id="pf-g1" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#9D6BFF"/><stop offset="1" stop-color="#4A1FB8"/></linearGradient></defs>';
    function disc(cls, r, fill) {
      return r > 0.5 ? '<circle class="pf-c ' + cls + '" cx="' + C + '" cy="' + C + '" r="' + r.toFixed(1) + '" fill="url(#' + fill + ')" stroke="#fff" stroke-width="3"/>' : "";
    }
    h += disc("c3", R, "pf-g3") + disc("c2", r2, "pf-g2") + disc("c1", r1, "pf-g1");
    function label(cls, y, txt, fill) {
      return '<text class="pf-c ' + cls + '" x="' + C + '" y="' + y.toFixed(1) + '" fill="' + fill + '">' + txt + '</text>';
    }
    if (p[3] > 0 && R - r2 >= 26) h += label("c3", C - (r2 + R) / 2, p[3] + " %", "#1E1B3A");
    if (p[2] > 0 && r2 - r1 >= 26) h += label("c2", C - (r1 + r2) / 2, p[2] + " %", "#fff");
    if (p[1] > 0 && r1 >= 26) h += label("c1", C, p[1] + " %", "#fff");
    svg.innerHTML = h;
    setTimeout(function () { svg.classList.add("on"); }, 60);
    return svg;
  }

  function showResult() {
    clear();
    var p = compute();
    var prof = PROFILES[pickProfile(p)];

    root.appendChild(el("p", "pf-kicker", "Tes cercles d'énergie"));
    var h = el("h2", "", prof.title);
    h.style.marginTop = "6px";
    root.appendChild(h);

    root.appendChild(buildCircles(p));

    var rows = el("div", "pf-rows");
    [1, 2, 3].forEach(function (k) {
      var row = el("div", "pf-row");
      var dot = el("span", "pf-row-dot");
      dot.style.background = CIRCLES[k].grad.replace("90deg", "135deg");
      var txt = el("div", "pf-row-txt");
      txt.appendChild(el("div", "pf-row-title", CIRCLES[k].name));
      txt.appendChild(el("div", "pf-row-sub", CIRCLES[k].sub));
      var pct = el("span", "pf-row-pct", p[k] + " %");
      pct.style.color = CIRCLES[k].color;
      row.appendChild(dot); row.appendChild(txt); row.appendChild(pct);
      rows.appendChild(row);
    });
    root.appendChild(rows);

    var box = el("div", "pf-profile");
    box.appendChild(el("h3", "", "Ce que ça dit"));
    box.appendChild(el("p", "", prof.text));
    var ul = el("ul", "pf-tips");
    prof.tips.forEach(function (t) { ul.appendChild(el("li", "", t)); });
    box.appendChild(ul);
    root.appendChild(box);

    var quote = el("div", "pf-quote", "Plus tu dépenses ton énergie à vouloir contrôler les autres, moins il t'en reste pour construire ta propre vie.");
    quote.appendChild(el("small", "", "Je prends soin de ce qui dépend de moi, j'agis sur ce que je peux influencer et j'apprends à lâcher prise sur ce qui ne m'appartient pas. C'est un équilibre entre responsabilité, action et acceptation."));
    root.appendChild(quote);

    var actions = el("div", "pf-actions");
    var copy = el("button", "pf-btn", "Copier mon résultat");
    copy.type = "button";
    copy.addEventListener("click", function () { copyResult(p, copy); });
    var again = el("button", "pf-btn ghost", "Refaire le test");
    again.type = "button";
    again.addEventListener("click", function () { showIntro(); scrollTop(); });
    actions.appendChild(copy);
    actions.appendChild(again);
    root.appendChild(actions);

    root.appendChild(el("p", "pf-disclaimer", "Ce test est un outil de réflexion, il ne remplace pas l'avis d'un professionnel."));
    focusHeading(h);
  }

  function copyResult(p, btn) {
    var text = "Mes cercles d'énergie : " + p[1] + " % cercle 1 (j'agis), " + p[2] + " % cercle 2 (j'influence), " + p[3] + " % cercle 3 (ce qui m'échappe). Agir, influencer, accepter : test gratuit sur profilia-test.fr/trois-cercles";
    function done(ok) {
      var old = btn.textContent;
      btn.textContent = ok ? "Copié !" : "Copie impossible";
      setTimeout(function () { btn.textContent = old; }, 1800);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () { done(true); }, function () { fallback(); });
    } else { fallback(); }
    function fallback() {
      var ta = document.createElement("textarea");
      ta.value = text; ta.setAttribute("readonly", "");
      ta.style.position = "fixed"; ta.style.opacity = "0";
      document.body.appendChild(ta); ta.select();
      var ok = false;
      try { ok = document.execCommand("copy"); } catch (e) {}
      document.body.removeChild(ta);
      done(ok);
    }
  }

  showIntro();
`);
    run(host);
    return () => {
      while (host.firstChild) host.removeChild(host.firstChild);
    };
  }, []);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />
      <main ref={ref} className="pf-card" id="pf-app" aria-live="polite" />
    </>
  );
}
