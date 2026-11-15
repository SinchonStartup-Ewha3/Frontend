import PaddingIndexModal from "../../components/PaddingIndexModal.jsx";

export default function PaddingIndexPreview() {
  return (
    <main className="min-h-screen bg-[#e7e7e7]">
      <PaddingIndexModal
        isOpen
        index={21}
        onClose={() => {}}
        onDismissForToday={() => {}}
      />
    </main>
  );
}
