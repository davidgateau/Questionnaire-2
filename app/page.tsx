'use client';
import { useState } from "react";
import { supabase } from "./supabaseClient";

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
  const total = values.reduce((a, b) => a + b, 0);

  const handleChange = (i: number, v: string) => {
    const newVals = [...values];
    newVals[i] = parseInt(v) || 0;
    setValues(newVals);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
      setMessage("Merci, votre réponse a été enregistrée !");
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 400, margin: "auto", padding: 16 }}>
      <h1>Questionnaire de motivation</h1>
      <label>
        Prénom :
        <input value={prenom} onChange={e => setPrenom(e.target.value)} required style={{ marginLeft: 8 }} />
      </label>
      <hr />
      {axes.map((axe, i) => (
        <div key={axe} style={{ margin: "8px 0" }}>
          <label>
            {axe} :
            <input
              type="number"
              min={0}
              max={10}
              value={values[i]}
              onChange={e => handleChange(i, e.target.value)}
              style={{ width: 40, marginLeft: 8 }}
            />
          </label>
        </div>
      ))}
      <div style={{ margin: "12px 0" }}>Total points : <strong>{total}</strong> / 10</div>
      <button type="submit" disabled={total !== 10}>Envoyer</button>
      <div style={{ color: 'red', marginTop: 8 }}>{message}</div>
    </form>
  );
}
