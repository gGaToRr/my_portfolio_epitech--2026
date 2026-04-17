import React from 'react';

const ObjectiveDetails = ({ objId }) => {
  const content = {
    1: { title: "Infra & Network", color: "#61dafb", text: "Détails sur le routage, switch et serveurs..." },
    2: { title: "Cloud Experience", color: "#FFD700", text: "Détails sur Docker, Kubernetes et AWS..." },
    3: { title: "AI Research", color: "#a855f7", text: "Détails sur les LLM et le Deep Learning..." },
    4: { title: "Project Management", color: "#09ff00", text: "Détails sur Agile, Scrum et Jira..." }
  };

  const data = content[objId];

  return (
    <div className="full-width-details" data-id={objId}>
      <style>{`
        .full-width-details {
          width: 100%;
          margin-top: 5px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid ${data.color}55;
          border-radius: 12px;
          padding: 20px;
          backdrop-filter: blur(15px);
          box-shadow: 0 10px 30px rgba(0,0,0,0.3);
          opacity: 0;
        }

        .full-width-details h3 {
          color: ${data.color};
          font-size: 1.3rem;
          margin-bottom: 10px;
        }

        .full-width-details p {
          color: #ccc;
          line-height: 1.6;
        }

      `}</style>

      <h3>{data.title}</h3>
      <div className="details-grid">
         <p>{data.text}</p>
         {/* Tu peux rajouter tes listes <ul> ici */}
      </div>
    </div>
  );
};

export default ObjectiveDetails;