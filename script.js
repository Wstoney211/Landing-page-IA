/* AUmigos: comportamento da pagina (menu, animacoes de scroll, mapa do hero, calculadora, FAQ, formularios). */
(function () {
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var root = document.documentElement;

  /* menu */
  var burger = document.getElementById("burger"),
    menu = document.getElementById("menu");
  function setMenu(open) {
    root.classList.toggle("menu-open", open);
    burger.setAttribute("aria-expanded", open ? "true" : "false");
    burger.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
    menu.setAttribute("aria-hidden", open ? "false" : "true");
    if (open) {
      var f = menu.querySelector("a");
      if (f)
        setTimeout(function () {
          f.focus({ preventScroll: true });
        }, 50);
    }
  }
  burger.addEventListener("click", function () {
    setMenu(!root.classList.contains("menu-open"));
  });
  menu.querySelectorAll("a").forEach(function (a) {
    a.addEventListener("click", function () {
      setMenu(false);
    });
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && root.classList.contains("menu-open")) {
      setMenu(false);
      burger.focus();
    }
  });

  /* theme toggle */
  var themeBtn = document.getElementById("themeToggle");
  var themeIcon = themeBtn.querySelector("use"),
    themeLabel = themeBtn.querySelector(".tlabel");
  function readTheme() {
    try {
      return localStorage.getItem("aumigos-theme");
    } catch (e) {
      return null;
    }
  }
  function writeTheme(v) {
    try {
      if (v) localStorage.setItem("aumigos-theme", v);
      else localStorage.removeItem("aumigos-theme");
    } catch (e) {}
  }
  function effectiveTheme() {
    var attr = root.getAttribute("data-theme");
    if (attr === "light" || attr === "dark") return attr;
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }
  function syncThemeBtn() {
    var target = effectiveTheme() === "dark" ? "light" : "dark";
    themeBtn.setAttribute(
      "aria-pressed",
      effectiveTheme() === "dark" ? "true" : "false",
    );
    themeIcon.setAttribute("href", target === "dark" ? "#i-moon" : "#i-sun");
    themeLabel.textContent = target === "dark" ? "Modo escuro" : "Modo claro";
  }
  var storedTheme = readTheme();
  if (storedTheme === "light" || storedTheme === "dark")
    root.setAttribute("data-theme", storedTheme);
  syncThemeBtn();
  themeBtn.addEventListener("click", function () {
    var next = effectiveTheme() === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    writeTheme(next);
    syncThemeBtn();
  });

  /* current section in menu */
  var links = Array.prototype.slice.call(menu.querySelectorAll("a"));
  var byId = {};
  links.forEach(function (a) {
    byId[a.getAttribute("href").slice(1)] = a;
  });
  if ("IntersectionObserver" in window) {
    var so = new IntersectionObserver(
      function (es) {
        es.forEach(function (e) {
          if (e.isIntersecting && byId[e.target.id]) {
            links.forEach(function (l) {
              l.removeAttribute("aria-current");
            });
            byId[e.target.id].setAttribute("aria-current", "location");
          }
        });
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    Object.keys(byId).forEach(function (id) {
      var el = document.getElementById(id);
      if (el) so.observe(el);
    });
    var top = document.getElementById("topo");
    if (top)
      new IntersectionObserver(
        function (es) {
          es.forEach(function (e) {
            if (e.isIntersecting)
              links.forEach(function (l) {
                l.removeAttribute("aria-current");
              });
          });
        },
        { rootMargin: "-45% 0px -50% 0px" },
      ).observe(top);

    /* reveal */
    var io = new IntersectionObserver(
      function (es) {
        es.forEach(function (e) {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        });
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.05 },
    );
    document.querySelectorAll(".reveal").forEach(function (el) {
      io.observe(el);
    });
  } else {
    document.querySelectorAll(".reveal").forEach(function (el) {
      el.classList.add("in");
    });
  }

  /* tagline word reveal */
  var tg = document.getElementById("tagline");
  if (tg) {
    var words = tg.textContent.trim().split(/\s+/);
    tg.setAttribute("aria-label", words.join(" "));
    tg.textContent = "";
    words.forEach(function (w, i) {
      var s = document.createElement("span");
      s.className = "w";
      s.textContent = w;
      s.setAttribute("aria-hidden", "true");
      tg.appendChild(s);
      if (i < words.length - 1) tg.appendChild(document.createTextNode(" "));
    });
    if ("IntersectionObserver" in window) {
      var wo = new IntersectionObserver(
        function (es) {
          es.forEach(function (e) {
            if (e.isIntersecting) {
              e.target.classList.add("on");
            } else if (
              e.rootBounds &&
              e.boundingClientRect.top >= e.rootBounds.bottom
            ) {
              e.target.classList.remove("on");
            }
          });
        },
        { rootMargin: "0px 0px -35% 0px", threshold: 0 },
      );
      tg.querySelectorAll(".w").forEach(function (w) {
        wo.observe(w);
      });
    } else {
      tg.querySelectorAll(".w").forEach(function (w) {
        w.classList.add("on");
      });
    }
  }

  /* hero map */
  var route = document.getElementById("route"),
    done = document.getElementById("routeDone"),
    pet = document.getElementById("pet");
  var tEl = document.getElementById("statTime"),
    kEl = document.getElementById("statKm");
  if (route && done && pet) {
    var L = route.getTotalLength();
    done.style.strokeDasharray = L;
    var draw = function (p) {
      var pt = route.getPointAtLength(L * p);
      pet.setAttribute(
        "transform",
        "translate(" + pt.x.toFixed(1) + " " + pt.y.toFixed(1) + ")",
      );
      done.style.strokeDashoffset = L * (1 - p);
      tEl.textContent = Math.round(6 + p * 46) + " min";
      kEl.textContent = (0.3 + p * 3).toFixed(2).replace(".", ",") + " km";
    };
    draw(0.62);
    if (!reduce && "IntersectionObserver" in window) {
      var raf = null,
        t0 = null,
        D = 32000;
      var frame = function (t) {
        if (t0 === null) t0 = t;
        draw(((t - t0) / D + 0.62) % 1);
        raf = requestAnimationFrame(frame);
      };
      var mo = new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          if (e.isIntersecting) {
            if (raf === null) {
              t0 = null;
              raf = requestAnimationFrame(frame);
            }
          } else if (raf !== null) {
            cancelAnimationFrame(raf);
            raf = null;
          }
        });
      });
      mo.observe(document.getElementById("phone"));
    }
  }

  /* calculator */
  var rW = document.getElementById("rWeek"),
    rP = document.getElementById("rPrice");
  var brl = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
  function calc() {
    var w = +rW.value,
      p = +rP.value,
      net = p * 0.8,
      fee = p * 0.2;
    document.getElementById("oWeek").textContent = w;
    document.getElementById("oPrice").textContent = brl.format(p);
    document.getElementById("amount").textContent = brl.format(w * net * 4);
    document.getElementById("explain").textContent =
      w +
      (w === 1 ? " passeio" : " passeios") +
      " × " +
      brl.format(net) +
      " × 4 semanas. O AUmigos fica com " +
      brl.format(fee) +
      " de cada passeio (20%).";
  }
  rW.addEventListener("input", calc);
  rP.addEventListener("input", calc);
  calc();

  /* faq */
  document.querySelectorAll(".fq").forEach(function (item) {
    var b = item.querySelector("button");
    b.addEventListener("click", function () {
      var open = item.classList.toggle("open");
      b.setAttribute("aria-expanded", open ? "true" : "false");
    });
  });

  /* role pick */
  document.querySelectorAll("[data-pick]").forEach(function (a) {
    a.addEventListener("click", function () {
      var r = document.querySelector(
        '#lista input[name=role][value="' + a.getAttribute("data-pick") + '"]',
      );
      if (r) r.checked = true;
    });
  });

  /* forms */
  var emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  document.querySelectorAll("form.signup").forEach(function (form) {
    var input = form.querySelector("input[type=email]"),
      field = form.querySelector(".field");
    var err = form.querySelector(".err"),
      btn = form.querySelector("button[type=submit]");
    input.addEventListener("input", function () {
      field.classList.remove("invalid");
      input.removeAttribute("aria-invalid");
      err.hidden = true;
    });
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var v = input.value.trim();
      if (!v) {
        err.textContent = "Informe seu email para entrar na lista.";
      } else if (!emailRe.test(v)) {
        err.textContent = "Digite um email válido, como nome@email.com.";
      } else {
        err.textContent = "";
      }
      if (err.textContent) {
        err.hidden = false;
        field.classList.add("invalid");
        input.setAttribute("aria-invalid", "true");
        input.focus();
        return;
      }
      var checked = form.querySelector("input[name=role]:checked");
      var role = checked ? checked.value : form.getAttribute("data-role");
      form.classList.add("loading");
      btn.disabled = true;
      setTimeout(function () {
        form.classList.remove("loading");
        btn.disabled = false;
        form.classList.add("done");
        form.querySelector(".ok-text").textContent =
          role === "cuidador"
            ? "Você está na lista de cuidadores. Vamos avisar em " +
              v +
              " quando o cadastro abrir."
            : "Você está na lista de tutores. Vamos enviar o convite para " +
              v +
              " antes da abertura geral.";
      }, 900);
    });
  });

  /* dialogs */
  document.querySelectorAll("[data-open]").forEach(function (b) {
    b.addEventListener("click", function () {
      var d = document.getElementById(b.getAttribute("data-open"));
      if (d && d.showModal) d.showModal();
    });
  });
  document.querySelectorAll("dialog").forEach(function (d) {
    d.querySelectorAll("[data-close]").forEach(function (c) {
      c.addEventListener("click", function () {
        d.close();
      });
    });
    d.addEventListener("click", function (e) {
      if (e.target === d) d.close();
    });
  });
})();
