(() => {
  const places = window.VIETNAM_PLACES || [];
  const categories = window.VIETNAM_CATEGORIES || [];
  const regions = window.VIETNAM_REGIONS || [];
  const state = {
    selectedId: "da-lat",
    category: "all",
    region: "Tất cả",
    search: "",
    view: "map",
    zoom: 1,
    favorites: readFavorites(),
    favoritesOnly: false,
    journey: false,
    detailOpen: false
  };

  const els = {
    markerLayer: document.querySelector("#markerLayer"),
    quickPanelContent: document.querySelector("#quickPanelContent"),
    detailPanel: document.querySelector("#detailPanel"),
    listView: document.querySelector("#listView"),
    placeGrid: document.querySelector("#placeGrid"),
    mapViewport: document.querySelector("#mapViewport"),
    routeLine: document.querySelector("#routeLine"),
    routeLabel: document.querySelector("#routeLabel"),
    searchInput: document.querySelector("#searchInput"),
    visibleCount: document.querySelector("#visibleCount"),
    listResultCount: document.querySelector("#listResultCount"),
    categoryFilters: document.querySelector("#categoryFilters"),
    regionFilters: document.querySelector("#regionFilters"),
    favoriteCount: document.querySelector("#favoriteCount"),
    modal: document.querySelector("#detailModal"),
    storyCard: document.querySelector("#storyCard"),
    toast: document.querySelector("#toast")
  };

  function readFavorites() {
    try { return JSON.parse(localStorage.getItem("vne-favorites") || "[]"); } catch { return []; }
  }

  function saveFavorites() {
    localStorage.setItem("vne-favorites", JSON.stringify(state.favorites));
    els.favoriteCount.textContent = state.favorites.length;
  }

  function filteredPlaces() {
    const search = state.search.trim().toLowerCase();
    return places.filter(place => {
      const matchesCategory = state.category === "all" || place.categoryKey === state.category;
      const matchesRegion = state.region === "Tất cả" || place.region === state.region;
      const haystack = [place.name, place.province, place.region, place.category, ...place.tags].join(" ").toLowerCase();
      const matchesFavorites = !state.favoritesOnly || state.favorites.includes(place.id);
      return matchesCategory && matchesRegion && matchesFavorites && (!search || haystack.includes(search));
    });
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>'"]/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[char]));
  }

  function renderFilters() {
    els.categoryFilters.innerHTML = categories.map(category => `
      <button class="filter-item ${state.category === category.key ? "active" : ""}" type="button" data-category="${category.key}">
        <span class="filter-dot ${category.key}"></span><span>${category.label}</span><span class="filter-chevron">›</span>
      </button>`).join("");
    els.regionFilters.innerHTML = regions.map(region => `
      <button class="region-pill ${state.region === region ? "active" : ""}" type="button" data-region="${region}">${region}</button>`).join("");
  }

  function renderMarkers() {
    const visible = filteredPlaces();
    els.visibleCount.textContent = visible.length.toString().padStart(2, "0");
    els.markerLayer.innerHTML = visible.map(place => {
      const isActive = state.selectedId === place.id;
      const isFavorite = state.favorites.includes(place.id);
      return `<button class="map-marker ${isActive ? "active" : ""}" style="left:${place.position.left}%;top:${place.position.top}%" type="button" data-place-id="${place.id}" aria-label="Khám phá ${escapeHtml(place.name)}">
        <span class="marker-beam"></span><span class="marker-core"></span><span class="marker-pulse"></span>
        <span class="marker-label"><small>${escapeHtml(place.province)}</small><strong>${escapeHtml(place.name)}</strong>${isFavorite ? "<i>♥</i>" : ""}</span>
      </button>`;
    }).join("");
    els.markerLayer.querySelectorAll("[data-place-id]").forEach(button => button.addEventListener("click", () => selectPlace(button.dataset.placeId)));
    els.listResultCount.textContent = `${visible.length} kết quả`;
  }

  function selectedPlace() {
    return places.find(place => place.id === state.selectedId) || places[0];
  }

  function renderQuickPanel() {
    const place = selectedPlace();
    if (!place) return;
    const favorite = state.favorites.includes(place.id);
    els.detailPanel.classList.add("has-selection");
    els.quickPanelContent.innerHTML = `
      <div class="panel-visual">
        <img src="${place.image}" alt="${escapeHtml(place.imageAlt)}" />
        <span class="panel-index">${String(places.indexOf(place) + 1).padStart(2, "0")} / 12</span>
        <button class="favorite-button ${favorite ? "saved" : ""}" type="button" id="favoriteButton" aria-label="${favorite ? "Bỏ lưu" : "Lưu địa danh"}">${favorite ? "♥" : "♡"}</button>
        <div class="panel-image-gradient"></div>
        <div class="panel-place-name"><span>${escapeHtml(place.region)} / ${escapeHtml(place.category)}</span><h2>${escapeHtml(place.name)}</h2></div>
      </div>
      <div class="panel-body">
        <p class="panel-lede">${escapeHtml(place.short)}</p>
        <p class="panel-description">${escapeHtml(place.description)}</p>
        <div class="panel-meta"><span><small>ĐI ĐẸP NHẤT</small><strong>${escapeHtml(place.season)}</strong></span><span><small>ĐỊA ĐIỂM</small><strong>${escapeHtml(place.province)}</strong></span></div>
        <div class="tag-row">${place.tags.map(tag => `<span>#${escapeHtml(tag)}</span>`).join("")}</div>
        <button class="primary-button" id="exploreButton" type="button">Khám phá ${escapeHtml(place.name)} <span>↗</span></button>
      </div>`;
    document.querySelector("#favoriteButton").addEventListener("click", () => toggleFavorite(place.id));
    document.querySelector("#exploreButton").addEventListener("click", () => openDetail(place));
  }

  function renderList() {
    const visible = filteredPlaces();
    els.placeGrid.innerHTML = visible.length ? visible.map(place => {
      const favorite = state.favorites.includes(place.id);
      return `<article class="place-card" data-place-id="${place.id}">
        <button class="card-image-button" type="button" aria-label="Mở ${escapeHtml(place.name)}"><img src="${place.image}" alt="${escapeHtml(place.imageAlt)}" /><span class="card-number">${String(places.indexOf(place) + 1).padStart(2, "0")}</span></button>
        <div class="card-content"><div><span class="card-kicker">${escapeHtml(place.region)} / ${escapeHtml(place.category)}</span><h3>${escapeHtml(place.name)}</h3></div><button class="card-favorite ${favorite ? "saved" : ""}" data-favorite-id="${place.id}" type="button" aria-label="Lưu ${escapeHtml(place.name)}">${favorite ? "♥" : "♡"}</button><p>${escapeHtml(place.short)}</p><button class="text-button" data-place-open="${place.id}" type="button">Xem trên bản đồ <span>↗</span></button></div>
      </article>`;
    }).join("") : `<div class="empty-state"><span>⌁</span><h3>Chưa có điểm phù hợp</h3><p>Thử một từ khóa khác hoặc đặt lại bộ lọc.</p><button class="outline-button" data-reset-filters type="button">Đặt lại bộ lọc</button></div>`;
    els.placeGrid.querySelectorAll("[data-place-id]").forEach(card => card.querySelector(".card-image-button")?.addEventListener("click", () => selectPlace(card.dataset.placeId)));
    els.placeGrid.querySelectorAll("[data-place-open]").forEach(button => button.addEventListener("click", () => { state.view = "map"; updateView(); selectPlace(button.dataset.placeOpen); }));
    els.placeGrid.querySelectorAll("[data-favorite-id]").forEach(button => button.addEventListener("click", () => toggleFavorite(button.dataset.favoriteId)));
    els.placeGrid.querySelector("[data-reset-filters]")?.addEventListener("click", resetFilters);
  }

  function selectPlace(id) {
    const place = places.find(item => item.id === id);
    if (!place) return;
    state.selectedId = id;
    state.favoritesOnly = false;
    state.view = "map";
    updateView();
    showToast(`${place.name} đã được chọn`);
  }

  function toggleFavorite(id) {
    state.favorites = state.favorites.includes(id) ? state.favorites.filter(item => item !== id) : [...state.favorites, id];
    saveFavorites();
    renderMarkers(); renderQuickPanel(); renderList();
    const place = places.find(item => item.id === id);
    showToast(state.favorites.includes(id) ? `${place.name} đã được lưu` : `${place.name} đã được bỏ lưu`);
  }

  function openDetail(place) {
    state.detailOpen = true;
    els.storyCard.innerHTML = `
      <button class="story-close" type="button" data-close-modal aria-label="Đóng chi tiết">×</button>
      <div class="story-hero"><img src="${place.image}" alt="${escapeHtml(place.imageAlt)}" /><div class="story-overlay"></div><div class="story-hero-copy"><span class="eyebrow">${escapeHtml(place.region)} / ${escapeHtml(place.category)}</span><h2>${escapeHtml(place.name)}</h2><p>${escapeHtml(place.short)}</p></div></div>
      <div class="story-body"><div class="story-intro"><span class="eyebrow">A PLACE TO PAUSE</span><p>${escapeHtml(place.description)} Đây là một điểm dừng để nhìn địa hình bằng nhiều lớp hơn — từ ký ức văn hóa đến cách con người sống cùng cảnh quan.</p></div><div class="story-facts"><span><small>TỈNH / THÀNH</small><strong>${escapeHtml(place.province)}</strong></span><span><small>THỜI ĐIỂM ĐẸP</small><strong>${escapeHtml(place.season)}</strong></span><span><small>CHỦ ĐỀ</small><strong>${place.tags.map(tag => `#${escapeHtml(tag)}`).join(" ")}</strong></span></div><div class="story-section"><span class="eyebrow">GỢI Ý NHỎ</span><h3>Đi chậm để thấy nhiều hơn.</h3><p>Hãy bắt đầu bằng một buổi sớm, dành thời gian cho những điểm nằm ngoài tuyến chính và để ánh sáng kể phần còn lại của câu chuyện.</p></div><div class="story-gallery"><img src="${place.image}" alt="${escapeHtml(place.imageAlt)}" /><div><span>01</span><span>02</span><span>03</span></div></div></div>`;
    els.modal.hidden = false;
    requestAnimationFrame(() => els.modal.classList.add("open"));
    els.storyCard.querySelectorAll("[data-close-modal]").forEach(button => button.addEventListener("click", closeDetail));
  }

  function closeDetail() {
    state.detailOpen = false;
    els.modal.classList.remove("open");
    setTimeout(() => { els.modal.hidden = true; }, 250);
  }

  function updateView() {
    const list = state.view === "list";
    els.listView.hidden = !list;
    els.mapViewport.classList.toggle("is-hidden", list);
    document.querySelectorAll(".view-toggle").forEach(button => button.classList.toggle("active", button.dataset.view === state.view));
    renderMarkers(); renderQuickPanel(); renderList();
  }

  function resetFilters() {
    state.category = "all"; state.region = "Tất cả"; state.search = ""; state.favoritesOnly = false; els.searchInput.value = ""; updateView(); renderFilters();
  }

  function startJourney() {
    state.journey = !state.journey;
    els.mapViewport.classList.toggle("journey-active", state.journey);
    els.routeLine.classList.toggle("visible", state.journey);
    els.routeLabel.classList.toggle("visible", state.journey);
    const button = document.querySelector("#journeyButton");
    button.classList.toggle("active", state.journey);
    showToast(state.journey ? "Đã bật hành trình Di sản miền Trung" : "Đã tắt hành trình");
    if (state.journey) {
      state.view = "map"; updateView();
      ["hue", "da-nang", "hoi-an", "my-son"].forEach((id, index) => setTimeout(() => selectPlace(id), index * 550));
    }
  }

  function showFavorites() {
    if (!state.favorites.length) { showToast("Bạn chưa lưu địa danh nào"); return; }
    state.search = ""; state.category = "all"; state.region = "Tất cả"; state.favoritesOnly = true; state.view = "list"; updateView(); renderFilters();
    showToast(`${state.favorites.length} địa danh trong bộ sưu tập của bạn`);
  }

  function showToast(message) {
    els.toast.textContent = message; els.toast.classList.add("show");
    clearTimeout(showToast.timer); showToast.timer = setTimeout(() => els.toast.classList.remove("show"), 2400);
  }

  els.categoryFilters.addEventListener("click", event => { const button = event.target.closest("[data-category]"); if (!button) return; state.favoritesOnly = false; state.category = button.dataset.category; renderFilters(); updateView(); });
  els.regionFilters.addEventListener("click", event => { const button = event.target.closest("[data-region]"); if (!button) return; state.favoritesOnly = false; state.region = button.dataset.region; renderFilters(); updateView(); });
  els.searchInput.addEventListener("input", event => { state.favoritesOnly = false; state.search = event.target.value; updateView(); });
  document.querySelectorAll(".view-toggle").forEach(button => button.addEventListener("click", () => { state.view = button.dataset.view; updateView(); }));
  document.querySelector("#closePanel").addEventListener("click", () => { state.selectedId = null; els.detailPanel.classList.remove("has-selection"); els.quickPanelContent.innerHTML = `<div class="panel-empty"><span>⌁</span><h3>Chọn một điểm trên bản đồ</h3><p>Marker đang phát sáng chờ bạn khám phá.</p></div>`; renderMarkers(); });
  document.querySelector("#journeyButton").addEventListener("click", startJourney);
  document.querySelector("#showFavorites").addEventListener("click", showFavorites);
  document.querySelector("#helpButton").addEventListener("click", () => showToast("Nhấp marker để xem nhanh, sau đó chọn Khám phá để đọc câu chuyện đầy đủ"));
  document.querySelector("[data-close-modal]").addEventListener("click", closeDetail);
  document.addEventListener("keydown", event => { if (event.key === "/" && document.activeElement !== els.searchInput) { event.preventDefault(); els.searchInput.focus(); } if (event.key === "Escape" && state.detailOpen) closeDetail(); });
  document.querySelector("#zoomIn").addEventListener("click", () => { state.zoom = Math.min(1.16, state.zoom + 0.04); els.mapViewport.style.setProperty("--map-zoom", state.zoom); });
  document.querySelector("#zoomOut").addEventListener("click", () => { state.zoom = Math.max(0.92, state.zoom - 0.04); els.mapViewport.style.setProperty("--map-zoom", state.zoom); });
  document.querySelector("#resetMap").addEventListener("click", () => { state.zoom = 1; els.mapViewport.style.setProperty("--map-zoom", 1); state.journey = false; els.mapViewport.classList.remove("journey-active"); els.routeLine.classList.remove("visible"); els.routeLabel.classList.remove("visible"); showToast("Đã đặt lại toàn cảnh Việt Nam"); });

  saveFavorites(); renderFilters(); updateView();
})();
