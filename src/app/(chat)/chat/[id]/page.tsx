import SplitLayout from "@/components/Blocks/Chat/SplitLayout/SplitLayout";

export default async function Home(props: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const { id } = params;
  const { mocked } = searchParams;
  return <SplitLayout key={id} chatId={id} mocked={mocked === "true"} />;
}
