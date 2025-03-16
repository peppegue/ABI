// frontend/app/analyze/page.js
// frontend/app/analyze/page.js
"use client";
import React, { useState } from "react";
import Layout from "../../app/layout";
import ExcelUploader from "../../components/ExcelUploader";
import AIDialog from "../../components/AIDialog";
import { Button } from "@mui/material";

export default function AnalyzePage() {
  const [data, setData] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleDataLoaded = (loadedData) => {
    setData(loadedData);
  };

  return (
    <Layout>
      <h1>Pagina di Analisi</h1>
      <ExcelUploader onDataLoaded={handleDataLoaded} />
      {data && (
        <>
          <p>Dati caricati: {JSON.stringify(data[0])}</p>
          <Button variant="contained" onClick={() => setDialogOpen(true)}>
            Avvia Analisi AI
          </Button>
        </>
      )}
      <AIDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        dataToAnalyze={data}
      />
    </Layout>
  );
}
