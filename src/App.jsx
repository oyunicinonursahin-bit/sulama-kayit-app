import React from "react";

const GOOGLE_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbxD_LKGCZTpAcC8EUw5Bd3Uy0Q-aFLPY1FAe12-E1W0M1v-if1EAHjTW9SzMn5Tp6vc/exec";

export default function App() {
  const personelListesi = [
    "Burak Ateş",
    "Görkem Turan",
    "Gürkan Çavdar",
    "Hasan Mut",
    "Mahmut İpekten",
    "Mustafa Dursun",
    "Okan Erol",
    "Osman İnce",
    "Samet Engür",
    "Samet Öztürk",
    "Serhan KOYUN",
    "Seyid Ahmet Kıran",
    "Tuğrul Gençay",
    "Yasin Dursun",
    "Yüksel Aşık",
  ];

  const islemListesi = [
    "Vana Açma",
    "Vana Açma + Pil Değişimi",
    "Pil Değişimi",
    "Hata 5",
    "Motor Değişimi",
    "Pirinç/Selenoid Vana Değişimi",
    "Ön Ekran Değişimi",
    "Arka Ekran Değişimi",
    "Kablo/Lehim Yenileme",
    "Mavi Hortum Değişimi",
    "Membran Değişimi",
    "Plastik Parça Değişimi",
    "Kaçak Tespiti",
    "Vana Kapatma",
    "Tamir",
  ];

  const [personel, setPersonel] = React.useState(
    localStorage.getItem("personelAdi") || personelListesi[0]
  );

  const [sayacId, setSayacId] = React.useState("");
  const [hidrantNo, setHidrantNo] = React.useState("");
  const [islem, setIslem] = React.useState(islemListesi[0]);
  const [aciklama, setAciklama] = React.useState("");
  const [konum, setKonum] = React.useState(null);
  const [fotograf, setFotograf] = React.useState(null);

  const [durum, setDurum] = React.useState("");
  const [hata, setHata] = React.useState(false);
  const [kayitlar, setKayitlar] = React.useState([]);
  const [gonderiliyor, setGonderiliyor] = React.useState(false);

  React.useEffect(() => {
    const eskiKayitlar = JSON.parse(
      localStorage.getItem("sahaKayitlari") || "[]"
    );

    setKayitlar(eskiKayitlar);
    konumGetir();
  }, []);

  const konumGetir = () => {
    setDurum("GPS konumu alınıyor...");
    setHata(false);

    if (!navigator.geolocation) {
      setDurum("Bu cihaz GPS desteklemiyor. Konumsuz kayıt yapılabilir.");
      setHata(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setKonum({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });

        setDurum("GPS konumu alındı.");
        setHata(false);
      },
      () => {
        setKonum(null);
        setDurum("GPS alınamadı. Konumsuz kayıt yapılabilir.");
        setHata(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  };

  const kaydet = async () => {
    if (gonderiliyor) return;

    setGonderiliyor(true);

    if (!personel || !sayacId || !hidrantNo || !islem) {
      setDurum("Personel, Sayaç ID, Hidrant No ve yapılan iş zorunludur.");
      setHata(true);
      setGonderiliyor(false);
      return;
    }

    if (islem === "Tamir" && !aciklama.trim()) {
      setDurum("Tamir işlemi için açıklama zorunludur.");
      setHata(true);
      setGonderiliyor(false);
      return;
    }

    localStorage.setItem("personelAdi", personel);

    const simdi = new Date();

    const yeniKayit = {
      tarih: simdi.toLocaleDateString("tr-TR"),
      saat: simdi.toLocaleTimeString("tr-TR"),
      personel,
      sayacId,
      hidrantNo,
      islem,
      aciklama: islem === "Tamir" ? aciklama : "",
      konum: konum
        ? `${konum.lat.toFixed(6)}, ${konum.lng.toFixed(6)}`
        : "Konum alınamadı",
      fotograf: fotograf ? fotograf.name : "Fotoğraf yok",
    };

    const guncelKayitlar = [yeniKayit, ...kayitlar];

    setKayitlar(guncelKayitlar);

    localStorage.setItem("sahaKayitlari", JSON.stringify(guncelKayitlar));

    try {
      await fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        body: JSON.stringify(yeniKayit),
      });

      setDurum("Kayıt oluşturuldu ve Google Sheets'e gönderildi.");
      setHata(false);
    } catch (error) {
      console.log("Google Sheets gönderim hatası:", error);

      setDurum("Kayıt cihazda saklandı. Google Sheets'e gönderilemedi.");
      setHata(true);
    }

    setSayacId("");
    setHidrantNo("");
    setAciklama("");
    setFotograf(null);

    setTimeout(() => {
      setGonderiliyor(false);
    }, 3000);
  };

  return (
    <div className="app">
      <div className="card">
        <h1>Sulama Birliği Saha Kayıt</h1>

        <label>Personel</label>

        <select value={personel} onChange={(e) => setPersonel(e.target.value)}>
          {personelListesi.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>

        <label>Sayaç ID</label>

        <input
          type="text"
          value={sayacId}
          onChange={(e) => setSayacId(e.target.value)}
          placeholder="Sayaç ID girin"
        />

        <label>Hidrant No</label>

        <input
          type="text"
          value={hidrantNo}
          onChange={(e) => setHidrantNo(e.target.value)}
          placeholder="Hidrant No girin"
        />

        <label>Yapılan İş</label>

        <select value={islem} onChange={(e) => setIslem(e.target.value)}>
          {islemListesi.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>

        {islem === "Tamir" && (
          <>
            <label>Tamir Açıklaması</label>

            <textarea
              value={aciklama}
              onChange={(e) => setAciklama(e.target.value)}
              placeholder="Yapılan tamiri açıklayın"
              rows="4"
            />
          </>
        )}

        <label>Fotoğraf</label>

        <input
          type="file"
          accept="image/*"
          capture="environment"
          onChange={(e) => setFotograf(e.target.files[0])}
        />

        <div className="info">
          <div>
            <b>Tarih:</b> {new Date().toLocaleDateString("tr-TR")}
          </div>

          <div>
            <b>Saat:</b> {new Date().toLocaleTimeString("tr-TR")}
          </div>

          <div>
            <b>GPS:</b>{" "}
            {konum
              ? `${konum.lat.toFixed(6)}, ${konum.lng.toFixed(6)}`
              : "Alınmadı / konumsuz kayıt yapılabilir"}
          </div>
        </div>

        <button onClick={konumGetir} className="secondary">
          GPS KONUMU YENİLE
        </button>

        <button onClick={kaydet} disabled={gonderiliyor}>
          {gonderiliyor ? "KAYDEDİLİYOR..." : "ONAYLA"}
        </button>

        {durum && (
          <div className={hata ? "status error" : "status"}>{durum}</div>
        )}
      </div>
    </div>
  );
}