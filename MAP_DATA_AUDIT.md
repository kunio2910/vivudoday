# Map data and layout audit — 2026-09-23

## Coordinate semantics

- `provinces-source.json` remains unchanged. At runtime, the representative point is selected inside the largest polygon ring using scanline intersections. It is not an administrative capital or an exact geographic centroid. Offshore polygons remain visible in province maps.
- `MapCatalog.anchors` contains manually calibrated illustration percentages for 34 provinces. The national artwork is not georeferenced; these are not GPS coordinates. Hoàng Sa and Trường Sa labels follow their locations in the artwork.
- HCMC uses district illustration anchors, with grouped markers. Expanded markers are offset for interaction and connected back to their district anchor. The image depicts the former HCMC footprint and district names, not current administrative boundaries.
- Removed unverified legacy HCMC latitude/longitude values from the runtime objects. They were incorrectly used to project onto the artwork. Only Chùa Giác Viên has a source-referenced coordinate correction in this batch; other HCMC locations route by name/address search instead of unverified GPS.
- Province SVG and HTML marker overlays now share the same aspect ratio and viewport. Marker centers, rather than label widths, determine their positions.

## Content added

- Discovery suggestions for all 34 provinces (70 names). This is a starter catalog, not a fully verified geocoded POI database. Suggestions with no exact coordinate are intentionally not plotted as GPS markers.
- HCMC: 43 entries, 22 legacy district/city areas, including five new sourced entries. Detailed descriptions/addresses/source links are populated where checked. Other entries retain an explicit unverified-data notice.
- Corrected legacy grouping: Tao Đàn → Quận 1; Hoàng Văn Thụ park → Tân Bình. Thanh Hóa appears in the Trung Bộ tourism filter.
- No opening hours, ticket prices, or fabricated coordinates were added. No Firestore data was overwritten.

## Sources consulted

- https://vietnam.travel/node/1613 — HCMC museums, post office, Landmark 81, Củ Chi, Thiềng Liềng. Street addresses retain legacy context from the source.
- https://dinhdoclap.gov.vn/so-do-dinh-doc-lap/ — Dinh Độc Lập.
- https://damsenpark.vn/thong-tin-lien-he/ — Đầm Sen.
- https://suoitien.com/ban-do — Suối Tiên.
- https://www.vietnam-pagodas.com/vi/chua/chua-giac-vien — Giác Viên reference coordinates (10.76302, 106.63924); non-government reference.
- https://vamsat.vn/wp-content/uploads/2020/02/bang-gia-duong-thuy.pdf — Vàm Sát operator reference, historical; prices intentionally not imported.
- https://pntc.vn/ct-du-an/du-an-duong-phan-xich-long.22 — Phan Xích Long project/location.
- https://www.vietnam.travel/vi/places-to-go/northern-vietnam/ninh-binh — Ninh Bình discovery suggestions.
- https://www.vietnam.travel/vi/things-to-do/discovering-cao-bang-7-must-do-experiences — Cao Bằng discovery suggestions.

## Interaction and QA

- National markers cluster by rendered pixel distance; province markers cluster with an accessible selection list. HCMC clusters by district with radial expansion and leader lines.
- Searchable, collapsible district directory retains scroll position on selection. Only that panel scrolls internally; the map participates in page scrolling.
- Desktop three-column composition; stacked panels on mobile. Province selection now shows the selected landmark details and preview.
- `node tests/map-audit.cjs`: validates all province anchors, catalog coverage and interior representative points.
- `node tests/map-browser.cjs`: Playwright smoke tests at 1440px/390px; requires Playwright, installed Edge (or BROWSER_CHANNEL), and a static server on port 4173.

## Remaining data work

The nationwide suggestions and legacy POIs still need per-site authoritative geocoding and address verification. HCMC illustration anchors cannot establish exact locations within each district. A geographically accurate basemap or georeferenced artwork would be required for that accuracy; this implementation does not claim it.
