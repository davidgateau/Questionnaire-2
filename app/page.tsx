'use client';
import { useState } from "react";
import { supabase } from "./supabaseClient";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

const axes = [
  "Intérêt/Plaisir",
  "Autonomie et liberté",
  "Collectif",
  "Equilibre (vie pro/vie perso)",
  "Expertise et création",
  "Statut/pouvoir et reconnaissance",
  "Rémunération",
  "Contribution sociale et sociétale / Alignement valeur",
];
const axesKeys = [
  "plaisir", "autonomie", "collectif", "equilibre",
  "expertise", "statut", "remuneration", "contribution"
];

export default function Home() {
  const [prenom, setPrenom] = useState("");
  const [values, setValues] = useState<number[]>(Array(8).fill(0));
  const [page, setPage] = useState<"form" | "result">("form");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [moyenne, setMoyenne] = useState<number[]>([]);
  const total = values.reduce((a, b) => a + b, 0);

  const handleChange = (i: number, v: string) => {
    const newVals = [...values];
    newVals[i] = parseInt(v) || 0;
    setValues(newVals);
  };

  const fetchMoyenne = async () => {
    let query = supabase.from("reponses").select(axesKeys.join(","));
    const { data, error } = await query;
    if (error || !data || !Array.isArray(data) || data.length === 0) return Array(8).fill(0);
    const nb = data.length;
    const sum = Array(8).fill(0);
    data.forEach((row: any) => {
      axesKeys.forEach((k, i) => {
        sum[i] += Number(row[k] || 0);
      });
    });
    return sum.map(s => +(s / nb).toFixed(2));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    if (!prenom) {
      setMessage("Merci d'indiquer votre prénom.");
      return;
    }
    if (total !== 10) {
      setMessage("Vous devez distribuer exactement 10 points.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.from("reponses").insert([{
      prenom,
      plaisir: values[0],
      autonomie: values[1],
      collectif: values[2],
      equilibre: values[3],
      expertise: values[4],
      statut: values[5],
      remuneration: values[6],
      contribution: values[7],
    }]);
    if (error) {
      setMessage("Erreur lors de l'enregistrement.");
      setLoading(false);
    } else {
      const moyenneAll = await fetchMoyenne();
      setMoyenne(moyenneAll);
      setPage("result");
      setLoading(false);
    }
  };

  const radarData = axes.map((axe, i) => ({
    dimension: axe,
    valeur: values[i],
    moyenne: moyenne[i] ?? 0,
  }));

  return (
    <div className="form-container">
      {page === "form" ? (
        <>
          <h1>Distribuer 10 points sur les axes prioritaires</h1>
          <div className="subtitle">
            Quels sont pour vous les axes qui pèsent le plus dans le choix du travail que vous exercez aujourd'hui ?
          </div>
          <form onSubmit={handleSubmit}>
            <div className="vertical-fields">
              <label>
                Prénom :
                <input type="text" value={prenom} onChange={e => setPrenom(e.target.value)} required />
              </label>
              <hr className="hrcolor"/>
              <div className="axes-block">
                {axes.map((axe, i) => (
                  <label key={axe} className="field-row">
                    <span>{axe} :</span>
                    <input
                      type="number"
                      min={0}
                      max={10}
                      value={values[i]}
                      onChange={e => handleChange(i, e.target.value)}
                    />
                  </label>
                ))}
              </div>
              <div className="total-points">
                Total points : <strong>{total}</strong> / 10
              </div>
              <button type="submit" disabled={total !== 10 || loading}>
                {loading ? "Envoi..." : "Valider"}
              </button>
              {message && (
                <div className={`msg${message.includes("erreur") || message.includes("Erreur") ? " error" : " success"}`}>{message}</div>
              )}
            </div>
          </form>
        </>
      ) : (
        <>
          <img
            src="/logofresquedutravail.jpg"
            alt="Logo Fresque du Travail"
            style={{ width: 110, margin: '8px auto 16px auto', display: "block" }}
          />
          <h1 style={{marginBottom:0, textAlign:'center'}}>Merci, votre réponse a été enregistrée !</h1>
          <h2 style={{marginTop:16, marginBottom:8, textAlign:'center', fontSize:'1.3rem'}}>
            Votre profil motivation (répartition)
          </h2>
          <div style={{width:'100%', maxWidth:430, height:340, margin:'auto'}}>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="dimension" tick={{ fontSize: 12, fontWeight: 500, fill: "#222" }} />
                <PolarRadiusAxis angle={30} domain={[0, 10]} tickCount={6} />
                <Radar
                  name={prenom}
                  dataKey="valeur"
                  stroke="#38bdf8"
                  fill="#60a5fa"
                  fillOpacity={0.44}
                  isAnimationActive={false}
                />
                {moyenne.length > 0 &&
                  <Radar
                    name="Moyenne des autres"
                    dataKey="moyenne"
                    stroke="#eab308"
                    fill="#fde68a"
                    fillOpacity={0.22}
                    isAnimationActive={false}
                  />
                }
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <div style={{marginTop:30, textAlign:'center'}}>
            <button onClick={() => { setPage("form"); setPrenom(""); setValues(Array(8).fill(0)); setMessage(""); }}>
              Recommencer
            </button>
          </div>
        </>
      )}
    </div>
  );
}
