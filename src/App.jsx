	import React from "react";

const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbz4bQxlc3XhFGzKy66lUJwumhzKp8s-iJPbWk0cHJ6yDLEmvexKrY_ayANFN-PM1ZXG/exec";

export default function App() {
  const islemListesi = [
    "Vana Açma",
    "Pil Değişimi",
    "Hata 5",
    "Motor Değişimi",
    "Pirinç Vana Değişimi",
    "Ön Ekran Değişimi",
    "Arka Ekran Değişimi",
    "Kablo/Lehim Yenileme",
    "Mavi Hortum Değişimi",
    "Kaçak Tespiti",
    "Vana Kapatma",
  ];

  const [personel, setPersonel] = React.useState("");
  const [sayacId, setSayacId] = React.useState("");
  const [islem, setIslem] = React.useState(islemListesi[0]);
  const [konum, setKonum] = React.useState(null);
  const [fotograf, setFotograf] = React.useState(null);

  const [durum, setDurum] = React.useState("");
  const [hata, setHata] = React.useState(false);

  const [kayitlar, setKayitlar] = React.useState([]);

  const [yoneticiModu, setYoneticiModu] = React.useState(false);
  const [sifreInput, setSifreInput] = React.useState("");

  const YONETICI_SIFRE = "1245";

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
      setDurum("Bu cihaz GPS desteklemiyor.");
      setHata(true);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setKonum({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });

        setDurum("GPS konumu alındı.");
      },
      () => {
        setKonum(null);
        setDurum("GPS alınamadı. Konum izni verin.");
        setHata(true);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  };

  const kaydet = async () => {
    if (!personel || !sayacId || !islem) {
      setDurum("Tüm alanları doldurun.");
      setHata(true);
      return;
    }

    if (!konum) {
      setDurum("GPS konumu zorunludur.");
      setHata(true);
      return;
    }

    const simdi = new Date();

    const yeniKayit = {
      tarih: simdi.toLocaleDateString("tr-TR"),
      saat: simdi.toLocaleTimeString("tr-TR"),
      personel,
      sayacId,
      islem,
      konum: `${konum.lat.toFixed(6)}, ${konum.lng.toFixed(6)}`,
      fotograf: fotograf ? fotograf.name : "Fotoğraf yok",
    };

    const guncelKayitlar = [yeniKayit, ...kayitlar];

    setKayitlar(guncelKayitlar);

    localStorage.setItem(
      "sahaKayitlari",
      JSON.stringify(guncelKayitlar)
    );

    if (GOOGLE_SCRIPT_URL !== "GOOGLE_SCRIPT_URL_BURAYA") {
      try {
        await fetch(GOOGLE_SCRIPT_URL, {
          method: "POST",
          mode: "no-cors",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(yeniKayit),
        });
      } catch (error) {
        console.log("Google Sheets gönderim hatası:", error);
      }
    }

    setDurum("Kayıt oluşturuldu.");
    setHata(false);

    setSayacId("");
    setFotograf(null);
  };

  const yoneticiGirisi = () => {
    if (sifreInput === YONETICI_SIFRE) {
      setYoneticiModu(true);
      setDurum("Yönetici modu açıldı.");
      setHata(false);
    } else {
      setDurum("Şifre hatalı.");
      setHata(true);
    }
  };

  const csvIndir = () => {
    const basliklar = [
      "Tarih",
      "Saat",
      "Personel",
      "Sayaç ID",
      "İşlem",
      "GPS",
      "Fotoğraf",
    ];

    const satirlar = kayitlar.map((k) => [
      k.tarih,
      k.saat,
      k.personel,
      k.sayacId,
      k.islem,
      k.konum,
      k.fotograf,
    ]);

    const csv = [basliklar, ...satirlar]
      .map((row) =>
        row
          .map((cell) => `"${String(cell).replaceAll('"', '""')}"`)
          .join(";")
      )
      .join("\n");

    const blob = new Blob(
      ["\ufeff" + csv],
      { type: "text/csv;charset=utf-8;" }
    );

    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");

    a.href = url;
    a.download = "saha-kayitlari.csv";

    a.click();

    URL.revokeObjectURL(url);
  };

  const kayitlariTemizle = () => {
    if (!confirm("Tüm kayıtlar silinsin mi?")) return;

    localStorage.removeItem("sahaKayitlari");

    setKayitlar([]);
  };

  return (
    <div className="app">
      <div className="card">

        <h1>Sulama Birliği Saha Kayıt</h1>

        <label>Personel</label>

        <input
          type="text"
          value={personel}
          onChange={(e) => setPersonel(e.target.value)}
          placeholder="Personel adı"
        />

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
          value={sayacId}
          onChange={(e) => setSayacId(e.target.value)}
          placeholder="Hidrant No girin"
        />

        <label>Yapılan İş</label>

        <select
          value={islem}
          onChange={(e) => setIslem(e.target.value)}
        >
          {islemListesi.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>

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
              : "Alınmadı"}
          </div>
        </div>

        <button
          onClick={konumGetir}
          className="secondary"
        >
          GPS KONUMU YENİLE
        </button>

        <button
          onClick={kaydet}
          disabled={!konum}
        >
          ONAYLA
        </button>

        {durum && (
          <div className={hata ? "status error" : "status"}>
            {durum}
          </div>
        )}

        <div className="admin">

          {!yoneticiModu && (
            <>
              <label>Yönetici Şifresi</label>

              <input
                type="password"
                value={sifreInput}
                onChange={(e) => setSifreInput(e.target.value)}
                placeholder="Şifre"
              />

              <button
                onClick={yoneticiGirisi}
                className="secondary"
              >
                Yönetici Girişi
              </button>
            </>
          )}

          {yoneticiModu && (
            <>
              <h2>Yönetici Ekranı</h2>

              <div className="actions">
                <button
                  onClick={csvIndir}
                  className="secondary"
                >
                  CSV İndir
                </button>

                <button
                  onClick={kayitlariTemizle}
                  className="secondary"
                >
                  Temizle
                </button>
              </div>

              {kayitlar.length === 0 && (
                <p>Henüz kayıt yok.</p>
              )}

              {kayitlar.map((k, index) => (
                <div className="record" key={index}>
                  <div>
                    <b>{k.islem}</b>
                  </div>

                  <div>Personel: {k.personel}</div>

                  <div>Sayaç ID: {k.sayacId}</div>

                  <div>
                    {k.tarih} - {k.saat}
                  </div>

                  <div>GPS: {k.konum}</div>

                  <div>Fotoğraf: {k.fotograf}</div>
                </div>
              ))}
            </>
          )}

        </div>
      </div>
    </div>
  );
}