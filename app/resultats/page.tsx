'use client';
import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
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

export default function Resultats() {
  const [somme, setSomme] = useState<number[]>([]);
  const [nbParticipants, setNbParticipants] = useState<number>(0);

  async function fetchSomme() {
    let query = supabase.from("reponses").select(axesKeys.join(","));
    const { data, error } = await query;
    if (error || !data || !Array.isArray(data) || data.length === 0) {
      setSomme(Array(8).fill(0));
      setNbParticipants(0);
      return;
    }
    setNbParticipants(data.length);
    const sum = Array(8).fill(0);
    data.forEach((row: any) => {
      axesKeys.forEach((k, i) => {
        sum[i] += Number(row[k] || 0);
      });
    });
    setSomme(sum);
  }

  useEffect(() => {
    fetchSomme(); // Premier appel
    const interval = setInterval(fetchSomme, 3000); // Mise à jour toutes les 3s
    return () => clearInterval(interval);
  }, []);

  const radarData = axes.map((axe, i) => ({
    dimension: axe,
    total: somme[i] ?? 0,
  }));

  // Trouver le maximum pour ajuster l’échelle du radar
  const maxVal = Math.max(10, ...somme);

  return (
    <div className="resultats-container" style={{padding: 40}}>
      <img
        src="/logofresquedutravail.jpg"
        alt="Logo Fresque du Travail"
        style={{ width: 110, margin: '18px auto 24px auto', display: "block" }}
      />
      <h1 style={{textAlign:'center'}}>Résultats</h1>
      <div style={{textAlign:'center', fontWeight:'bold', fontSize:'1.1rem', margin:'12px 0'}}>
        Nombre de participants : {nbParticipants}
      </div>
      <div style={{width:'100%', maxWidth:480, height:380, margin:'auto'}}>
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
            <PolarGrid />
            <PolarAngleAxis dataKey="dimension" tick={{ fontSize: 12, fontWeight: 500, fill: "#222" }} />
            <PolarRadiusAxis angle={30} domain={[0, maxVal]} tickCount={6} />
            <Radar
              name="Somme"
              dataKey="total"
              stroke="#38bdf8"
              fill="#60a5fa"
              fillOpacity={0.44}
              isAnimationActive={false}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
