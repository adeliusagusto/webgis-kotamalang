// Koordinat ITN Malang
const itn = [-7.9467, 112.6158];

// Inisialisasi peta
const map = L.map("map").setView(itn, 13);

// Basemap
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "© OpenStreetMap"
}).addTo(map);

// Marker ITN
L.marker(itn)
  .addTo(map)
  .bindPopup("<b>ITN Malang</b>");

// Layer Groups
let pointLayer = L.geoJSON(null);
let batasLayer = L.geoJSON(null);
let jalanLayer = L.geoJSON(null);

// Load Batas Administrasi
fetch("data/BatasAdmin.gjson.geojson")
  .then(res => res.json())
  .then(data => {
    batasLayer = L.geoJSON(data, {
      style: {
        color: "#f65e0cff",
        weight: 2,
        fillOpacity: 0.1
      }
    }).addTo(map);
  });

// Load Jalan
fetch("data/JALAN.gjson.geojson")
  .then(res => res.json())
  .then(data => {
    jalanLayer = L.geoJSON(data, {
      style: {
        color: "#0b2b44cf",
        weight: 1
      }
    }).addTo(map);
  });

// Fungsi hitung jarak (Haversine)
function hitungJarak(latlng1, latlng2) {
  return map.distance(latlng1, latlng2) / 1000; // km
}

// Load Point
fetch("data/Point.gjson.geojson")
  .then(res => res.json())
  .then(data => {
    tampilkanPoint(data);
  });

function tampilkanPoint(data, filter = "all") {
  pointLayer.clearLayers();

  pointLayer = L.geoJSON(data, {
    filter: feature => {
      if (filter === "all") return true;
      return feature.properties.Jenis === filter;
    },
    pointToLayer: (feature, latlng) => {
      let warna = feature.properties.Jenis === "Vape Store" ? "red" : "blue";
      return L.circleMarker(latlng, {
        radius: 6,
        color: warna,
        fillOpacity: 0.8
      });
    },
    onEachFeature: (feature, layer) => {
      const jarak = hitungJarak(itn, layer.getLatLng()).toFixed(2);
      layer.bindPopup(`
        <b>${feature.properties.Nama_Vape}</b><br>
        Jenis: ${feature.properties.Jenis}<br>
        Alamat: ${feature.properties.Alamat}<br>
        Jarak dari ITN: <b>${jarak} km</b>
      `);
    }
  }).addTo(map);

  // Search
  const searchControl = new L.Control.Search({
    layer: pointLayer,
    propertyName: "Nama_Vape",
    marker: false,
    moveToLocation: function(latlng, title, map) {
      map.setView(latlng, 17);
    }
  });
  map.addControl(searchControl);
}

// Filter Query
document.getElementById("filterJenis").addEventListener("change", e => {
  fetch("data/Point.gjson.geojson")
    .then(res => res.json())
    .then(data => {
      tampilkanPoint(data, e.target.value);
    });
});
