import ImportReview from "@/components/import/ImportReview";

export default async function ImportReviewPage({
  params,
}: {
  params: Promise<{ batchId: string }>;
}) {
  const { batchId } = await params;
  return <ImportReview batchId={Number(batchId)} />;
}
