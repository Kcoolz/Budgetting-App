import PageIntro from "../components/PageIntro";
import TransactionsPanel from "../components/TransactionsPanel";

export default function TransactionsPage({ transactionProps }) {
  const business = transactionProps.profileType === "business";
  return (
    <>
      <PageIntro eyebrow={business ? "Business ledger" : "Transactions"} title={business ? "Every entry ready for review." : "Every dollar, accounted for."} description={business ? "Record revenue and operating expenses, then keep business classifications accurate for clearer reporting." : "Quick-add expenses, review new activity, and keep categories accurate."} />
      <TransactionsPanel {...transactionProps} />
    </>
  );
}
