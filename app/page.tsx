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
  const [message, setMessage] = useState("");
  const [showRadar, setShowRadar] = useState(false);

  const total = values.reduce((a, b) => a + b, 0);

  const handleChange = (i: number, v: string) => {
    const newVals = [...values];
    newVals[i] = parseInt(v) || 0;
    setValues(newVals);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowRadar(false);
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
      setShowRadar(false);
    } else {
      setMessage("Merci, votre réponse a été enregistrée !");
      setShowRadar(true);
    }
  };

  // Préparation des données pour le radar
  const radarData = axes.map((axe, i) => ({
    dimension: axe,
    valeur: values[i]
  }));

  return (
    <div className="form-container">
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
        <div className={`msg${message.includes("erreur") || message.includes("Erreur") ? " error" : message ? " success" : ""}`}>{message}</div>
      </form>

      {/* Affichage du radar si showRadar */}
      {showRadar && (
        <div style={{ marginTop: 40 }}>
          <h2 style={{ textAlign: 'center', fontSize: '1.25rem', marginBottom: 10 }}>Votre profil motivation (répartition)</h2>
          <ResponsiveContainer width="100%" aspect={1}>
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="dimension" tick={{ fontSize: 12, fontWeight: 500, fill: "#222" }} />
              <PolarRadiusAxis angle={30} domain={[0, 10]} tickCount={6} />
              <Radar name={prenom} dataKey="valeur" stroke="#4f74f5" fill="#4f74f5" fillOpacity={0.3} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
