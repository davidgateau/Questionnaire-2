'use client';
import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient"; // <-- CHEMIN CORRIGÉ

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
  const [moyenne, setMoyenne] = useState<number[]>([]);

  async function fetchMoyenne() {
    let query = supabase.from("reponses").select(axesKeys.join(","));
    const { data, error } = await query;
    if (error || !data || !Array.isArray(data) || data.length === 0) return setMoyenne(Array(8).fill(0));
    const nb = data.length;
    const sum = Array(8).fill(0);
    data.forEach((row: any) => {
      axesKeys.forEach((k, i) => {
        sum[i] += Number(row[k] || 0);
      });
    });
    setMoyenne(sum.map(s => +(s / nb).toFixed(2)));
  }

  useEffect(() => {
    fetchMoyenne(); // Premier appel
    const interval = setInterval(fetchMoyenne, 3000); // Mise à jour toutes les 3s
    return () => clearInterval(interval);
  }, []);

  const radarData = axes.map((axe, i) => ({
    dimension: axe,
    moyenne: moyenne[i] ?? 0,
  }));

  return (
    <div className="resultats-container" style={{padding: 40}}>
      <h1 style={{textAlign:'center'}}>Moyenne en direct des participants</h1>
      <div style={{width:'100%', maxWidth:480, height:380, margin:'auto'}}>
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
            <PolarGrid />
            <PolarAngleAxis dataKey="dimension" tick={{ fontSize: 12, fontWeight: 500, fill: "#222" }} />
            <PolarRadiusAxis angle={30} domain={[0, 10]} tickCount={6} />
            <Radar
              name="Moyenne"
              dataKey="moyenne"
              stroke="#eab308"
              fill="#fde68a"
              fillOpacity={0.38}
              isAnimationActive={false}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
