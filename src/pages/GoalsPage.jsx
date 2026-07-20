import GoalsPanel from "../components/GoalsPanel";
import PageIntro from "../components/PageIntro";

export default function GoalsPage({ goals, currency, onAdd, onAssign, onEdit, onDelete, profileType = "personal" }) {
  const business = profileType === "business";
  return (
    <>
      <PageIntro eyebrow={business ? "Business reserves" : "Savings goals"} title={business ? "Build resilience into the business." : "Save for what matters."} description={business ? "Set aside capital for taxes, equipment, hiring, and the unexpected without mixing it into operating cash." : "Build dedicated reserves and keep assigned money out of your everyday spending allowance."} />
      <GoalsPanel goals={goals} currency={currency} onAdd={onAdd} onAssign={onAssign} onEdit={onEdit} onDelete={onDelete} profileType={profileType} />
    </>
  );
}
