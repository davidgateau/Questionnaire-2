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

export default function Home() {
  const [prenom, setPrenom] = useState("");
  const [values, setValues] = useState<number[]>(Array(8).fill(0));
  const [page, setPage] = useState<"form" | "result">("form");
  const [message, setMessage] = useState("");

  const total = values.reduce((a, b) => a + b, 0);

  const handleChange = (i: number, v: string) => {
    const newVals = [...values];
    newVals[i] = parseInt(v) || 0;
    setValues(newVals);
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
    } else {
      setPage("result");
    }
  };

  const radarData = axes.map((axe, i) => ({
    dimension: axe,
    valeur: values[i]
  }));

  return (
    <div className="form-container">
      {page === "form" ? (
        <>
          <h1>Questionnaire de motivation</h1>
          <form onSubmit={handleSubmit}>
            <label>
              Prénom :
              <input type="text" value={prenom} onChange={e => setPrenom(e.target.value)} required />
            </label>
            <hr style={{margin:'18px 0'}}/>
            {axes.map((axe, i) => (
              <label key={axe}>
                {axe} :
                <input
                  type="number"
                  min={0}
                  max={10}
                  value={values[i]}
                  onChange={e => handleChange(i, e.target.value)}
                />
              </label>
            ))}
            <div style={{ margin: "16px 0", textAlign: 'center' }}>Total points : <strong>{total}</strong> / 10</div>
            <button type="submit" disabled={total !== 10}>Envoyer</button>
            {message && (
              <div className={`msg${message.includes("erreur") || message.includes("Erreur") ? " error" : " success"}`}>{message}</div>
            )}
          </form>
        </>
      ) : (
        <>
          <div style={{display:'flex', flexDirection:'column', alignItems:'center', gap:20}}>
            {/* Logo Fresque du Climat */}
            <img
              src="/logo-fresque.png"
              alt="Logo Fresque du Climat"
              style={{ width: 110, margin: '8px auto 16px auto', display: "block" }}
            />
            <h1 style={{marginBottom:0}}>Merci, votre réponse a été enregistrée !</h1>
            <h2 style={{marginTop:16, marginBottom:8, textAlign:'center', fontSize:'1.3rem'}}>Votre profil motivation (répartition)</h2>
            <div style={{width:'100%', maxWidth:420, height:350, margin:'auto'}}>
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="dimension" tick={{ fontSize: 13, fontWeight: 500, fill: "#222" }} />
                  <PolarRadiusAxis angle={30} domain={[0, 10]} tickCount={6} />
                  <Radar name={prenom} dataKey="valeur" stroke="#38bdf8" fill="#60a5fa" fillOpacity={0.45} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
